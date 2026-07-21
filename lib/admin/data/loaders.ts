import "server-only";

import { resolveEffectivePlan } from "@/lib/permissions/effectivePlan";
import {
  buildServerPlanAccessContext,
  formatEffectivePlanSourceLabel,
} from "@/lib/permissions/serverPlanAccess";
import { isGrantLogicallyExpired } from "@/lib/plan-grants/grantAccess";
import { loadLatestPlanGrantForUser } from "@/lib/plan-grants/loadActiveGrant";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildPaginationMeta,
  parsePagination,
  type PaginationInput,
} from "@/lib/admin/pagination";
import type {
  AdminAnalyticsSnapshot,
  AdminHouseholdDetail,
  AdminHouseholdSummary,
  AdminSubscriptionRow,
  AdminSystemHealth,
  AdminUserDetail,
  AdminUserSummary,
} from "@/lib/admin/types";
import {
  getEmailFromAddress,
  getEmailReplyToAddress,
  getSupportEmailTo,
  isResendConfigured,
} from "@/lib/email/resend";
import type { AdminConfigCheck } from "@/lib/admin/types";
import {
  isMissingAdminControlsSchema,
  normalizeAdminAccountStatus,
} from "@/lib/admin/data/schemaFallback";

function normalizePlan(value: string | null | undefined) {
  const plan =
    value?.trim().toLowerCase() || "free";

  if (plan === "pro" || plan === "family") {
    return plan;
  }

  return "free";
}

async function getAuthMap(
  admin: ReturnType<typeof createAdminClient>,
  userIds: string[]
) {
  const uniqueIds = [
    ...new Set(userIds.filter(Boolean)),
  ];

  const entries = await Promise.all(
    uniqueIds.map(async (id) => {
      const { data } =
        await admin.auth.admin.getUserById(id);

      return [
        id,
        {
          email: data.user?.email ?? null,
          createdAt:
            data.user?.created_at ?? null,
          lastSignInAt:
            data.user?.last_sign_in_at ??
            null,
        },
      ] as const;
    })
  );

  return new Map(entries);
}

type AdminProfileListRow = {
  id: string;
  full_name: string | null;
  is_admin: boolean | null;
  created_at: string | null;
  account_status?: string | null;
};

async function loadAdminProfileListRows(
  admin: ReturnType<typeof createAdminClient>,
  options: {
    pagination: ReturnType<typeof parsePagination>;
    q?: string;
    admin?: string;
  }
) {
  const buildQuery = (
    select: string
  ) => {
    let query = admin
      .from("profiles")
      .select(select, { count: "exact" })
      .order("created_at", {
        ascending: false,
      });

    if (options.admin === "true") {
      query = query.eq("is_admin", true);
    }

    if (options.admin === "false") {
      query = query.eq("is_admin", false);
    }

    if (options.q?.trim()) {
      const term = `%${options.q.trim()}%`;
      query = query.or(
        `full_name.ilike.${term},id.eq.${options.q.trim()}`
      );
    }

    return query.range(
      options.pagination.from,
      options.pagination.to
    );
  };

  const withControls = await buildQuery(
    "id, full_name, is_admin, account_status, created_at"
  );

  if (!withControls.error) {
    return {
      rows:
        (withControls.data ??
          []) as unknown as AdminProfileListRow[],
      count: withControls.count,
      hasAccountStatus: true,
    };
  }

  if (
    !isMissingAdminControlsSchema(
      withControls.error
    )
  ) {
    throw withControls.error;
  }

  const base = await buildQuery(
    "id, full_name, is_admin, created_at"
  );

  if (base.error) {
    throw base.error;
  }

  return {
    rows:
      (base.data ?? []) as unknown as AdminProfileListRow[],
    count: base.count,
    hasAccountStatus: false,
  };
}

type AdminProfileDetailRow = AdminProfileListRow & {
  deactivated_at?: string | null;
  deactivation_reason?: string | null;
};

