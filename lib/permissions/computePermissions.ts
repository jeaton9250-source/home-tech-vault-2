import {
  FEATURE_REQUIREMENTS,
} from "@/lib/permissions/features";
import {
  hasHouseholdViewerRestrictions,
} from "@/lib/permissions/householdRole";
import {
  buildUpgradeReasonMessage,
  resolveUpgradeReason,
} from "@/lib/permissions/upgradeReasons";

import type {
  ComputedPermissions,
  FeatureAccess,
  FeatureKey,
  FeaturePlanRequirement,
  PermissionContext,
  UpgradeReasonCode,
  UpgradeReasonOptions,
} from "@/lib/permissions/types";

export {
  buildUpgradeReasonMessage,
  resolveUpgradeReason,
} from "@/lib/permissions/upgradeReasons";

export {
  normalizeHouseholdRole,
  normalizeRawHouseholdRole,
} from "@/lib/permissions/householdRole";

function meetsPlanRequirement(
  requiredPlan: FeaturePlanRequirement,
  context: PermissionContext
): boolean {
  if (requiredPlan === "free") {
    return true;
  }

  if (context.isPlatformAdmin) {
    return true;
  }

  if (requiredPlan === "pro") {
    return context.canUsePremiumFeatures;
  }

  return context.canUseFamilySharing;
}

function blockedHrefForReason(
  code: UpgradeReasonCode | null,
  context: PermissionContext
): string {
  if (context.isDemo) {
    return "/signup";
  }

  if (!code) {
    return "/signup";
  }

  if (
    code === "requires_pro" ||
    code === "requires_family" ||
    code === "device_limit_reached" ||
    code === "document_limit_reached"
  ) {
    if (
      context.billingManagedByHousehold ||
      context.inheritsFamilyPlan ||
      context.hasFamilyFeatureAccess
    ) {
      return "/family";
    }

    return "/upgrade";
  }

  if (code === "unauthenticated") {
    return "/login";
  }

  return "/signup";
}

