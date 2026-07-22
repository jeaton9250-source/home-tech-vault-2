import {
  isGrantProvidingAccess,
} from "@/lib/plan-grants/grantAccess";

import type {
  PlanGrantInput,
} from "@/lib/plan-grants/types";

export type SubscriptionPlan =
  | "free"
  | "pro"
  | "family";

export function normalizeSubscriptionPlan(
  value: string | null | undefined
): SubscriptionPlan {
  const normalized =
    value?.trim().toLowerCase();

  if (normalized === "family") {
    return "family";
  }

  if (normalized === "pro") {
    return "pro";
  }

  return "free";
}

export function isActiveSubscriptionStatus(
  status: string | null | undefined
): boolean {
  const normalized =
    status?.trim().toLowerCase() ?? "";

  return (
    normalized === "active" ||
    normalized === "trialing"
  );
}

/**
 * Whether a Stripe subscription row grants product access.
 * past_due does not grant. Canceled grants until period end.
 */
export function isSubscriptionGrantingAccess(
  plan: SubscriptionPlan | null | undefined,
  status: string | null | undefined,
  currentPeriodEnd?: string | null
): boolean {
  if (!plan || plan === "free") {
    return false;
  }

  const normalizedStatus =
    status?.trim().toLowerCase() ?? "";

  if (
    normalizedStatus === "active" ||
    normalizedStatus === "trialing"
  ) {
    return true;
  }

  if (
    normalizedStatus === "canceled" &&
    currentPeriodEnd
  ) {
    const periodEnd = new Date(
      currentPeriodEnd
    );

    return (
      !Number.isNaN(
        periodEnd.getTime()
      ) &&
      periodEnd.getTime() > Date.now()
    );
  }

  return false;
}

export function householdOwnerHasGrantingFamilyPlan(
  ownerPlan: string | null | undefined,
  ownerStatus: string | null | undefined,
  ownerCurrentPeriodEnd?: string | null
): boolean {
  const plan =
    normalizeSubscriptionPlan(
      ownerPlan
    );

  return (
    plan === "family" &&
    isSubscriptionGrantingAccess(
      plan,
      ownerStatus,
      ownerCurrentPeriodEnd
    )
  );
}

export function householdOwnerHasGrantingProPlan(
  ownerPlan: string | null | undefined,
  ownerStatus: string | null | undefined,
  ownerCurrentPeriodEnd?: string | null
): boolean {
  const plan =
    normalizeSubscriptionPlan(
      ownerPlan
    );

  return (
    plan === "pro" &&
    isSubscriptionGrantingAccess(
      plan,
      ownerStatus,
      ownerCurrentPeriodEnd
    )
  );
}

/**
 * Whether the household billing owner has an active Pro or Family subscription
 * that should entitle active household members.
 */
export function householdOwnerHasGrantingPremiumPlan(
  ownerPlan: string | null | undefined,
  ownerStatus: string | null | undefined,
  ownerCurrentPeriodEnd?: string | null
): boolean {
  const plan =
    normalizeSubscriptionPlan(
      ownerPlan
    );

  return (
    (plan === "pro" || plan === "family") &&
    isSubscriptionGrantingAccess(
      plan,
      ownerStatus,
      ownerCurrentPeriodEnd
    )
  );
}

export type RawHouseholdRole =
  | "owner"
  | "admin"
  | "member"
  | "viewer";

export function isAdminHouseholdRole(
  role: string | null | undefined,
  userId?: string | null,
  householdOwnerId?: string | null
): boolean {
  if (!role) {
    return false;
  }

  if (
    role === "owner" ||
    role === "admin"
  ) {
    return true;
  }

  return Boolean(
    userId &&
      householdOwnerId &&
      userId === householdOwnerId
  );
}

export function householdOwnerHasFamilyProductAccess(options: {
  ownerPlan: string | null | undefined;
  ownerStatus: string | null | undefined;
  ownerCurrentPeriodEnd?: string | null;
  ownerAdminGrant?: PlanGrantInput | null;
}): boolean {
  if (
    householdOwnerHasGrantingFamilyPlan(
      options.ownerPlan,
      options.ownerStatus,
      options.ownerCurrentPeriodEnd
    )
  ) {
    return true;
  }

  return (
    isGrantProvidingAccess(
      options.ownerAdminGrant ?? null
    ) &&
    options.ownerAdminGrant?.plan === "family"
  );
}

export function canSendHouseholdInvitation(options: {
  isPlatformAdmin: boolean;
  callerRole: string | null | undefined;
  callerUserId: string | null;
  householdOwnerId: string | null;
  ownerPlan: string | null | undefined;
  ownerStatus: string | null | undefined;
  ownerCurrentPeriodEnd?: string | null;
  ownerAdminGrant?: PlanGrantInput | null;
}): boolean {
  if (options.isPlatformAdmin) {
    return true;
  }

  if (
    !isAdminHouseholdRole(
      options.callerRole,
      options.callerUserId,
      options.householdOwnerId
    )
  ) {
    return false;
  }

  return householdOwnerHasFamilyProductAccess({
    ownerPlan: options.ownerPlan,
    ownerStatus: options.ownerStatus,
    ownerCurrentPeriodEnd:
      options.ownerCurrentPeriodEnd,
    ownerAdminGrant:
      options.ownerAdminGrant,
  });
}