async function loadAdminProfileDetailRow(
  admin: ReturnType<typeof createAdminClient>,
  userId: string
): Promise<AdminProfileDetailRow | null> {
  const withControls = await admin
    .from("profiles")
    .select(
      "id, full_name, is_admin, account_status, deactivated_at, deactivation_reason, created_at"
    )
    .eq("id", userId)
    .maybeSingle();

  if (!withControls.error) {
    return withControls.data as AdminProfileDetailRow | null;
  }

  if (
    !isMissingAdminControlsSchema(
      withControls.error
    )
  ) {
    throw withControls.error;
  }

  const base = await admin
    .from("profiles")
    .select(
      "id, full_name, is_admin, created_at"
    )
    .eq("id", userId)
    .maybeSingle();

  if (base.error) {
    throw base.error;
  }

  return base.data as AdminProfileDetailRow | null;
}

async function loadLatestDeletionJobForUser(
  admin: ReturnType<typeof createAdminClient>,
  userId: string
) {
  const { data, error } = await admin
    .from("admin_account_deletion_jobs")
    .select(
      "id, status, current_step, safe_error_message"
    )
    .eq("target_user_id", userId)
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (!error) {
    return data;
  }

  if (isMissingAdminControlsSchema(error)) {
    return null;
  }

  throw error;
}

export async function loadAdminUsers(options: {
  pagination?: PaginationInput;
  q?: string;
  plan?: string;
  admin?: string;
}) {
  const admin = createAdminClient();
  const pagination = parsePagination(
    options.pagination ?? {}
  );

  const {
    rows: profileRows,
    count,
    hasAccountStatus,
  } = await loadAdminProfileListRows(
    admin,
    {
      pagination,
      q: options.q,
      admin: options.admin,
    }
  );

  const userIds = profileRows.map(
    (row) => row.id
  );

  const authMap = await getAuthMap(
    admin,
    userIds
  );

  const [
    subscriptionsResult,
    membershipsResult,
    deviceCounts,
    documentCounts,
    ticketCounts,
  ] = await Promise.all([
    admin
      .from("user_subscriptions")
      .select(
        "user_id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_end"
      )
      .in("user_id", userIds),

    admin
      .from("household_members")
      .select(
        "user_id, household_id, role"
      )
      .in("user_id", userIds),

    Promise.all(
      userIds.map(async (userId) => {
        const { count: deviceCount } =
          await admin
            .from("devices")
            .select("id", {
              count: "exact",
              head: true,
            })
            .eq("user_id", userId);

        return [userId, deviceCount ?? 0] as const;
      })
    ),

    Promise.all(
      userIds.map(async (userId) => {
        const { count: documentCount } =
          await admin
            .from("documents")
            .select("id", {
              count: "exact",
              head: true,
            })
            .eq("user_id", userId);

        return [
          userId,
          documentCount ?? 0,
        ] as const;
      })
    ),

    Promise.all(
      userIds.map(async (userId) => {
        const { count: ticketCount } =
          await admin
            .from("support_tickets")
            .select("id", {
              count: "exact",
              head: true,
            })
            .eq("user_id", userId);

        return [userId, ticketCount ?? 0] as const;
      })
    ),
  ]);

  const subscriptionMap = new Map(
    (subscriptionsResult.data ?? []).map(
      (row) => [row.user_id, row]
    )
  );

  const membershipMap = new Map(
    (membershipsResult.data ?? []).map(
      (row) => [row.user_id, row]
    )
  );

  const deviceMap = new Map(deviceCounts);
  const documentMap = new Map(documentCounts);
  const ticketMap = new Map(ticketCounts);

  let users: AdminUserSummary[] =
    profileRows.map((profile) => {
      const auth = authMap.get(profile.id);
      const subscription =
        subscriptionMap.get(profile.id);
      const membership =
        membershipMap.get(profile.id);

      return {
        id: profile.id,
        email: auth?.email ?? null,
        fullName:
          profile.full_name?.trim() || null,
        createdAt:
          profile.created_at ??
          auth?.createdAt ??
          null,
        lastSignInAt:
          auth?.lastSignInAt ?? null,
        personalPlan: normalizePlan(
          subscription?.plan
        ),
        subscriptionStatus:
          subscription?.status?.trim().toLowerCase() ||
          "inactive",
        isPlatformAdmin:
          profile.is_admin === true,
        accountStatus: hasAccountStatus
          ? normalizeAdminAccountStatus(
              profile.account_status
            )
          : "active",
        householdId:
          membership?.household_id ?? null,
        householdRole:
          membership?.role ?? null,
        deviceCount:
          deviceMap.get(profile.id) ?? 0,
        documentCount:
          documentMap.get(profile.id) ?? 0,
        supportTicketCount:
          ticketMap.get(profile.id) ?? 0,
      };
    });

  if (options.plan) {
    users = users.filter(
      (user) =>
        user.personalPlan === options.plan
    );
  }

  return {
    users,
    pagination: buildPaginationMeta(
      count ?? users.length,
      pagination
    ),
  };
}

