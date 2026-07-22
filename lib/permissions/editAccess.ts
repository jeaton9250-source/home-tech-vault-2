import { FEATURE_REQUIREMENTS } from "@/lib/permissions/features";

import type { FeatureKey } from "@/lib/permissions/types";

export type EditAccessReason =
  | "allowed"
  | "loading"
  | "viewer_read_only"
  | "role_not_permitted"
  | "household_plan_required"
  | "unauthenticated"
  | "demo_read_only";

export type EditAccessResult = {
  allowed: boolean;
  reason: EditAccessReason;
};

export function getEditAccess(options: {
  loading?: boolean;
  isDemo: boolean;
  isAuthenticated: boolean;
  isViewer: boolean;
  canEdit: boolean;
  feature?: FeatureKey;
  isPlatformAdmin: boolean;
  canUsePremiumFeatures: boolean;
  canUseFamilySharing: boolean;
}): EditAccessResult {
  if (options.loading) {
    return {
      allowed: false,
      reason: "loading",
    };
  }

  if (options.isDemo) {
    return {
      allowed: false,
      reason: "demo_read_only",
    };
  }

  if (!options.isAuthenticated) {
    return {
      allowed: false,
      reason: "unauthenticated",
    };
  }

  if (options.isViewer) {
    return {
      allowed: false,
      reason: "viewer_read_only",
    };
  }

  if (!options.canEdit) {
    return {
      allowed: false,
      reason: "role_not_permitted",
    };
  }

  if (options.feature) {
    const requiredPlan =
      FEATURE_REQUIREMENTS[options.feature];

    if (
      requiredPlan === "pro" &&
      !options.isPlatformAdmin &&
      !options.canUsePremiumFeatures
    ) {
      return {
        allowed: false,
        reason: "household_plan_required",
      };
    }

    if (
      requiredPlan === "family" &&
      !options.isPlatformAdmin &&
      !options.canUseFamilySharing
    ) {
      return {
        allowed: false,
        reason: "household_plan_required",
      };
    }
  }

  return {
    allowed: true,
    reason: "allowed",
  };
}

export function getEditAccessMessage(
  reason: EditAccessReason
): {
  title: string;
  body: string;
  showUpgrade: boolean;
} {
  switch (reason) {
    case "viewer_read_only":
      return {
        title:
          "This household is read-only for your account",
        body:
          "Your Viewer role allows you to view this information, but only Members and Admins can make changes.",
        showUpgrade: false,
      };

    case "role_not_permitted":
      return {
        title: "Admin permission required",
        body:
          "Only a household Admin can make this change.",
        showUpgrade: false,
      };

    case "household_plan_required":
      return {
        title:
          "This feature requires Home Tech Vault Pro",
        body:
          "Upgrade this household to use this feature.",
        showUpgrade: true,
      };

    case "loading":
      return {
        title: "Checking access",
        body:
          "Loading your household role and plan.",
        showUpgrade: false,
      };

    default:
      return {
        title: "Unable to edit",
        body:
          "You do not have permission to make this change.",
        showUpgrade: false,
      };
  }
}
