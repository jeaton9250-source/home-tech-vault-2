"use client";

import { useEffect, type ReactNode } from "react";

import { usePathname, useRouter } from "next/navigation";

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
  title?: string;
  features?: string[];
  upgradeLabel?: string;
  requireAuthentication?: boolean;
  redirectPath?: string;
};

export default function FeatureGate({
  children,
  feature,
  description,
  title,
  features: featureList,
  upgradeLabel = "View Upgrade Options",
  requireAuthentication = false,
  redirectPath,
}: FeatureGateProps) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    loading,
    user,
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

  useEffect(() => {
    if (
      !requireAuthentication ||
      loading ||
      isDemo
    ) {
      return;
    }

    if (!user) {
      const destination =
        redirectPath ?? pathname;

      router.replace(
        `/login?redirect=${encodeURIComponent(destination)}`
      );
    }
  }, [
    requireAuthentication,
    loading,
    isDemo,
    user,
    router,
    redirectPath,
    pathname,
  ]);

  if (loading) {
    return (
      <PageShell>
        <DashboardSkeleton />
      </PageShell>
    );
  }

  if (
    requireAuthentication &&
    !isDemo &&
    !user
  ) {
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

  const features = featureList ??
    (isReadOnlyLock
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
        ]);

  return (
    <PageShell>
      <PremiumFeatureCard
        title={
          title ?? `Unlock ${featureLabel}`
        }
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
              : upgradeLabel
        }
        features={features}
      />
    </PageShell>
  );
}