export async function loadAdminUserDetail(
  userId: string
): Promise<AdminUserDetail | null> {
  const admin = createAdminClient();

  const profile =
    await loadAdminProfileDetailRow(
      admin,
      userId
    );

  if (!profile) {
    return null;
  }

  const hasAccountStatus =
    "account_status" in profile;

  const authMap = await getAuthMap(admin, [
    userId,
  ]);
  const auth = authMap.get(userId);

  const [
    subscriptionResult,
    membershipResult,
    ownedHouseholdResult,
    deviceCountResult,
    documentCountResult,
    ticketCountResult,
  ] = await Promise.all([
    admin
      .from("user_subscriptions")
      .select(
        "plan, status, stripe_customer_id, stripe_subscription_id, current_period_end"
      )
      .eq("user_id", userId)
      .maybeSingle(),

    admin
      .from("household_members")
      .select(
        "household_id, role"
      )
      .eq("user_id", userId)
      .maybeSingle(),

    admin
      .from("households")
      .select("id, name")
      .eq("owner_id", userId)
      .maybeSingle(),

    admin
      .from("devices")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", userId),

    admin
      .from("documents")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", userId),

    admin
      .from("support_tickets")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", userId),
  ]);

  const deletionJob =
    await loadLatestDeletionJobForUser(
      admin,
      userId
    );

  let ownedHouseholdMemberCount = 0;

  if (ownedHouseholdResult.data?.id) {
    const { count } = await admin
      .from("household_members")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "household_id",
        ownedHouseholdResult.data.id
      );

    ownedHouseholdMemberCount = count ?? 0;
  }

  let householdName: string | null = null;
  let householdOwnerId: string | null = null;
  let householdOwnerPlan:
    | "free"
    | "pro"
    | "family"
    | null = null;
  let householdOwnerStatus:
    | string
    | null = null;
  let householdOwnerCurrentPeriodEnd:
    | string
    | null = null;
  let householdOwnerName:
    | string
    | null = null;

  if (membershipResult.data?.household_id) {
    const { data: household } = await admin
      .from("households")
      .select("id, name, owner_id")
      .eq(
        "id",
        membershipResult.data.household_id
      )
      .maybeSingle();

    householdName = household?.name ?? null;
    householdOwnerId =
      household?.owner_id ?? null;

    if (householdOwnerId) {
      const [
        ownerSubscription,
        ownerProfile,
      ] = await Promise.all([
        admin
          .from("user_subscriptions")
          .select(
            "plan, status, current_period_end"
          )
          .eq("user_id", householdOwnerId)
          .maybeSingle(),

        admin
          .from("profiles")
          .select("full_name")
          .eq("id", householdOwnerId)
          .maybeSingle(),
      ]);

      householdOwnerPlan = normalizePlan(
        ownerSubscription.data?.plan
      ) as "free" | "pro" | "family";
      householdOwnerStatus =
        ownerSubscription.data?.status?.trim().toLowerCase() ||
        "inactive";
      householdOwnerCurrentPeriodEnd =
        ownerSubscription.data
          ?.current_period_end ?? null;
      householdOwnerName =
        ownerProfile.data?.full_name?.trim() ??
        null;
    }
  }

  const personalPlan = normalizePlan(
    subscriptionResult.data?.plan
  ) as "free" | "pro" | "family";

  let effective = resolveEffectivePlan({
    isDemo: false,
    isPlatformAdmin:
      profile.is_admin === true,
    userId,
    personalPlan,
    personalStatus:
      subscriptionResult.data?.status?.trim().toLowerCase() ||
      "inactive",
    personalCurrentPeriodEnd:
      subscriptionResult.data
        ?.current_period_end ?? null,
    hasPersonalStripeCustomer: Boolean(
      subscriptionResult.data
        ?.stripe_customer_id
    ),
    householdId:
      membershipResult.data?.household_id ??
      null,
    householdOwnerId,
    householdOwnerPlan,
    householdOwnerStatus,
    householdOwnerCurrentPeriodEnd,
    householdOwnerName,
    rawHouseholdRole:
      (membershipResult.data?.role as
        | "owner"
        | "admin"
        | "member"
        | "viewer"
        | null) ?? null,
    adminGrant: null,
  });

  let inheritedOnly = effective;
  let latestGrant: Awaited<
    ReturnType<typeof loadLatestPlanGrantForUser>
  > = null;

  try {
    const [planAccessContext, grant] =
      await Promise.all([
        buildServerPlanAccessContext(
          admin,
          userId
        ),
        loadLatestPlanGrantForUser(
          admin,
          userId
        ),
      ]);

    latestGrant = grant;
    effective = planAccessContext.result;
    inheritedOnly = resolveEffectivePlan({
      ...planAccessContext.input,
      adminGrant: null,
    });
  } catch (planAccessError) {
    console.error(
      "Admin user plan access lookup failed; falling back without grants:",
      planAccessError
    );
  }

  const grantDisplayStatus = latestGrant
    ? isGrantLogicallyExpired(latestGrant)
      ? "expired"
      : latestGrant.status
    : null;

  let foundingMemberNumber: number | null = null;
  let foundingMemberStatus:
    | "active"
    | "removed"
    | null = null;
  let foundingMemberEnrolledAt:
    | string
    | null = null;
  let foundingMemberBenefitMode:
    | string
    | null = null;
  let foundingMemberPlanGrantId:
    | string
    | null = null;

  try {
    const { data: foundingMember } = await admin
      .from("platform_founding_members")
      .select(
        "member_number, status, enrolled_at, benefit_mode, plan_grant_id"
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (foundingMember) {
      foundingMemberNumber =
        foundingMember.member_number;
      foundingMemberStatus =
        foundingMember.status === "removed"
          ? "removed"
          : "active";
      foundingMemberEnrolledAt =
        foundingMember.enrolled_at;
      foundingMemberBenefitMode =
        foundingMember.benefit_mode;
      foundingMemberPlanGrantId =
        foundingMember.plan_grant_id;
    }
  } catch (foundingMemberError) {
    console.warn(
      "Founding member lookup unavailable:",
      foundingMemberError
    );
  }

  return {
    id: profile.id,
    email: auth?.email ?? null,
    fullName:
      profile.full_name?.trim() || null,
    createdAt:
      profile.created_at ??
      auth?.createdAt ??
      null,
    lastSignInAt:
      auth?.lastSignInAt ?? null,
    personalPlan,
    subscriptionStatus:
      subscriptionResult.data?.status?.trim().toLowerCase() ||
      "inactive",
    isPlatformAdmin:
      profile.is_admin === true,
    accountStatus: hasAccountStatus
      ? normalizeAdminAccountStatus(
          profile.account_status
        )
      : "active",
    householdId:
      membershipResult.data?.household_id ??
      null,
    householdRole:
      membershipResult.data?.role ?? null,
    deviceCount:
      deviceCountResult.count ?? 0,
    documentCount:
      documentCountResult.count ?? 0,
    supportTicketCount:
      ticketCountResult.count ?? 0,
    effectivePlan: effective.effectivePlan,
    effectivePlanSource:
      formatEffectivePlanSourceLabel(
        effective.effectivePlanSource
      ),
    inheritedHouseholdPlan:
      inheritedOnly.inheritsFamilyPlan
        ? "family"
        : null,
    hasActiveAdminGrant:
      effective.hasActiveAdminGrant,
    adminGrantPlan:
      latestGrant?.plan ?? null,
    adminGrantStatus: grantDisplayStatus,
    adminGrantExpiresAt:
      latestGrant?.expiresAt ?? null,
    adminGrantReason:
      latestGrant?.reason ?? null,
    adminGrantNotes:
      latestGrant?.notes ?? null,
    adminGrantId:
      latestGrant?.id ?? null,
    householdName,
    stripeCustomerId:
      subscriptionResult.data
        ?.stripe_customer_id ?? null,
    stripeSubscriptionId:
      subscriptionResult.data
        ?.stripe_subscription_id ?? null,
    currentPeriodEnd:
      subscriptionResult.data
        ?.current_period_end ?? null,
    deactivatedAt: hasAccountStatus
      ? profile.deactivated_at ?? null
      : null,
    deactivationReason: hasAccountStatus
      ? profile.deactivation_reason ?? null
      : null,
    ownedHouseholdId:
      ownedHouseholdResult.data?.id ?? null,
    ownedHouseholdName:
      ownedHouseholdResult.data?.name ?? null,
    ownedHouseholdMemberCount,
    deletionJobId: deletionJob?.id ?? null,
    deletionJobStatus:
      deletionJob?.status ?? null,
    deletionJobStep:
      deletionJob?.current_step ?? null,
    deletionJobError:
      deletionJob?.safe_error_message ??
      null,
    foundingMemberNumber,
    foundingMemberStatus,
    foundingMemberEnrolledAt,
    foundingMemberBenefitMode,
    foundingMemberPlanGrantId,
  };
}

