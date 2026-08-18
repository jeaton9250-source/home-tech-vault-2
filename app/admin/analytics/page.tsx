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

export const metadata = {
  title:
    "Analytics — Home Tech Vault Admin",
};

export default async function AdminAnalyticsPage() {
  const [
    analytics,
    vercelAnalytics,
    healthCheckMetrics,
  ] = await Promise.all([
    loadAdminAnalytics(),
    loadAdminVercelAnalytics(),
    loadAdminHealthCheckMetrics(),
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
    />
  );
}
