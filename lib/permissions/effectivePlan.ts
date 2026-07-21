/**
 * Effective plan resolution for Home Tech Vault.
 *
 * Product rules (no schema changes in this stage):
 * - The household owner (`households.owner_id`) is the Family plan billing owner.
 * - When that owner has an active or trialing Family subscription, every active
 *   user in `household_members` for that household receives `effectivePlan =
 *   "family"`.
 * - When the owner's Family subscription is canceled, expired, past_due, or
 *   otherwise not granting access, members fall back to their personal
 *   subscription or Free.
 *
 * Limitation: billing ownership cannot yet be transferred separately from
 * household ownership. `canManageBilling` requires the caller to be the
 * Stripe subscription holder with a granting personal subscription.
 *
 * Plan vs role stay separate:
 * - Effective plan controls premium feature availability and usage limits.
 * - Household role controls mutations and administrative actions.
 *
 * Household Family access is loaded via `GET /api/household/access`, which
 * reads owner subscription data with the admin client.
 */

import {
  FEATURE_REQUIREMENTS,
} from "@/lib/permissions/features";

import {
  getLimitsForPlan,
} from "@/lib/permissions/plans";

import type {
  FeatureKey,
  FeaturePlanRequirement,
} from "@/lib/permissions/types";

import type {
  PlanGrantInput,
} from "@/lib/plan-grants/types";

import {
  isGrantProvidingAccess,
} from "@/lib/plan-grants/grantAccess";

import type {
  AdminGrantPlan,
  EffectivePlanSource,
} from "@/lib/plan-grants/types";

import type {
  SubscriptionPlan,
} from "@/hooks/useSubscription";

export type RawHouseholdRole =
  | "owner"
  | "admin"
  | "member"
  | "viewer";

export type UsageLimits = {
  maxDevices: number | null;
  maxDocuments: number | null;
  maxWarranties: number | null;
  maxMaintenance: number | null;
  familyMemberLimit: number | null;
};

export type EffectivePlanInput = {
  isDemo: boolean;
  isPlatformAdmin: boolean;
  userId: string | null;
  personalPlan: SubscriptionPlan;
  personalStatus: string;
  personalCurrentPeriodEnd: string | null;
  hasPersonalStripeCustomer: boolean;
  householdId: string | null;
  householdOwnerId: string | null;
  householdOwnerPlan: SubscriptionPlan | null;
  householdOwnerStatus: string | null;
  householdOwnerCurrentPeriodEnd: string | null;
  householdOwnerName: string | null;
  rawHouseholdRole: RawHouseholdRole | null;
  adminGrant?: PlanGrantInput | null;
};

export type EffectivePlanResult = {
  personalPlan: SubscriptionPlan;
  effectivePlan: SubscriptionPlan;
  householdPlan: SubscriptionPlan | null;
  planDisplayName: string;
  householdRole: RawHouseholdRole | null;
  roleDisplayName: string | null;
  hasFamilyFeatureAccess: boolean;
  hasPremiumFeatureAccess: boolean;
  isFamilyPlanMember: boolean;
  isFamilyPlanAdmin: boolean;
  isFamilyMember: boolean;
  isFamilyViewer: boolean;
  isBillingOwner: boolean;
  canManageBilling: boolean;
  billingManagedByHousehold: boolean;
  billingOwnerName: string | null;
  inheritsFamilyPlan: boolean;
  effectiveStatus: string;
  effectivePlanSource: EffectivePlanSource;
  adminGrantPlan: AdminGrantPlan | null;
  adminGrantExpiresAt: string | null;
  hasActiveAdminGrant: boolean;
  usageLimits: UsageLimits;
  featureAccess: Record<FeatureKey, boolean>;
};

import {
  isActiveSubscriptionStatus,
  isSubscriptionGrantingAccess,
} from "@/lib/permissions/subscriptionAccess";

export {
  isActiveSubscriptionStatus,
  isSubscriptionGrantingAccess,
};