export async function loadAdminHouseholds(options: {
  pagination?: PaginationInput;
  q?: string;
}) {
  const admin = createAdminClient();
  const pagination = parsePagination(
    options.pagination ?? {}
  );

  let query = admin
    .from("households")
    .select(
      "id, name, owner_id, created_at",
      { count: "exact" }
    )
    .order("created_at", {
      ascending: false,
    });

  if (options.q?.trim()) {
    const term = `%${options.q.trim()}%`;
    query = query.or(
      `name.ilike.${term},id.eq.${options.q.trim()}`
    );
  }

  const { data, error, count } =
    await query.range(
      pagination.from,
      pagination.to
    );

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const ownerIds = rows.map(
    (row) => row.owner_id
  );

  const authMap = await getAuthMap(
    admin,
    ownerIds
  );

  const households: AdminHouseholdSummary[] =
    await Promise.all(
      rows.map(async (household) => {
        const [
          membersCount,
          ownerSubscription,
          ownerProfile,
          deviceCount,
          documentCount,
          openTickets,
        ] = await Promise.all([
          admin
            .from("household_members")
            .select("id", {
              count: "exact",
              head: true,
            })
            .eq(
              "household_id",
              household.id
            ),

          admin
            .from("user_subscriptions")
            .select("plan, status")
            .eq(
              "user_id",
              household.owner_id
            )
            .maybeSingle(),

          admin
            .from("profiles")
            .select("full_name")
            .eq("id", household.owner_id)
            .maybeSingle(),

          admin
            .from("devices")
            .select("id", {
              count: "exact",
              head: true,
            })
            .eq(
              "household_id",
              household.id
            ),

          admin
            .from("documents")
            .select("id", {
              count: "exact",
              head: true,
            })
            .eq(
              "household_id",
              household.id
            ),

          admin
            .from("support_tickets")
            .select("id", {
              count: "exact",
              head: true,
            })
            .eq(
              "household_id",
              household.id
            )
            .in("status", [
              "new",
              "open",
              "in_progress",
              "waiting_on_customer",
            ]),
        ]);

        const ownerAuth = authMap.get(
          household.owner_id
        );

        return {
          id: household.id,
          name: household.name,
          ownerId: household.owner_id,
          ownerName:
            ownerProfile.data?.full_name?.trim() ||
            null,
          ownerEmail:
            ownerAuth?.email ?? null,
          memberCount:
            membersCount.count ?? 0,
          inheritedPlan: normalizePlan(
            ownerSubscription.data?.plan
          ),
          createdAt: household.created_at,
          deviceCount: deviceCount.count ?? 0,
          documentCount:
            documentCount.count ?? 0,
          openSupportTickets:
            openTickets.count ?? 0,
        };
      })
    );

  return {
    households,
    pagination: buildPaginationMeta(
      count ?? households.length,
      pagination
    ),
  };
}

