import {
  FEATURE_LABELS,
  FEATURE_REQUIREMENTS,
} from "@/lib/permissions/features";
import {
  hasHouseholdViewerRestrictions,
} from "@/lib/permissions/householdRole";
import {
  FREE_DEVICE_LIMIT,
  FREE_DOCUMENT_LIMIT,
} from "@/lib/permissions/plans";

import type {
  FeatureKey,
  FeaturePlanRequirement,
  PermissionContext,
  UpgradeReasonCode,
  UpgradeReasonOptions,
} from "@/lib/permissions/types";

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

function planLabel(
  plan: FeaturePlanRequirement
): string {
  if (plan === "family") {
    return "Family";
  }

  if (plan === "pro") {
    return "Pro";
  }

  return "Free";
}

export function buildUpgradeReasonMessage(
  code: UpgradeReasonCode,
  context?: {
    feature?: FeatureKey;
    requiredPlan?: FeaturePlanRequirement;
  }
): string {
  const featureName = context?.feature
    ? FEATURE_LABELS[context.feature]
    : "This feature";

  const required =
    context?.requiredPlan ?? "pro";

  switch (code) {
    case "demo_read_only":
      return "Demo mode is read-only. Create your vault to save and manage your own home technology.";

    case "viewer_read_only":
      return "Your household role is read-only. Contact an admin if you need permission to make changes.";

    case "admin_required":
      return "Only household admins can manage billing, members, and household settings.";

    case "requires_pro":
      return `${featureName} requires Home Tech Vault Pro. Upgrade for unlimited storage, AI Advisor, advanced reports, and network monitoring.`;

    case "requires_family":
      return `${featureName} requires Home Tech Vault Family. Upgrade to create a shared household with invitations and role-based access.`;

    case "device_limit_reached":
      return `Free accounts can store up to ${FREE_DEVICE_LIMIT} devices. Upgrade to Pro for unlimited device tracking.`;

    case "document_limit_reached":
      return `Free accounts can store up to ${FREE_DOCUMENT_LIMIT} documents. Upgrade to Pro for unlimited uploads.`;

    case "unauthenticated":
      return "Sign in to access this feature.";

    default:
      return `Upgrade to Home Tech Vault ${planLabel(required)} to unlock ${featureName}.`;
  }
}

export function resolveUpgradeReason(
  context: PermissionContext,
  options?: UpgradeReasonOptions
): UpgradeReasonCode | null {
  if (context.isDemo) {
    return "demo_read_only";
  }

  if (!context.user) {
    return "unauthenticated";
  }

  if (options?.needsAdmin) {
    if (
      context.role !== "admin" &&
      !context.isPlatformAdmin
    ) {
      return "admin_required";
    }
  }

  if (
    typeof options?.deviceCount ===
      "number" &&
    context.deviceLimit !== null &&
    options.deviceCount >=
      context.deviceLimit
  ) {
    return "device_limit_reached";
  }

  if (
    typeof options?.documentCount ===
      "number" &&
    context.documentLimit !== null &&
    options.documentCount >=
      context.documentLimit
  ) {
    return "document_limit_reached";
  }

  if (options?.feature) {
    const requiredPlan =
      FEATURE_REQUIREMENTS[
        options.feature
      ];

    if (
      !meetsPlanRequirement(
        requiredPlan,
        context
      )
    ) {
      return requiredPlan === "family"
        ? "requires_family"
        : "requires_pro";
    }
  }

  if (
    options?.requiresWriteAccess &&
    hasHouseholdViewerRestrictions({
      householdId: context.householdId,
      role: context.role,
    })
  ) {
    return "viewer_read_only";
  }

  return null;
}