function meetsPlanRequirement(
  requiredPlan: FeaturePlanRequirement,
  effectivePlan: SubscriptionPlan,
  isPlatformAdmin: boolean
): boolean {
  if (requiredPlan === "free") {
    return true;
  }

  if (isPlatformAdmin) {
    return true;
  }

  if (requiredPlan === "pro") {
    return (
      effectivePlan === "pro" ||
      effectivePlan === "family"
    );
  }

  return effectivePlan === "family";
}

export function buildPlanFeatureAccess(
  effectivePlan: SubscriptionPlan,
  isPlatformAdmin: boolean
): Record<FeatureKey, boolean> {
  const access = {} as Record<
    FeatureKey,
    boolean
  >;

  for (const feature of Object.keys(
    FEATURE_REQUIREMENTS
  ) as FeatureKey[]) {
    access[feature] =
      meetsPlanRequirement(
        FEATURE_REQUIREMENTS[feature],
        effectivePlan,
        isPlatformAdmin
      );
  }

  return access;
}

export function resolveUsageLimits(
  effectivePlan: SubscriptionPlan,
  isPlatformAdmin: boolean,
  hasFamilyFeatureAccess: boolean
): UsageLimits {
  const limits = getLimitsForPlan(
    isPlatformAdmin
      ? "pro"
      : effectivePlan,
    isPlatformAdmin
  );

  const hasPremiumAccess =
    isPlatformAdmin ||
    effectivePlan === "pro" ||
    effectivePlan === "family";

  return {
    maxDevices: limits.maxDevices,
    maxDocuments: limits.maxDocuments,
    maxWarranties: hasPremiumAccess
      ? null
      : limits.maxDevices,
    maxMaintenance: hasPremiumAccess
      ? null
      : limits.maxDevices,
    familyMemberLimit:
      hasFamilyFeatureAccess ? 6 : null,
  };
}

export function getPlanDisplayName(
  plan: SubscriptionPlan,
  options?: {
    isPlatformAdmin?: boolean;
    isDemo?: boolean;
  }
): string {
  if (options?.isDemo) {
    return "Demo";
  }

  if (options?.isPlatformAdmin) {
    return "Master Account";
  }

  if (plan === "family") {
    return "Family";
  }

  if (plan === "pro") {
    return "Pro";
  }

  return "Free";
}

export function getRoleDisplayName(
  rawRole: RawHouseholdRole | null,
  options: {
    effectivePlan: SubscriptionPlan;
    userId: string | null;
    householdOwnerId: string | null;
  }
): string | null {
  if (!rawRole) {
    return null;
  }

  const isFamilyContext =
    options.effectivePlan === "family";

  if (isFamilyContext) {
    if (
      rawRole === "owner" ||
      rawRole === "admin" ||
      (options.userId &&
        options.householdOwnerId &&
        options.userId ===
          options.householdOwnerId)
    ) {
      return "Family Plan Admin";
    }

    if (rawRole === "member") {
      return "Family Member";
    }

    return "Family Viewer";
  }

  if (rawRole === "owner") {
    return "Household Owner";
  }

  if (rawRole === "admin") {
    return "Household Admin";
  }

  if (rawRole === "member") {
    return "Household Member";
  }

  return "Household Viewer";
}

