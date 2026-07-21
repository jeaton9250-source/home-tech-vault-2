import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { resolveEffectivePlan } from "@/lib/permissions/effectivePlan";
import type { SupportSubmissionContext } from "@/lib/support/types";

type ResolveSupportContextOptions = {
  userId: string | null;
  isDemo: boolean;
};

export async function resolveSupportSubmissionContext(
  admin: SupabaseClient,
  options: ResolveSupportContextOptions
): Promise<SupportSubmissionContext> {
  if (!options.userId || options.isDemo) {
    return {
      userId: null,
      householdId: null,
      effectivePlan: options.isDemo ? "demo" : null,
      householdRole: null,
      isSignedIn: Boolean(options.userId),
    };
  }

  const {
    data: membership,
    error: membershipError,
  } = await admin
    .from("household_members")
    .select("household_id, role")
    .eq("user_id", options.userId)
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    throw membershipError;
  }

  let householdOwnerId: string | null = null;
  let householdOwnerPlan: "free" | "pro" | "family" | null =
    null;
  let householdOwnerStatus: string | null = null;
  let householdOwnerCurrentPeriodEnd:
    | string
    | null = null;
  let householdOwnerName: string | null = null;

  if (membership?.household_id) {
    const {
      data: household,
      error: householdError,
    } = await admin
      .from("households")
      .select("owner_id")
      .eq("id", membership.household_id)
      .maybeSingle();

    if (householdError) {
      throw householdError;
    }

    householdOwnerId = household?.owner_id ?? null;

    if (householdOwnerId) {
      const [
        subscriptionResult,
        profileResult,
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

      if (subscriptionResult.error) {
        throw subscriptionResult.error;
      }

      const normalizedPlan =
        subscriptionResult.data?.plan
          ?.trim()
          .toLowerCase();

      householdOwnerPlan =
        normalizedPlan === "family"
          ? "family"
          : normalizedPlan === "pro"
            ? "pro"
            : "free";

      householdOwnerStatus =
        subscriptionResult.data?.status?.trim().toLowerCase() ||
        "inactive";

      householdOwnerCurrentPeriodEnd =
        subscriptionResult.data?.current_period_end ??
        null;

      householdOwnerName =
        profileResult.data?.full_name?.trim() ??
        null;
    }
  }

  const {
    data: personalSubscription,
    error: personalSubscriptionError,
  } = await admin
    .from("user_subscriptions")
    .select(
      "plan, status, current_period_end, stripe_customer_id"
    )
    .eq("user_id", options.userId)
    .maybeSingle();

  if (personalSubscriptionError) {
    throw personalSubscriptionError;
  }

  const {
    data: profile,
    error: profileError,
  } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", options.userId)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  const normalizedPersonalPlan =
    personalSubscription?.plan
      ?.trim()
      .toLowerCase();

  const personalPlan =
    normalizedPersonalPlan === "family"
      ? "family"
      : normalizedPersonalPlan === "pro"
        ? "pro"
        : "free";

  const effectivePlanResult = resolveEffectivePlan({
    isDemo: false,
    isPlatformAdmin: profile?.is_admin === true,
    userId: options.userId,
    personalPlan,
    personalStatus:
      personalSubscription?.status
        ?.trim()
        .toLowerCase() || "inactive",
    personalCurrentPeriodEnd:
      personalSubscription?.current_period_end ??
      null,
    hasPersonalStripeCustomer: Boolean(
      personalSubscription?.stripe_customer_id
    ),
    householdId: membership?.household_id ?? null,
    householdOwnerId,
    householdOwnerPlan,
    householdOwnerStatus,
    householdOwnerCurrentPeriodEnd,
    householdOwnerName,
    rawHouseholdRole:
      (membership?.role as
        | "owner"
        | "admin"
        | "member"
        | "viewer"
        | null) ?? null,
  });

  return {
    userId: options.userId,
    householdId: membership?.household_id ?? null,
    effectivePlan: effectivePlanResult.effectivePlan,
    householdRole:
      effectivePlanResult.householdRole,
    isSignedIn: true,
  };
}
