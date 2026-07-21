import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { buildServerPlanAccessContext } from "@/lib/permissions/serverPlanAccess";
import {
  countActiveFoundingMembers,
  countFoundingMemberSlotsUsed,
  loadFoundingProgramSettings,
  resolveProgramAvailability,
} from "@/lib/founding-members/loaders";
import type {
  FoundingMemberAdminRow,
  FoundingMembersDashboardMetrics,
} from "@/lib/founding-members/types";

async function getAuthMap(
  admin: ReturnType<typeof createAdminClient>,
  userIds: string[]
) {
  const entries = await Promise.all(
    userIds.map(async (id) => {
      const { data } =
        await admin.auth.admin.getUserById(id);
      return [
        id,
        data.user?.email?.trim() || null,
      ] as const;
    })
  );

  return new Map(entries);
}

export async function loadFoundingMembersDashboardMetrics(): Promise<FoundingMembersDashboardMetrics> {
  const admin = createAdminClient();
  const settings =
    await loadFoundingProgramSettings(admin);
  const enrolledCount =
    await countFoundingMemberSlotsUsed(admin);
  const activeCount =
    await countActiveFoundingMembers(admin);

  const { data: members } = await admin
    .from("platform_founding_members")
    .select(
      "id, user_id, plan_grant_id, member_number, status, benefit_mode, enrolled_at"
    )
    .order("enrolled_at", {
      ascending: false,
    });

  const rows = members ?? [];
  const latest = rows[0] ?? null;

  let linkedGrantCount = 0;
  let paidPlanCount = 0;

  for (const row of rows) {
    if (
      row.status === "active" &&
      row.plan_grant_id
    ) {
      linkedGrantCount += 1;
    }

    if (
      row.status === "active" &&
      (row.benefit_mode === "paid_access" ||
        row.benefit_mode ===
          "inherited_family")
    ) {
      paidPlanCount += 1;
    }
  }

  return {
    programStatus: resolveProgramAvailability({
      enabled: settings.enabled,
      capacity: settings.capacity,
      enrolledCount,
    }),
    capacity: settings.capacity,
    activeCount,
    remainingSpots: Math.max(
      settings.capacity - enrolledCount,
      0
    ),
    linkedGrantCount,
    paidPlanCount,
    latestMemberNumber:
      latest?.member_number ?? null,
    latestEnrollmentDate:
      latest?.enrolled_at ?? null,
    settings,
  };
}

export async function loadFoundingMembersAdminList(options?: {
  status?: "active" | "removed" | "all";
  search?: string;
}) {
  const admin = createAdminClient();

  let query = admin
    .from("platform_founding_members")
    .select(
      "id, user_id, plan_grant_id, member_number, status, benefit_mode, enrolled_at"
    )
    .order("member_number", {
      ascending: true,
    });

  if (
    options?.status &&
    options.status !== "all"
  ) {
    query = query.eq("status", options.status);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const memberRows = data ?? [];
  const userIds = memberRows.map(
    (row) => row.user_id
  );

  const [
    authMap,
    profilesResult,
    grantsResult,
  ] = await Promise.all([
    getAuthMap(admin, userIds),
    admin
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds),
    admin
      .from("platform_plan_grants")
      .select("id, plan, status")
      .in(
        "id",
        memberRows
          .map((row) => row.plan_grant_id)
          .filter(Boolean)
      ),
  ]);

  const profileMap = new Map(
    (profilesResult.data ?? []).map(
      (profile) => [profile.id, profile]
    )
  );
  const grantMap = new Map(
    (grantsResult.data ?? []).map(
      (grant) => [grant.id, grant]
    )
  );

  const rows: FoundingMemberAdminRow[] = [];

  for (const row of memberRows) {
    const profile = profileMap.get(row.user_id);
    const grant = row.plan_grant_id
      ? grantMap.get(row.plan_grant_id)
      : null;

    let effectivePlan = "free";
    let billingPlan = "free";

    try {
      const planAccess =
        await buildServerPlanAccessContext(
          admin,
          row.user_id
        );
      effectivePlan =
        planAccess.result.effectivePlan;
      billingPlan =
        planAccess.input.personalPlan;
    } catch {
      // Keep defaults if plan lookup fails.
    }

    const adminRow: FoundingMemberAdminRow = {
      id: row.id,
      userId: row.user_id,
      memberNumber: row.member_number,
      fullName:
        profile?.full_name?.trim() || null,
      email:
        authMap.get(row.user_id) ?? null,
      enrolledAt: row.enrolled_at,
      status:
        row.status === "removed"
          ? "removed"
          : "active",
      benefitMode:
        row.benefit_mode as FoundingMemberAdminRow["benefitMode"],
      effectivePlan,
      billingPlan,
      grantStatus: grant?.status ?? null,
      grantPlan: grant?.plan ?? null,
      planGrantId: row.plan_grant_id,
    };

    rows.push(adminRow);
  }

  const searchTerm =
    options?.search?.trim().toLowerCase() ||
    "";

  if (!searchTerm) {
    return rows;
  }

  return rows.filter((row) => {
    const haystack = [
      row.fullName,
      row.email,
      String(row.memberNumber),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(searchTerm);
  });
}

export function buildFoundingMembersCsv(
  rows: FoundingMemberAdminRow[]
) {
  const header = [
    "Member Number",
    "Name",
    "Email",
    "Enrollment Date",
    "Status",
    "Billing Plan",
    "Effective Plan",
  ];

  const lines = rows.map((row) => [
    row.memberNumber,
    row.fullName ?? "",
    row.email ?? "",
    row.enrolledAt,
    row.status,
    row.billingPlan,
    row.effectivePlan,
  ]);

  return [header, ...lines]
    .map((line) =>
      line
        .map((value) =>
          `"${String(value).replaceAll('"', '""')}"`
        )
        .join(",")
    )
    .join("\n");
}
