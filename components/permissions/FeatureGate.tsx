"use client";

import type { ReactNode } from "react";

import { usePermissions } from "@/hooks/usePermissions";

import PremiumFeatureCard from "@/components/ui/PremiumFeatureCard";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

import PageShell from "@/components/ui/PageShell";

import type { FeatureKey } from "@/lib/permissions/types";
import { FEATURE_LABELS } from "@/lib/permissions/features";

type FeatureGateProps = {
  children: ReactNode;
  feature: FeatureKey;
  description?: string;
};

export default function FeatureGate({
  children,
  feature,
  description,
}: FeatureGateProps) {
  const {
    loading,
    isDemo,
    isPlatformAdmin,
    billingManagedByHousehold,
    canViewFeature,
    getFeatureAccess,
  } = usePermissions();

  const access =
    getFeatureAccess(feature);

  const featureLabel =
    FEATURE_LABELS[feature];

  const planUnlocked =
    isDemo ||
    isPlatformAdmin ||
    canViewFeature(feature);

  if (loading) {
    return (
      <PageShell>
        <DashboardSkeleton />
      </PageShell>
    );
  }

  if (planUnlocked) {
    return <>{children}</>;
  }

  const isReadOnlyLock =
    access.upgradeReasonCode ===
      "viewer_read_only" ||
    access.upgradeReasonCode ===
      "demo_read_only";

  const planLabel =
    access.requiredPlan === "family"
      ? "Family"
      : access.requiredPlan === "pro"
        ? "Pro"
        : "Premium";

  const features = isReadOnlyLock
    ? [
        "Contact your Family Plan Admin if you need edit access.",
      ]
    : [
        "Unlimited device tracking",
        "Network device discovery",
        "Advanced reports and analytics",
        "Insurance-ready exports",
        "Smart recommendations",
        ...(access.requiredPlan === "family"
          ? ["Household sharing and permissions"]
          : []),
      ];

  return (
    <PageShell>
      <PremiumFeatureCard
        title={`Unlock ${featureLabel}`}
        description={
          description ||
          access.upgradeReason ||
          (isReadOnlyLock
            ? `${featureLabel} is available on your Family plan, but your household role is read-only.`
            : `${featureLabel} requires a Home Tech Vault ${planLabel} subscription.`)
        }
        planLabel={`${planLabel} Feature`}
        upgradeHref={
          isReadOnlyLock
            ? undefined
            : billingManagedByHousehold
              ? "/family"
              : access.upgradeHref
        }
        upgradeLabel={
          isReadOnlyLock
            ? undefined
            : billingManagedByHousehold
              ? "View Household"
              : "View Upgrade Options"
        }
        features={features}
      />
    </PageShell>
  );
}
