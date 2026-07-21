import type { SubscriptionPlan } from "@/hooks/useSubscription";

export type AdminGrantPlan = "pro" | "family";

export type AdminGrantStatus =
  | "active"
  | "revoked"
  | "expired";

export type EffectivePlanSource =
  | "demo"
  | "platform_admin"
  | "admin_grant_pro"
  | "admin_grant_family"
  | "inherited_family"
  | "personal_pro"
  | "personal_family"
  | "free";

export type ActivePlanGrant = {
  id: string;
  userId: string;
  plan: AdminGrantPlan;
  status: AdminGrantStatus;
  startsAt: string;
  expiresAt: string | null;
  reason: string;
  notes: string | null;
  grantedBy: string;
  revokedAt: string | null;
  createdAt: string;
};

export type SafePlanGrantSummary = {
  plan: AdminGrantPlan;
  expiresAt: string | null;
  reason: string;
};

export type PlanGrantInput = {
  plan: AdminGrantPlan | null;
  status: AdminGrantStatus;
  startsAt: string;
  expiresAt: string | null;
  reason: string;
  notes: string | null;
};

export const PLAN_GRANT_REASONS = [
  "Founding Member",
  "Beta Tester",
  "Employee",
  "Friend or Family",
  "Promotion",
  "Contest Winner",
  "Customer Service Credit",
  "Influencer or Partner",
  "Internal Testing",
  "Other",
] as const;

export type PlanGrantReason =
  (typeof PLAN_GRANT_REASONS)[number];

export const PLAN_GRANT_DURATIONS = [
  { id: "7d", label: "7 days", days: 7 },
  { id: "30d", label: "30 days", days: 30 },
  { id: "90d", label: "90 days", days: 90 },
  { id: "1y", label: "1 year", days: 365 },
  { id: "custom", label: "Custom expiration", days: null },
  { id: "none", label: "No expiration", days: null },
] as const;

export function isAdminGrantPlan(
  value: string
): value is AdminGrantPlan {
  return value === "pro" || value === "family";
}

export function grantPlanToEffectivePlan(
  plan: AdminGrantPlan
): SubscriptionPlan {
  return plan;
}
