export {
  FEATURE_LABELS,
  FEATURE_REQUIREMENTS,
} from "@/lib/permissions/features";

export {
  computePermissions,
  normalizeHouseholdRole,
  normalizeRawHouseholdRole,
  buildUpgradeReasonMessage,
  resolveUpgradeReason,
} from "@/lib/permissions/computePermissions";

export {
  hasHouseholdViewerRestrictions,
} from "@/lib/permissions/householdRole";

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

export {
  evaluateHouseholdQuota,
  getHouseholdLimitMessage,
  loadHouseholdUsageCounts,
  resolveHouseholdQuotaLimits,
} from "@/lib/permissions/householdQuota";

export type {
  HouseholdLimitReason,
  HouseholdQuotaState,
  HouseholdUsageCounts,
} from "@/lib/permissions/householdQuota";

export type {
  AccessContext,
  ComputedPermissions,
  FeatureAccess,
  FeatureKey,
  FeaturePlanRequirement,
  HouseholdRole,
  PermissionContext,
  UpgradeReasonCode,
  UpgradeReasonOptions,
} from "@/lib/permissions/types";