export async function loadAdminHouseholdDetail(
  householdId: string
): Promise<AdminHouseholdDetail | null> {
  const admin = createAdminClient();

  const { data: household, error } = await admin
    .from("households")
    .select(
      "id, name, owner_id, created_at"
    )
    .eq("id", householdId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!household) {
    return null;
  }

  const list = await loadAdminHouseholds({
    pagination: { page: 1, limit: 1 },
    q: household.id,
  });

  const summary =
    list.households.find(
      (entry) => entry.id === household.id
    ) ??
    ({
      id: household.id,
      name: household.name,
      ownerId: household.owner_id,
      ownerName: null,
      ownerEmail: null,
      memberCount: 0,
      inheritedPlan: "free",
      createdAt: household.created_at,
      deviceCount: 0,
      documentCount: 0,
      openSupportTickets: 0,
    } satisfies AdminHouseholdSummary);

  return loadMembersForHousehold(summary);
}

async function loadMembersForHousehold(
  summary: AdminHouseholdSummary
): Promise<AdminHouseholdDetail> {
  const admin = createAdminClient();

  const { data: members } = await admin
    .from("household_members")
    .select(
      "user_id, role, joined_at"
    )
    .eq("household_id", summary.id)
    .order("joined_at", {
      ascending: true,
    });

  const memberIds =
    members?.map((member) => member.user_id) ??
    [];

  const authMap = await getAuthMap(
    admin,
    memberIds
  );

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name")
    .in("id", memberIds);

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [
      profile.id,
      profile.full_name,
    ])
  );

  return {
    ...summary,
    members: (members ?? []).map(
      (member) => ({
        userId: member.user_id,
        email:
          authMap.get(member.user_id)
            ?.email ?? null,
        fullName:
          profileMap
            .get(member.user_id)
            ?.trim() || null,
        role: member.role,
        joinedAt: member.joined_at,
      })
    ),
  };
}

