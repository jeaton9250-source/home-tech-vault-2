import type {
  EffectivePlanInput,
} from "@/lib/permissions/effectivePlan";

import type {
  RawHouseholdRole,
} from "@/lib/permissions/effectivePlan";

import type {
  SubscriptionPlan,
} from "@/hooks/useSubscription";

export const DEV_ACCESS_STORAGE_KEY =
  "home-tech-vault-dev-access-profile";

export const DEV_ACCESS_CHANGE_EVENT =
  "home-tech-vault-dev-access-change";

/** Internal household id used only for plan simulation — never for Supabase queries. */
export const DEV_SIMULATION_HOUSEHOLD_ID =
  "dev-access-simulation";

export type DevAccessProfile =
  | "real"
  | "demo"
  | "free"
  | "pro"
  | "family-admin"
  | "family-member"
  | "family-viewer"
  | "platform-admin";

export const DEV_ACCESS_PROFILE_OPTIONS: {
  id: DevAccessProfile;
  label: string;
  description: string;
}[] = [
  {
    id: "real",
    label: "Real Account",
    description:
      "Authenticated user with live subscription, household, and permissions.",
  },
  {
    id: "demo",
    label: "Demo User",
    description:
      "Existing Demo Mode sample data. Read-only.",
  },
  {
    id: "free",
    label: "Free User",
    description:
      "Simulated Free plan with standard limits and upgrade prompts.",
  },
  {
    id: "pro",
    label: "Pro User",
    description:
      "Simulated Pro plan. Premium features without Family household tools.",
  },
  {
    id: "family-admin",
    label: "Family Plan Admin",
    description:
      "Simulated Family plan with admin household role.",
  },
  {
    id: "family-member",
    label: "Family Member",
    description:
      "Simulated Family plan with member role.",
  },
  {
    id: "family-viewer",
    label: "Family Viewer",
    description:
      "Simulated Family plan with read-only viewer role.",
  },
  {
    id: "platform-admin",
    label: "Platform Admin",
    description:
      "Simulated platform-admin bypass. Does not change profiles.is_admin.",
  },
];

export function isDevelopmentEnvironment(): boolean {
  return (
    process.env.NODE_ENV ===
    "development"
  );
}

export function isDevAccessProfile(
  value: string | null | undefined
): value is DevAccessProfile {
  return DEV_ACCESS_PROFILE_OPTIONS.some(
    (option) => option.id === value
  );
}

export function getDevAccessProfileLabel(
  profile: DevAccessProfile
): string {
  return (
    DEV_ACCESS_PROFILE_OPTIONS.find(
      (option) =>
        option.id === profile
    )?.label ?? profile
  );
}

function simulateFamilyPlanInput(
  base: EffectivePlanInput,
  rawRole: RawHouseholdRole
): EffectivePlanInput {
  return {
    ...base,
    isDemo: false,
    isPlatformAdmin: false,
    personalPlan: "free",
    personalStatus: "inactive",
    personalCurrentPeriodEnd: null,
    hasPersonalStripeCustomer: false,
    householdId:
      DEV_SIMULATION_HOUSEHOLD_ID,
    householdOwnerId:
      base.userId ?? "dev-owner",
    householdOwnerPlan: "family",
    householdOwnerStatus: "active",
    householdOwnerCurrentPeriodEnd:
      null,
    householdOwnerName:
      "Dev Family Admin",
    rawHouseholdRole: rawRole,
  };
}

/**
 * Build plan-resolution inputs for a development access profile.
 * Uses a synthetic household id for Family simulations only.
 * Callers must keep exporting the real household id for data loaders.
 */
export function buildDevelopmentPlanInput(
  profile: DevAccessProfile,
  base: EffectivePlanInput
): EffectivePlanInput {
  if (
    profile === "real" ||
    !isDevelopmentEnvironment()
  ) {
    return base;
  }

  switch (profile) {
    case "demo":
      return {
        ...base,
        isDemo: true,
        isPlatformAdmin: false,
        personalPlan: "free",
        personalStatus: "inactive",
        personalCurrentPeriodEnd: null,
        hasPersonalStripeCustomer: false,
        householdId: null,
        householdOwnerId: null,
        householdOwnerPlan: null,
        householdOwnerStatus: null,
        householdOwnerCurrentPeriodEnd:
          null,
        householdOwnerName: null,
        rawHouseholdRole: null,
      };

    case "free":
      return {
        ...base,
        isDemo: false,
        isPlatformAdmin: false,
        personalPlan: "free",
        personalStatus: "inactive",
        personalCurrentPeriodEnd: null,
        hasPersonalStripeCustomer: false,
        householdId: null,
        householdOwnerId: null,
        householdOwnerPlan: null,
        householdOwnerStatus: null,
        householdOwnerCurrentPeriodEnd:
          null,
        householdOwnerName: null,
        rawHouseholdRole: null,
      };

    case "pro":
      return {
        ...base,
        isDemo: false,
        isPlatformAdmin: false,
        personalPlan: "pro",
        personalStatus: "active",
        personalCurrentPeriodEnd: null,
        hasPersonalStripeCustomer: true,
        householdId: null,
        householdOwnerId: null,
        householdOwnerPlan: null,
        householdOwnerStatus: null,
        householdOwnerCurrentPeriodEnd:
          null,
        householdOwnerName: null,
        rawHouseholdRole: null,
      };

    case "family-admin":
      return simulateFamilyPlanInput(
        base,
        "owner"
      );

    case "family-member":
      return simulateFamilyPlanInput(
        base,
        "member"
      );

    case "family-viewer":
      return simulateFamilyPlanInput(
        base,
        "viewer"
      );

    case "platform-admin":
      return {
        ...base,
        isDemo: false,
        isPlatformAdmin: true,
      };

    default:
      return base;
  }
}

export function profileUsesDemoMode(
  profile: DevAccessProfile
): boolean {
  return profile === "demo";
}

export function getSimulatedPersonalPlan(
  profile: DevAccessProfile
): SubscriptionPlan | null {
  switch (profile) {
    case "pro":
      return "pro";
    case "free":
    case "demo":
      return "free";
    default:
      return null;
  }
}
