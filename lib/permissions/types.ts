import type { User } from "@supabase/supabase-js";

import type {
  RawHouseholdRole,
} from "@/lib/permissions/effectivePlan";

import type {
  SubscriptionPlan,
} from "@/hooks/useSubscription";

export type AccessContext =
  | "personal"
  | "household"
  | "demo";

export type HouseholdRole =
  | "viewer"
  | "member"
  | "admin";

export type FeatureKey =
  | "dashboard"
  | "devices"
  | "deviceDetails"
  | "documents"
  | "warranties"
  | "maintenance"
  | "network"
  | "networkDiscover"
  | "rooms"
  | "subscriptions"
  | "reports"
  | "insights"
  | "aiAdvisor"
  | "family"
  | "settings"
  | "account"
  | "notifications"
  | "securityCenter"
  | "audit"
  | "billing";

export type FeaturePlanRequirement =
  | "free"
  | "pro"
  | "family";

export type UpgradeReasonCode =
  | "demo_read_only"
  | "viewer_read_only"
  | "admin_required"
  | "requires_pro"
  | "requires_family"
  | "device_limit_reached"
  | "document_limit_reached"
  | "unauthenticated";

export type FeatureAccess = {
  allowed: boolean;
  requiresUpgrade: boolean;
  upgradeReason: string | null;
  upgradeReasonCode: UpgradeReasonCode | null;
  lockedReason:
    | "none"
    | "demo"
    | "viewer"
    | "subscription"
    | "limit"
    | "unauthenticated";
  requiredPlan: FeaturePlanRequirement;
  upgradeHref: string;
  blockedHref: string;
};

export type PermissionContext = {
  user: User | null;
  isDemo: boolean;
  role: HouseholdRole | null;
  rawHouseholdRole: RawHouseholdRole | null;
  householdId: string | null;
  plan: SubscriptionPlan;
  isPlatformAdmin: boolean;
  canUsePremiumFeatures: boolean;
  canUseFamilySharing: boolean;
  hasFamilyFeatureAccess: boolean;
  billingManagedByHousehold: boolean;
  inheritsFamilyPlan: boolean;
  inheritsProPlan: boolean;
  inheritsHouseholdPlan: boolean;
  hasUnlimitedDevices: boolean;
  hasUnlimitedDocuments: boolean;
  deviceLimit: number | null;
  documentLimit: number | null;
  canManageBilling: boolean;
  featureAccess: Record<FeatureKey, boolean>;
};

export type UpgradeReasonOptions = {
  feature?: FeatureKey;
  deviceCount?: number;
  documentCount?: number;
  needsAdmin?: boolean;
  requiresWriteAccess?: boolean;
};

export type ComputedPermissions = {
  accessContext: AccessContext;
  householdRole: RawHouseholdRole | null;
  isPersonalVault: boolean;
  isHouseholdMember: boolean;

  isAuthenticated: boolean;
  isViewer: boolean;
  isMember: boolean;
  isAdmin: boolean;

  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canUpload: boolean;
  canComplete: boolean;
  /** Alias for maintenance and task completion permissions. */
  canCompleteMaintenance: boolean;
  /** Alias for destructive household content deletion. */
  canDeleteContent: boolean;
  canInvite: boolean;
  canManageBilling: boolean;
  canManageHousehold: boolean;
  /** Alias for household member and role management. */
  canManageMembers: boolean;
  canManageSettings: boolean;

  isDeviceLimitReached: (
    count: number
  ) => boolean;
  isDocumentLimitReached: (
    count: number
  ) => boolean;
  canAddDevice: (count: number) => boolean;
  canAddDocument: (
    count: number
  ) => boolean;

  requiresUpgrade: (
    feature: FeatureKey
  ) => boolean;
  upgradeReason: (
    options?: UpgradeReasonOptions
  ) => string | null;
  upgradeReasonCode: (
    options?: UpgradeReasonOptions
  ) => UpgradeReasonCode | null;

  canViewFeature: (
    feature: FeatureKey
  ) => boolean;
  canAccessFeature: (
    feature: FeatureKey
  ) => boolean;
  getFeatureAccess: (
    feature: FeatureKey
  ) => FeatureAccess;
  getActionHref: (
    targetHref: string,
    feature?: FeatureKey
  ) => string;
  getActionLabel: (
    label: string,
    lockedLabel?: string
  ) => string;
  canPerformCreate: (
    feature?: FeatureKey
  ) => boolean;
  canPerformEdit: (
    feature?: FeatureKey
  ) => boolean;
  canPerformDelete: (
    feature?: FeatureKey
  ) => boolean;
};