export async function loadAdminSubscriptions(options: {
  pagination?: PaginationInput;
  plan?: string;
  status?: string;
  q?: string;
}) {
  const admin = createAdminClient();
  const pagination = parsePagination(
    options.pagination ?? {}
  );

  let query = admin
    .from("user_subscriptions")
    .select(
      "user_id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_end",
      { count: "exact" }
    )
    .order("current_period_end", {
      ascending: false,
      nullsFirst: false,
    });

  if (options.plan) {
    query = query.eq("plan", options.plan);
  }

  if (options.status) {
    query = query.eq("status", options.status);
  }

  const { data, error, count } =
    await query.range(
      pagination.from,
      pagination.to
    );

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const userIds = rows.map(
    (row) => row.user_id
  );

  const authMap = await getAuthMap(
    admin,
    userIds
  );

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name")
    .in("id", userIds);

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [
      profile.id,
      profile.full_name,
    ])
  );

  const { data: memberships } = await admin
    .from("household_members")
    .select(
      "user_id, household_id, role"
    )
    .in("user_id", userIds);

  const membershipMap = new Map(
    (memberships ?? []).map((row) => [
      row.user_id,
      row,
    ])
  );

  const householdIds = [
    ...new Set(
      (memberships ?? []).map(
        (row) => row.household_id
      )
    ),
  ];

  const householdsResult =
    householdIds.length > 0
      ? await admin
          .from("households")
          .select("id, owner_id")
          .in("id", householdIds)
      : { data: [] as Array<{ id: string; owner_id: string }> };

  const households = householdsResult.data ?? [];

  const householdOwnerMap = new Map(
    (households ?? []).map(
      (household) => [
        household.id,
        household.owner_id,
      ]
    )
  );

  let subscriptions: AdminSubscriptionRow[] =
    await Promise.all(
      rows.map(async (row) => {
        const membership =
          membershipMap.get(row.user_id);
        const householdId =
          membership?.household_id ?? null;
        const householdOwnerId = householdId
          ? householdOwnerMap.get(
              householdId
            ) ?? null
          : null;

        let effectivePlan = normalizePlan(
          row.plan
        );
        let billingSource:
          | "personal"
          | "inherited_family" = "personal";

        if (
          householdId &&
          householdOwnerId &&
          householdOwnerId !== row.user_id
        ) {
          const { data: ownerSub } =
            await admin
              .from("user_subscriptions")
              .select("plan, status")
              .eq(
                "user_id",
                householdOwnerId
              )
              .maybeSingle();

          const ownerPlan = normalizePlan(
            ownerSub?.plan
          );
          const ownerStatus =
            ownerSub?.status
              ?.trim()
              .toLowerCase() || "inactive";

          if (
            ownerPlan === "family" &&
            ["active", "trialing"].includes(
              ownerStatus
            )
          ) {
            effectivePlan = "family";
            billingSource = "inherited_family";
          }
        }

        return {
          userId: row.user_id,
          email:
            authMap.get(row.user_id)
              ?.email ?? null,
          fullName:
            profileMap
              .get(row.user_id)
              ?.trim() || null,
          personalPlan: normalizePlan(
            row.plan
          ),
          status:
            row.status
              ?.trim()
              .toLowerCase() || "inactive",
          stripeCustomerId:
            row.stripe_customer_id,
          stripeSubscriptionId:
            row.stripe_subscription_id,
          currentPeriodEnd:
            row.current_period_end,
          effectivePlan,
          billingSource,
          householdId,
          householdOwnerId,
        };
      })
    );

  if (options.q?.trim()) {
    const needle =
      options.q.trim().toLowerCase();

    subscriptions = subscriptions.filter(
      (row) =>
        row.email
          ?.toLowerCase()
          .includes(needle) ||
        row.fullName
          ?.toLowerCase()
          .includes(needle) ||
        row.userId
          .toLowerCase()
          .includes(needle)
    );
  }

  return {
    subscriptions,
    pagination: buildPaginationMeta(
      count ?? subscriptions.length,
      pagination
    ),
  };
}

