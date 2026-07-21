export {
  FEATURE_LABELS,
  FEATURE_REQUIREMENTS,
} from "@/lib/permissions/features";

export {
  computePermissions,
  normalizeHouseholdRole,
  buildUpgradeReasonMessage,
  resolveUpgradeReason,
} from "@/lib/permissions/computePermissions";

export {
  buildPlanFeatureAccess,
  formatSubscriptionStatus,
  getPlanDescription,
  getPlanDisplayName,
  getRoleDisplayName,
  isActiveSubscriptionStatus,
  isSubscriptionGrantingAccess,
  resolveEffectivePlan,
  resolveUsageLimits,
} from "@/lib/permissions/effectivePlan";

export type {
  EffectivePlanInput,
  EffectivePlanResult,
  RawHouseholdRole,
  UsageLimits,
} from "@/lib/permissions/effectivePlan";

export {
  FREE_DEVICE_LIMIT,
  FREE_DOCUMENT_LIMIT,
  PLAN_FEATURES,
  PLAN_LIMITS,
  getLimitsForPlan,
} from "@/lib/permissions/plans";

export {
  canSendHouseholdInvitation,
  householdOwnerHasFamilyProductAccess,
  householdOwnerHasGrantingFamilyPlan,
  isAdminHouseholdRole,
  normalizeSubscriptionPlan,
} from "@/lib/permissions/subscriptionAccess";

export {
  applyHouseholdScope,
  applyHouseholdMutationScope,
  applyOwnerUserScope,
  fetchHouseholdIdForUser,
  loadNetworkInfoRows,
  resolveHouseholdAccess,
  resolveHouseholdScope,
  resolveOwnerUserId,
  TABLE_SCOPE,
  withHouseholdInsertFields,
  withOwnerUserInsertFields,
} from "@/lib/data/householdScope";

export type { HouseholdScope } from "@/lib/data/householdScope";

export type {
  ComputedPermissions,
  FeatureAccess,
  FeatureKey,
  FeaturePlanRequirement,
  HouseholdRole,
  PermissionContext,
  UpgradeReasonCode,
  UpgradeReasonOptions,
} from "@/lib/permissions/types";
