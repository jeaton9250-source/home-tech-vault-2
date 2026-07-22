import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { loadActivePlanGrantForUser } from "@/lib/plan-grants/loadActiveGrant";
import type { PlanGrantInput } from "@/lib/plan-grants/types";
import { loadHouseholdMembershipForUser } from "@/lib/permissions/householdMembership";
import {
  resolveEffectivePlan,
  type EffectivePlanInput,
  type EffectivePlanResult,
} from "@/lib/permissions/effectivePlan";
import type { SubscriptionPlan } from "@/hooks/useSubscription";

function normalizePlan(
  value: string | null | undefined
): SubscriptionPlan {
  const plan =
    value?.trim().toLowerCase() || "free";

  if (plan === "pro" || plan === "family") {
    return plan;
  }

  return "free";
}

export type ServerPlanAccessContext = {
  input: EffectivePlanInput;
  result: EffectivePlanResult;
  adminGrant: PlanGrantInput | null;
};

export async function buildServerPlanAccessContext(
  admin: SupabaseClient,
  userId: string,
  options?: {
    isDemo?: boolean;
  }
): Promise<ServerPlanAccessContext> {
  const [
    profileResult,
    subscriptionResult,
    resolvedMembership,
    adminGrant,
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .maybeSingle(),

    admin
      .from("user_subscriptions")
      .select(
        "plan, status, current_period_end, stripe_customer_id"
      )
      .eq("user_id", userId)
      .maybeSingle(),

    loadHouseholdMembershipForUser(
      admin,
      userId
    ),

    loadActivePlanGrantForUser(admin, userId),
  ]);

  if (profileResult.error) {
    throw profileResult.error;
  }

  if (subscriptionResult.error) {
    throw subscriptionResult.error;
  }

  const membershipRow =
    resolvedMembership.membership;

  let householdOwnerId: string | null = null;
  let householdOwnerPlan:
    | SubscriptionPlan
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

  if (membershipRow?.household_id) {
    const {
      data: household,
      error: householdError,
    } = await admin
      .from("households")
      .select("owner_id")
      .eq(
        "id",
        membershipRow.household_id
      )
      .maybeSingle();

    if (householdError) {
      throw householdError;
    }

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
      );
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
  );

  const adminGrantInput: PlanGrantInput | null =
    adminGrant
      ? {
          plan: adminGrant.plan,
          status: adminGrant.status,
          startsAt: adminGrant.startsAt,
          expiresAt: adminGrant.expiresAt,
          reason: adminGrant.reason,
          notes: adminGrant.notes,
        }
      : null;

  const input: EffectivePlanInput = {
    isDemo: options?.isDemo === true,
    isPlatformAdmin:
      profileResult.data?.is_admin === true,
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
      resolvedMembership.householdId,
    householdOwnerId,
    householdOwnerPlan,
    householdOwnerStatus,
    householdOwnerCurrentPeriodEnd,
    householdOwnerName,
    rawHouseholdRole:
      resolvedMembership.rawHouseholdRole,
    adminGrant: adminGrantInput,
  };

  return {
    input,
    result: resolveEffectivePlan(input),
    adminGrant: adminGrantInput,
  };
}

export function formatEffectivePlanSourceLabel(
  source: EffectivePlanResult["effectivePlanSource"]
) {
  switch (source) {
    case "platform_admin":
      return "Platform Admin Bypass";
    case "admin_grant_pro":
      return "Admin Grant — Pro";
    case "admin_grant_family":
      return "Admin Grant — Family";
    case "inherited_family":
      return "Inherited Family";
    case "inherited_pro":
      return "Inherited Pro";
    case "personal_pro":
      return "Personal Pro";
    case "personal_family":
      return "Personal Family";
    case "demo":
      return "Demo";
    default:
      return "Free";
  }
}
