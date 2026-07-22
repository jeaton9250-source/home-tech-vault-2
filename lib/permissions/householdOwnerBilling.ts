import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  isGrantProvidingAccess,
} from "@/lib/plan-grants/grantAccess";
import { loadActivePlanGrantForUser } from "@/lib/plan-grants/loadActiveGrant";

import {
  householdOwnerHasGrantingPremiumPlan,
  householdOwnerHasGrantingProPlan,
  isSubscriptionGrantingAccess,
  normalizeSubscriptionPlan,
  type SubscriptionPlan,
} from "@/lib/permissions/subscriptionAccess";

export type HouseholdOwnerPlanSource =
  | "subscription"
  | "admin_grant"
  | "none";

export type HouseholdOwnerBilling = {
  ownerPlan: SubscriptionPlan | null;
  ownerStatus: string | null;
  ownerCurrentPeriodEnd: string | null;
  ownerPlanSource: HouseholdOwnerPlanSource;
  ownerGrantsPro: boolean;
  ownerGrantsPremium: boolean;
};

/**
 * Resolve the household billing owner's plan from Stripe subscription rows
 * and platform admin grants. Members inherit from this result.
 */
export async function resolveHouseholdOwnerBilling(
  admin: SupabaseClient,
  ownerId: string
): Promise<HouseholdOwnerBilling> {
  const [
    subscriptionResult,
    ownerGrant,
  ] = await Promise.all([
    admin
      .from("user_subscriptions")
      .select(
        "plan, status, current_period_end"
      )
      .eq("user_id", ownerId)
      .maybeSingle(),

    loadActivePlanGrantForUser(
      admin,
      ownerId
    ),
  ]);

  if (subscriptionResult.error) {
    throw subscriptionResult.error;
  }

  const subscriptionPlan =
    normalizeSubscriptionPlan(
      subscriptionResult.data?.plan
    );

  const subscriptionStatus =
    subscriptionResult.data?.status
      ?.trim()
      .toLowerCase() ?? null;

  const subscriptionPeriodEnd =
    subscriptionResult.data
      ?.current_period_end ?? null;

  if (
    isSubscriptionGrantingAccess(
      subscriptionPlan,
      subscriptionStatus,
      subscriptionPeriodEnd
    )
  ) {
    return {
      ownerPlan: subscriptionPlan,
      ownerStatus: subscriptionStatus,
      ownerCurrentPeriodEnd:
        subscriptionPeriodEnd,
      ownerPlanSource: "subscription",
      ownerGrantsPro:
        householdOwnerHasGrantingProPlan(
          subscriptionPlan,
          subscriptionStatus,
          subscriptionPeriodEnd
        ),
      ownerGrantsPremium:
        householdOwnerHasGrantingPremiumPlan(
          subscriptionPlan,
          subscriptionStatus,
          subscriptionPeriodEnd
        ),
    };
  }

  if (
    ownerGrant &&
    isGrantProvidingAccess(ownerGrant)
  ) {
    const grantPlan =
      normalizeSubscriptionPlan(
        ownerGrant.plan
      );

    return {
      ownerPlan: grantPlan,
      ownerStatus: "active",
      ownerCurrentPeriodEnd:
        ownerGrant.expiresAt,
      ownerPlanSource: "admin_grant",
      ownerGrantsPro: grantPlan === "pro",
      ownerGrantsPremium:
        grantPlan === "pro" ||
        grantPlan === "family",
    };
  }

  return {
    ownerPlan: subscriptionResult.data?.plan
      ? subscriptionPlan
      : null,
    ownerStatus: subscriptionStatus,
    ownerCurrentPeriodEnd:
      subscriptionPeriodEnd,
    ownerPlanSource: "none",
    ownerGrantsPro: false,
    ownerGrantsPremium: false,
  };
}
