import { FEATURE_REQUIREMENTS } from "@/lib/permissions/features";

import type { FeatureKey } from "@/lib/permissions/types";

export function planBadgeLabel(
  feature: FeatureKey
): string | null {
  const required =
    FEATURE_REQUIREMENTS[feature];

  if (required === "pro") {
    return "Pro";
  }

  if (required === "family") {
    return "Family";
  }

  return null;
}

export function shouldShowPremiumBadge(
  feature: FeatureKey | undefined,
  canViewFeature: (feature: FeatureKey) => boolean,
  inheritsFamilyPlan: boolean,
  hasFamilyFeatureAccess: boolean
): string | null {
  if (!feature || canViewFeature(feature)) {
    return null;
  }

  const required =
    FEATURE_REQUIREMENTS[feature];

  if (
    required === "family" &&
    inheritsFamilyPlan &&
    hasFamilyFeatureAccess
  ) {
    return null;
  }

  return planBadgeLabel(feature);
}

export function canSeeNavDestination(
  feature: FeatureKey | undefined,
  canViewFeature: (feature: FeatureKey) => boolean
): boolean {
  if (!feature) {
    return true;
  }

  return canViewFeature(feature);
}