export async function loadAdminAnalytics(): Promise<AdminAnalyticsSnapshot> {
  const admin = createAdminClient();
  const deferredMetrics = [
    "Demo starts — no persistent tracking table",
    "Account conversions — requires funnel events",
    "First device added — requires per-user milestone table",
    "First document uploaded — requires per-user milestone table",
    "Upgrade conversions — requires event history",
    "Top public pages — requires GA server integration",
  ];

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(
    thirtyDaysAgo.getDate() - 30
  );

  const [
    profilesResult,
    householdsCount,
    devicesCount,
    documentsCount,
    supportCount,
    openSupportCount,
    invitationsCount,
    subscriptionsResult,
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("created_at")
      .gte(
        "created_at",
        thirtyDaysAgo.toISOString()
      )
      .order("created_at", {
        ascending: true,
      }),

    admin
      .from("households")
      .select("id", {
        count: "exact",
        head: true,
      }),

    admin
      .from("devices")
      .select("id", {
        count: "exact",
        head: true,
      }),

    admin
      .from("documents")
      .select("id", {
        count: "exact",
        head: true,
      }),

    admin
      .from("support_tickets")
      .select("id", {
        count: "exact",
        head: true,
      }),

    admin
      .from("support_tickets")
      .select("id", {
        count: "exact",
        head: true,
      })
      .in("status", [
        "new",
        "open",
        "in_progress",
        "waiting_on_customer",
      ]),

    admin
      .from("household_invitations")
      .select("id", {
        count: "exact",
        head: true,
      }),

    admin
      .from("user_subscriptions")
      .select("plan"),
  ]);

  const signupsByDayMap = new Map<
    string,
    number
  >();

  for (const profile of profilesResult.data ??
    []) {
    const day = profile.created_at.slice(
      0,
      10
    );
    signupsByDayMap.set(
      day,
      (signupsByDayMap.get(day) ?? 0) + 1
    );
  }

  const planDistributionMap = new Map<
    string,
    number
  >();

  for (const row of subscriptionsResult.data ??
    []) {
    const plan = normalizePlan(row.plan);
    planDistributionMap.set(
      plan,
      (planDistributionMap.get(plan) ??
        0) + 1
    );
  }

  const { count: totalUsers } = await admin
    .from("profiles")
    .select("id", {
      count: "exact",
      head: true,
    });

  return {
    signupsByDay: [...signupsByDayMap.entries()]
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) =>
        a.date.localeCompare(b.date)
      ),
    planDistribution: [
      ...planDistributionMap.entries(),
    ].map(([plan, count]) => ({
      plan,
      count,
    })),
    totalUsers: totalUsers ?? 0,
    totalHouseholds: householdsCount.count ?? 0,
    totalDevices: devicesCount.count ?? 0,
    totalDocuments: documentsCount.count ?? 0,
    totalSupportTickets:
      supportCount.count ?? 0,
    openSupportTickets:
      openSupportCount.count ?? 0,
    familyInvitationsTotal:
      invitationsCount.count ?? 0,
    deferredMetrics,
  };
}