export function computePermissions(
  context: PermissionContext
): ComputedPermissions {
  const isAuthenticated =
    Boolean(context.user) &&
    !context.isDemo;

  const hasHouseholdMembership =
    Boolean(context.householdId);

  const isPersonalVault =
    isAuthenticated &&
    !hasHouseholdMembership;

  const isHouseholdMember =
    hasHouseholdMembership;

  const accessContext = context.isDemo
    ? "demo"
    : hasHouseholdMembership
      ? "household"
      : "personal";

  const isViewer = hasHouseholdViewerRestrictions(
    {
      householdId: context.householdId,
      role: context.role,
    }
  );

  const isMember =
    hasHouseholdMembership &&
    context.role === "member";

  const isAdmin =
    hasHouseholdMembership &&
    context.role === "admin";

  const roleCanMutate =
    isPersonalVault ||
    isMember ||
    isAdmin;

  const canView = true;

  const canCreate =
    !context.isDemo && roleCanMutate;

  const canEdit =
    !context.isDemo && roleCanMutate;

  const canDelete =
    !context.isDemo &&
    (isPersonalVault || isAdmin);

  const canUpload =
    !context.isDemo && roleCanMutate;

  const canComplete =
    !context.isDemo && roleCanMutate;

  const canInvite =
    !context.isDemo &&
    isAdmin &&
    context.hasFamilyFeatureAccess;

  const canManageBilling =
    context.canManageBilling;

  const canManageHousehold =
    !context.isDemo &&
    isAdmin &&
    context.hasFamilyFeatureAccess;

  const canManageSettings =
    !context.isDemo && isAdmin;

  function isDeviceLimitReached(
    count: number
  ): boolean {
    return (
      context.deviceLimit !== null &&
      count >= context.deviceLimit
    );
  }

  function isDocumentLimitReached(
    count: number
  ): boolean {
    return (
      context.documentLimit !== null &&
      count >= context.documentLimit
    );
  }

  function canAddDevice(
    count: number
  ): boolean {
    return (
      canCreate &&
      !isDeviceLimitReached(count)
    );
  }

  function canAddDocument(
    count: number
  ): boolean {
    if (!canUpload) {
      return false;
    }

    return !isDocumentLimitReached(count);
  }

  function upgradeReasonCode(
    options?: UpgradeReasonOptions
  ): UpgradeReasonCode | null {
    return resolveUpgradeReason(
      context,
      options
    );
  }

  function upgradeReason(
    options?: UpgradeReasonOptions
  ): string | null {
    const code = upgradeReasonCode(
      options
    );

    if (!code) {
      return null;
    }

    const requiredPlan = options?.feature
      ? FEATURE_REQUIREMENTS[
          options.feature
        ]
      : undefined;

    return buildUpgradeReasonMessage(
      code,
      {
        feature: options?.feature,
        requiredPlan,
      }
    );
  }

  function canViewFeature(
    feature: FeatureKey
  ): boolean {
    if (context.isDemo) {
      return true;
    }

    if (!isAuthenticated) {
      return false;
    }

    return (
      context.isPlatformAdmin ||
      context.featureAccess[feature]
    );
  }

  function getFeatureAccess(
    feature: FeatureKey
  ): FeatureAccess {
    const requiredPlan =
      FEATURE_REQUIREMENTS[feature];

    if (context.isDemo) {
      return {
        allowed: true,
        requiresUpgrade: false,
        upgradeReason: null,
        upgradeReasonCode: null,
        lockedReason: "none",
        requiredPlan,
        upgradeHref: "/upgrade",
        blockedHref: "/signup",
      };
    }

    if (!isAuthenticated) {
      const code: UpgradeReasonCode =
        "unauthenticated";

      return {
        allowed: false,
        requiresUpgrade: false,
        upgradeReason:
          buildUpgradeReasonMessage(
            code,
            { feature }
          ),
        upgradeReasonCode: code,
        lockedReason: "unauthenticated",
        requiredPlan,
        upgradeHref: "/upgrade",
        blockedHref: "/login",
      };
    }

    if (!canViewFeature(feature)) {
      const code: UpgradeReasonCode =
        requiredPlan === "family"
          ? "requires_family"
          : "requires_pro";

      return {
        allowed: false,
        requiresUpgrade: true,
        upgradeReason:
          buildUpgradeReasonMessage(
            code,
            {
              feature,
              requiredPlan,
            }
          ),
        upgradeReasonCode: code,
        lockedReason: "subscription",
        requiredPlan,
        upgradeHref: "/upgrade",
        blockedHref:
          blockedHrefForReason(
            code,
            context
          ),
      };
    }

    const writeBlockCode =
      resolveUpgradeReason(context, {
        feature,
        requiresWriteAccess: true,
      });

    return {
      allowed: true,
      requiresUpgrade: false,
      upgradeReason: writeBlockCode
        ? buildUpgradeReasonMessage(
            writeBlockCode,
            {
              feature,
              requiredPlan,
            }
          )
        : null,
      upgradeReasonCode: writeBlockCode,
      lockedReason:
        writeBlockCode ===
        "viewer_read_only"
          ? "viewer"
          : writeBlockCode
            ? "limit"
            : "none",
      requiredPlan,
      upgradeHref: "/upgrade",
      blockedHref: writeBlockCode
        ? blockedHrefForReason(
            writeBlockCode,
            context
          )
        : "/signup",
    };
  }

  function canAccessFeature(
    feature: FeatureKey
  ): boolean {
    return canViewFeature(feature);
  }

  function requiresUpgrade(
    feature: FeatureKey
  ): boolean {
    if (context.isDemo) {
      return false;
    }

    if (!isAuthenticated) {
      return false;
    }

    return !canViewFeature(feature);
  }

  function canPerformCreate(
    feature?: FeatureKey
  ): boolean {
    if (!canCreate) {
      return false;
    }

    if (!feature) {
      return true;
    }

    const code = resolveUpgradeReason(
      context,
      {
        feature,
        requiresWriteAccess: true,
      }
    );

    return code === null;
  }

  function canPerformEdit(
    feature?: FeatureKey
  ): boolean {
    if (!canEdit) {
      return false;
    }

    if (!feature) {
      return true;
    }

    const code = resolveUpgradeReason(
      context,
      {
        feature,
        requiresWriteAccess: true,
      }
    );

    return code === null;
  }

  function canPerformDelete(
    feature?: FeatureKey
  ): boolean {
    if (!canDelete) {
      return false;
    }

    if (!feature) {
      return true;
    }

    const code = resolveUpgradeReason(
      context,
      {
        feature,
        requiresWriteAccess: true,
      }
    );

    return code === null;
  }

  function getActionHref(
    targetHref: string,
    feature?: FeatureKey
  ): string {
    if (context.isDemo) {
      return targetHref;
    }

    if (feature && requiresUpgrade(feature)) {
      return "/upgrade";
    }

    const code = upgradeReasonCode({
      feature,
    });

    if (code) {
      return blockedHrefForReason(
        code,
        context
      );
    }

    if (!canCreate) {
      return "/signup";
    }

    return targetHref;
  }

  function getActionLabel(
    label: string,
    lockedLabel = "Create Your Vault"
  ): string {
    if (canCreate) {
      return label;
    }

    if (context.isDemo) {
      return label;
    }

    if (isViewer) {
      return "View Only";
    }

    return lockedLabel;
  }

  return {
    accessContext,
    householdRole: hasHouseholdMembership
      ? context.rawHouseholdRole
      : null,
    isPersonalVault,
    isHouseholdMember,

    isAuthenticated,
    isViewer,
    isMember,
    isAdmin,

    canView,
    canCreate,
    canEdit,
    canDelete,
    canUpload,
    canComplete,
    canCompleteMaintenance: canComplete,
    canDeleteContent: canDelete,
    canInvite,
    canManageBilling,
    canManageHousehold,
    canManageMembers: canManageHousehold,
    canManageSettings,

    isDeviceLimitReached,
    isDocumentLimitReached,
    canAddDevice,
    canAddDocument,

    requiresUpgrade,
    upgradeReason,
    upgradeReasonCode,
    canViewFeature,
    canAccessFeature,
    getFeatureAccess,
    getActionHref,
    getActionLabel,
    canPerformCreate,
    canPerformEdit,
    canPerformDelete,
  };
}
