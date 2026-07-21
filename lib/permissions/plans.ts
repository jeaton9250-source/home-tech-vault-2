import type {
  SubscriptionPlan,
} from "@/hooks/useSubscription";

export const FREE_DEVICE_LIMIT = 8;
export const FREE_DOCUMENT_LIMIT = 25;

export type PlanLimits = {
  maxDevices: number | null;
  maxDocuments: number | null;
};

export const PLAN_LIMITS: Record<
  SubscriptionPlan,
  PlanLimits
> = {
  free: {
    maxDevices: FREE_DEVICE_LIMIT,
    maxDocuments: FREE_DOCUMENT_LIMIT,
  },
  pro: {
    maxDevices: null,
    maxDocuments: null,
  },
  family: {
    maxDevices: null,
    maxDocuments: null,
  },
};

export type PlanFeatureSummary = {
  label: string;
  items: string[];
};

export const PLAN_FEATURES: Record<
  SubscriptionPlan,
  PlanFeatureSummary
> = {
  free: {
    label: "Free",
    items: [
      `Up to ${FREE_DEVICE_LIMIT} devices`,
      "Up to 25 documents",
      "Basic warranty tracking",
      "Basic maintenance",
      "Demo Mode",
    ],
  },
  pro: {
    label: "Pro",
    items: [
      "Unlimited devices",
      "Unlimited documents",
      "Unlimited warranties",
      "Unlimited maintenance",
      "AI Advisor",
      "Advanced reports",
      "Network monitoring",
      "Unlimited uploads",
      "Priority support",
    ],
  },
  family: {
    label: "Family",
    items: [
      "Everything in Pro",
      "Household creation",
      "Household invitations",
      "Multiple members",
      "Viewer, Member, and Admin roles",
      "Shared vault",
      "Shared maintenance",
      "Shared documents",
      "Shared subscriptions",
    ],
  },
};

export function getLimitsForPlan(
  plan: SubscriptionPlan,
  isPlatformAdmin: boolean
): PlanLimits {
  if (isPlatformAdmin) {
    return {
      maxDevices: null,
      maxDocuments: null,
    };
  }

  return PLAN_LIMITS[plan];
}