export function resolveEffectivePlan(
  input: EffectivePlanInput
): EffectivePlanResult {
  const {
    isDemo,
    isPlatformAdmin,
    userId,
    personalPlan,
    personalStatus,
    personalCurrentPeriodEnd,
    hasPersonalStripeCustomer,
    householdId,
    householdOwnerId,
    householdOwnerPlan,
    householdOwnerStatus,
    householdOwnerCurrentPeriodEnd,
    householdOwnerName,
    rawHouseholdRole,
    adminGrant = null,
  } = input;

  const householdPlan =
    householdOwnerPlan ?? null;

  const hasActiveMembership =
    Boolean(householdId) &&
    Boolean(rawHouseholdRole);

  const ownerHasActiveFamily =
    householdOwnerPlan === "family" &&
    isSubscriptionGrantingAccess(
      householdOwnerPlan,
      householdOwnerStatus,
      householdOwnerCurrentPeriodEnd
    );

  const inheritsFamilyPlan =
    hasActiveMembership &&
    ownerHasActiveFamily;

  const personalGrantsAccess =
    isSubscriptionGrantingAccess(
      personalPlan,
      personalStatus,
      personalCurrentPeriodEnd
    );

  const hasActiveAdminGrant =
    isGrantProvidingAccess(adminGrant);

  const adminGrantPlan = hasActiveAdminGrant
    ? adminGrant.plan
    : null;

  const adminGrantExpiresAt =
    hasActiveAdminGrant
      ? adminGrant.expiresAt
      : null;

  let effectivePlan: SubscriptionPlan =
    personalGrantsAccess
      ? personalPlan
      : "free";

  let effectiveStatus = personalGrantsAccess
    ? personalStatus
    : "inactive";

  let effectivePlanSource: EffectivePlanSource =
    personalGrantsAccess
      ? personalPlan === "family"
        ? "personal_family"
        : "personal_pro"
      : "free";

  if (inheritsFamilyPlan) {
    effectivePlan = "family";
    effectiveStatus =
      householdOwnerStatus ??
      "active";
    effectivePlanSource = "inherited_family";
  }

  if (hasActiveAdminGrant) {
    effectivePlan = adminGrantPlan!;
    effectiveStatus = "active";
    effectivePlanSource =
      adminGrantPlan === "family"
        ? "admin_grant_family"
        : "admin_grant_pro";
  }

  const emptyUsageLimits =
    resolveUsageLimits(
      "free",
      false,
      false
    );

  const emptyFeatureAccess =
    buildPlanFeatureAccess(
      "free",
      false
    );

  const emptyAdminGrantFields = {
    effectivePlanSource: "demo" as EffectivePlanSource,
    adminGrantPlan: null,
    adminGrantExpiresAt: null,
    hasActiveAdminGrant: false,
  };

  if (isDemo) {
    return {
      personalPlan,
      effectivePlan: "free",
      householdPlan,
      planDisplayName: "Demo",
      householdRole: rawHouseholdRole,
      roleDisplayName: rawHouseholdRole
        ? "Demo Viewer"
        : null,
      hasFamilyFeatureAccess: false,
      hasPremiumFeatureAccess: false,
      isFamilyPlanMember: false,
      isFamilyPlanAdmin: false,
      isFamilyMember: false,
      isFamilyViewer: false,
      isBillingOwner: false,
      canManageBilling: false,
      billingManagedByHousehold: false,
      billingOwnerName: null,
      inheritsFamilyPlan: false,
      effectiveStatus: "inactive",
      ...emptyAdminGrantFields,
      effectivePlanSource: "demo",
      usageLimits: emptyUsageLimits,
      featureAccess: emptyFeatureAccess,
    };
  }

  if (isPlatformAdmin) {
    const adminFeatureAccess =
      buildPlanFeatureAccess(
        "family",
        true
      );

    return {
      personalPlan,
      effectivePlan: "family",
      householdPlan,
      planDisplayName: "Master Account",
      householdRole: rawHouseholdRole,
      roleDisplayName:
        getRoleDisplayName(
          rawHouseholdRole,
          {
            effectivePlan: "family",
            userId,
            householdOwnerId,
          }
        ),
      hasFamilyFeatureAccess: true,
      hasPremiumFeatureAccess: true,
      isFamilyPlanMember:
        inheritsFamilyPlan,
      isFamilyPlanAdmin: true,
      isFamilyMember:
        rawHouseholdRole === "member",
      isFamilyViewer:
        rawHouseholdRole === "viewer",
      isBillingOwner: true,
      canManageBilling: true,
      billingManagedByHousehold: false,
      billingOwnerName: null,
      inheritsFamilyPlan,
      effectiveStatus: "active",
      effectivePlanSource: "platform_admin",
      adminGrantPlan,
      adminGrantExpiresAt,
      hasActiveAdminGrant,
      usageLimits: resolveUsageLimits(
        "family",
        true,
        true
      ),
      featureAccess: adminFeatureAccess,
    };
  }

  const adminGrantProvidesFamily =
    hasActiveAdminGrant &&
    adminGrantPlan === "family";

  const hasFamilyFeatureAccess =
    effectivePlan === "family" &&
    (inheritsFamilyPlan ||
      adminGrantProvidesFamily ||
      isSubscriptionGrantingAccess(
        personalPlan,
        personalStatus,
        personalCurrentPeriodEnd
      ));

  const hasPremiumFeatureAccess =
    effectivePlan === "pro" ||
    hasFamilyFeatureAccess;

  const isBillingOwner =
    Boolean(userId) &&
    hasPersonalStripeCustomer &&
    personalGrantsAccess &&
    personalPlan !== "free";

  const isAuthorizedBillingRole =
    !rawHouseholdRole ||
    rawHouseholdRole === "owner" ||
    rawHouseholdRole === "admin" ||
    Boolean(
      userId &&
        householdOwnerId &&
        userId === householdOwnerId
    );

  const canManageBilling =
    isBillingOwner &&
    isAuthorizedBillingRole;

  const isFamilyPlanMember =
    hasFamilyFeatureAccess &&
    hasActiveMembership;

  const isFamilyPlanAdmin =
    isFamilyPlanMember &&
    (rawHouseholdRole === "owner" ||
      rawHouseholdRole === "admin" ||
      Boolean(
        userId &&
          householdOwnerId &&
          userId === householdOwnerId
      ));

  const isFamilyMember =
    isFamilyPlanMember &&
    rawHouseholdRole === "member";

  const isFamilyViewer =
    isFamilyPlanMember &&
    rawHouseholdRole === "viewer";

  const billingManagedByHousehold =
    isFamilyPlanMember &&
    inheritsFamilyPlan &&
    !canManageBilling;

  const roleDisplayName =
    getRoleDisplayName(
      rawHouseholdRole,
      {
        effectivePlan,
        userId,
        householdOwnerId,
      }
    );

  const planDisplayName =
    hasActiveAdminGrant
      ? adminGrantPlan === "family"
        ? "Complimentary Family"
        : "Complimentary Pro"
      : getPlanDisplayName(
          effectivePlan
        );

  const usageLimits =
    resolveUsageLimits(
      effectivePlan,
      false,
      hasFamilyFeatureAccess
    );

  const featureAccess =
    buildPlanFeatureAccess(
      effectivePlan,
      false
    );

  return {
    personalPlan,
    effectivePlan,
    householdPlan,
    planDisplayName,
    householdRole: rawHouseholdRole,
    roleDisplayName,
    hasFamilyFeatureAccess,
    hasPremiumFeatureAccess,
    isFamilyPlanMember,
    isFamilyPlanAdmin,
    isFamilyMember,
    isFamilyViewer,
    isBillingOwner,
    canManageBilling,
    billingManagedByHousehold,
    billingOwnerName:
      billingManagedByHousehold
        ? householdOwnerName
        : null,
    inheritsFamilyPlan,
    effectiveStatus,
    effectivePlanSource,
    adminGrantPlan,
    adminGrantExpiresAt,
    hasActiveAdminGrant,
    usageLimits,
    featureAccess,
  };
}

export function getPlanDescription(
  plan: SubscriptionPlan
): string {
  if (plan === "family") {
    return "Premium tools, network discovery, reports, and household sharing are unlocked.";
  }

  if (plan === "pro") {
    return "Premium tools, network discovery, reports, and advanced features are unlocked.";
  }

  return "You currently have access to the free Home Tech Vault features.";
}

export function formatSubscriptionStatus(
  status: string
): string {
  if (
    !status ||
    status === "inactive"
  ) {
    return "Inactive";
  }

  if (status === "past_due") {
    return "Past Due";
  }

  if (status === "trialing") {
    return "Trial";
  }

  if (status === "canceled") {
    return "Canceled";
  }

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}