export async function loadAdminSystemHealth(): Promise<AdminSystemHealth> {
  const admin = createAdminClient();

  let supabaseConnected = false;

  try {
    const { error } = await admin
      .from("profiles")
      .select("id", {
        head: true,
      })
      .limit(1);

    supabaseConnected = !error;
  } catch {
    supabaseConnected = false;
  }

  const checks: AdminConfigCheck[] = [
    {
      id: "supabase-url",
      label: "Supabase URL",
      status: process.env
        .NEXT_PUBLIC_SUPABASE_URL
        ? "configured"
        : "missing",
      detail: "Public project URL",
    },
    {
      id: "supabase-anon",
      label: "Supabase anonymous key",
      status: process.env
        .NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? "configured"
        : "missing",
      detail: "Browser-safe anon key",
    },
    {
      id: "supabase-service-role",
      label: "Supabase service-role key",
      status: process.env
        .SUPABASE_SERVICE_ROLE_KEY
        ? "configured"
        : "missing",
      detail: "Server-side only",
    },
    {
      id: "resend",
      label: "Resend API key",
      status: isResendConfigured()
        ? "configured"
        : "missing",
      detail: "Application email delivery",
    },
    {
      id: "email-from",
      label: "Email sender",
      status: getEmailFromAddress()
        ? "configured"
        : "missing",
      detail: getEmailFromAddress(),
    },
    {
      id: "email-reply-to",
      label: "Email reply-to",
      status: getEmailReplyToAddress()
        ? "configured"
        : "optional",
      detail: getEmailReplyToAddress(),
    },
    {
      id: "support-email-to",
      label: "Support destination",
      status: getSupportEmailTo()
        ? "configured"
        : "warning",
      detail: getSupportEmailTo(),
    },
    {
      id: "stripe-secret",
      label: "Stripe secret key",
      status: process.env.STRIPE_SECRET_KEY
        ? "configured"
        : "missing",
      detail: "Server-side billing",
    },
    {
      id: "stripe-webhook",
      label: "Stripe webhook secret",
      status: process.env
        .STRIPE_WEBHOOK_SECRET
        ? "configured"
        : "missing",
      detail: "Subscription sync",
    },
    {
      id: "ga",
      label: "Google Analytics measurement ID",
      status: process.env
        .NEXT_PUBLIC_GA_MEASUREMENT_ID
        ? "configured"
        : "optional",
      detail: "Client-side analytics",
    },
    {
      id: "production-domain",
      label: "Production domain",
      status:
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.VERCEL_PROJECT_PRODUCTION_URL
          ? "configured"
          : "optional",
      detail:
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.VERCEL_PROJECT_PRODUCTION_URL ||
        "https://hometechvault.com",
    },
  ];

  return {
    environment:
      process.env.NODE_ENV ?? "development",
    publicUrl:
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://hometechvault.com",
    appVersion:
      process.env.npm_package_version ||
      "0.1.0",
    checks,
    supabaseConnected,
    resendConfigured: isResendConfigured(),
    stripeConfigured: Boolean(
      process.env.STRIPE_SECRET_KEY
    ),
  };
}

export async function countPlatformAdmins() {
  const admin = createAdminClient();

  const { count, error } = await admin
    .from("profiles")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("is_admin", true);

  if (error) {
    throw error;
  }

  return count ?? 0;
}
