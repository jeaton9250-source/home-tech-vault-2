import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { countPlatformAdmins } from "@/lib/admin/data/loaders";
import { isSubscriptionGrantingAccess } from "@/lib/permissions/subscriptionAccess";

import { loadProfileAccountRecord } from "@/lib/account-admin/status";
import { isDeletionJobStale } from "@/lib/account-admin/deletionJobState";

import type {
  DeletionBlockCode,
  DeletionPreview,
} from "@/lib/account-admin/types";

async function getAuthEmail(
  admin: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data, error } =
    await admin.auth.admin.getUserById(userId);

  if (error || !data.user) {
    return null;
  }

  return data.user.email ?? null;
}

export async function buildDeletionPreview(
  admin: SupabaseClient,
  targetUserId: string,
  actorId: string
): Promise<DeletionPreview | null> {
  const profile =
    await loadProfileAccountRecord(
      admin,
      targetUserId
    );

  if (!profile) {
    return null;
  }

  const email =
    await getAuthEmail(admin, targetUserId);

  const [
    subscriptionResult,
    ownedHouseholdsResult,
    membershipResult,
    deviceCountResult,
    documentCountResult,
    ticketCountResult,
    activeGrantCountResult,
    grantsIssuedCountResult,
    activeJobResult,
  ] = await Promise.all([
    admin
      .from("user_subscriptions")
      .select(
        "plan, status, stripe_customer_id, stripe_subscription_id, current_period_end"
      )
      .eq("user_id", targetUserId)
      .maybeSingle(),

    admin
      .from("households")
      .select("id, name")
      .eq("owner_id", targetUserId),

    admin
      .from("household_members")
      .select("household_id, role")
      .eq("user_id", targetUserId)
      .maybeSingle(),

    admin
      .from("devices")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", targetUserId),

    admin
      .from("documents")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", targetUserId),

    admin
      .from("support_tickets")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", targetUserId),

    admin
      .from("platform_plan_grants")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", targetUserId)
      .eq("status", "active"),

    admin
      .from("platform_plan_grants")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("granted_by", targetUserId),

    admin
      .from("admin_account_deletion_jobs")
      .select(
        "id, status, updated_at, processor_lease_expires_at, last_heartbeat_at"
      )
      .eq("target_user_id", targetUserId)
      .in("status", [
        "pending",
        "validating",
        "processing",
      ])
      .maybeSingle(),
  ]);

  const ownedHousehold =
    ownedHouseholdsResult.data?.[0] ?? null;

  let householdMemberCount = 0;
  let otherMembers: DeletionPreview["otherHouseholdMembers"] =
    [];

  if (ownedHousehold?.id) {
    const { data: members } = await admin
      .from("household_members")
      .select("user_id, role")
      .eq(
        "household_id",
        ownedHousehold.id
      );

    const memberRows = members ?? [];
    householdMemberCount = memberRows.length;

    const otherMemberIds = memberRows
      .filter(
        (member) =>
          member.user_id !== targetUserId
      )
      .map((member) => member.user_id);

    if (otherMemberIds.length > 0) {
      const { data: profiles } = await admin
        .from("profiles")
        .select("id, full_name")
        .in("id", otherMemberIds);

      const profileMap = new Map(
        (profiles ?? []).map((row) => [
          row.id,
          row.full_name,
        ])
      );

      otherMembers = await Promise.all(
        otherMemberIds.map(
          async (memberId) => ({
            userId: memberId,
            email:
              await getAuthEmail(
                admin,
                memberId
              ),
            fullName:
              profileMap.get(memberId) ??
              null,
            role:
              memberRows.find(
                (row) =>
                  row.user_id === memberId
              )?.role ?? "member",
          })
        )
      );
    }
  }

  const subscription =
    subscriptionResult.data;

  const billingGrantingAccess =
    isSubscriptionGrantingAccess(
      subscription?.plan === "family"
        ? "family"
        : subscription?.plan === "pro"
          ? "pro"
          : "free",
      subscription?.status,
      subscription?.current_period_end
    );

  const blockers: DeletionPreview["blockers"] =
    [];

  if (targetUserId === actorId) {
    blockers.push({
      code: "SELF_DELETE_FORBIDDEN",
      message:
        "You cannot permanently delete your own account from the admin dashboard.",
    });
  }

  if (profile.is_admin) {
    const adminCount =
      await countPlatformAdmins();

    if (adminCount <= 1) {
      blockers.push({
        code: "LAST_PLATFORM_ADMIN",
        message:
          "Cannot delete the last platform administrator.",
      });
    }
  }

  const normalizedSubscriptionStatus =
    subscription?.status?.trim().toLowerCase() ??
    "inactive";

  if (
    billingGrantingAccess ||
    normalizedSubscriptionStatus === "past_due"
  ) {
    blockers.push({
      code: "BILLING_ACTIVE",
      message:
        "Active, trialing, past-due, or in-period canceled billing must be resolved through Stripe before permanent deletion.",
    });
  }

  if (
    ownedHousehold &&
    otherMembers.length > 0
  ) {
    blockers.push({
      code: "HOUSEHOLD_HAS_MEMBERS",
      message:
        "Transfer household ownership to another member before deleting this owner account.",
    });
  }

  if (
    (grantsIssuedCountResult.count ?? 0) > 0
  ) {
    blockers.push({
      code: "GRANT_ISSUER_RESTRICT",
      message:
        "This user issued complimentary plan grants. Reassign or revoke those grants before deletion.",
    });
  }

  if (
    activeJobResult.data?.id &&
    !isDeletionJobStale({
      status: activeJobResult.data
        .status as "pending",
      updated_at:
        activeJobResult.data.updated_at,
      processor_lease_expires_at:
        activeJobResult.data
          .processor_lease_expires_at,
      last_heartbeat_at:
        activeJobResult.data
          .last_heartbeat_at,
    })
  ) {
    blockers.push({
      code: "ACTIVE_DELETION_JOB",
      message:
        "A deletion job is already in progress for this user.",
    });
  }

  return {
    userId: targetUserId,
    email,
    fullName: profile.full_name,
    accountStatus: profile.account_status,
    personalPlan:
      subscription?.plan ?? "free",
    subscriptionStatus:
      subscription?.status ?? "inactive",
    billingGrantingAccess,
    stripeCustomerId:
      subscription?.stripe_customer_id ??
      null,
    stripeSubscriptionId:
      subscription?.stripe_subscription_id ??
      null,
    householdId:
      ownedHousehold?.id ??
      membershipResult.data?.household_id ??
      null,
    householdName:
      ownedHousehold?.name ?? null,
    isHouseholdOwner: Boolean(ownedHousehold),
    householdMemberCount,
    otherHouseholdMembers: otherMembers,
    deviceCount: deviceCountResult.count ?? 0,
    documentCount:
      documentCountResult.count ?? 0,
    supportTicketCount:
      ticketCountResult.count ?? 0,
    activeGrantCount:
      activeGrantCountResult.count ?? 0,
    grantsIssuedCount:
      grantsIssuedCountResult.count ?? 0,
    blockers,
    dataToDelete: [
      "Personal devices and device media",
      "Personal documents and storage files",
      "Network records created by this user",
      "Maintenance tasks and app subscriptions",
      "Household membership rows",
      "Complimentary plan grants for this user",
      "Profile and authentication account",
    ],
    dataPreserved: [
      "Stripe customer and subscription records in Stripe",
      "Support tickets (anonymized submitter reference)",
      "Platform admin audit history",
      "Plan grant audit events",
    ],
  };
}

export function getDeletionBlockMessage(
  code: DeletionBlockCode
): string {
  switch (code) {
    case "TARGET_NOT_FOUND":
      return "User not found.";
    case "SELF_DELETE_FORBIDDEN":
      return "You cannot delete your own account from the admin dashboard.";
    case "LAST_PLATFORM_ADMIN":
      return "Cannot delete the last platform administrator.";
    case "BILLING_ACTIVE":
      return "Cancel active billing through Stripe before permanent deletion.";
    case "HOUSEHOLD_HAS_MEMBERS":
      return "Transfer household ownership before deleting this owner.";
    case "GRANT_ISSUER_RESTRICT":
      return "Resolve complimentary grants issued by this user first.";
    case "ACTIVE_DELETION_JOB":
      return "A deletion job is already active for this user.";
    case "TARGET_IS_PLATFORM_ADMIN":
      return "Remove platform-admin access before deleting this account.";
    default:
      return "Deletion is blocked.";
  }
}
