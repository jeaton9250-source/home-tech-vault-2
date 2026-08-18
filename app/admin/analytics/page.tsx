import AnalyticsAdminClient from "@/components/admin/analytics/AnalyticsAdminClient";

import {
  loadAdminAnalytics,
} from "@/lib/admin/data/loaders";

import {
  loadAdminVercelAnalytics,
} from "@/lib/admin/data/vercelAnalytics";

import {
  loadAdminHealthCheckMetrics,
} from "@/lib/admin/data/healthCheck";

import {
  loadAdminActivationMetrics,
} from "@/lib/admin/data/activation";

export const metadata = {
  title:
    "Analytics — Home Tech Vault Admin",
};

export default async function AdminAnalyticsPage() {
  const [
    analytics,
    vercelAnalytics,
    healthCheckMetrics,
    activationMetrics,
  ] = await Promise.all([
    loadAdminAnalytics(),
    loadAdminVercelAnalytics(),
    loadAdminHealthCheckMetrics(),
    loadAdminActivationMetrics(),
  ]);

  return (
    <AnalyticsAdminClient
      analytics={analytics}
      vercelAnalytics={
        vercelAnalytics
      }
      healthCheckMetrics={
        healthCheckMetrics
      }
      activationMetrics={
        activationMetrics
      }
    />
  );
}
