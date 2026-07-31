import AnalyticsAdminClient from "@/components/admin/analytics/AnalyticsAdminClient";
import { loadAdminAnalytics } from "@/lib/admin/data/loaders";
import { loadAdminVercelAnalytics } from "@/lib/admin/data/vercelAnalytics";

export const metadata = {
  title: "Analytics — Home Tech Vault Admin",
};

export default async function AdminAnalyticsPage() {
  const [analytics, vercelAnalytics] =
    await Promise.all([
      loadAdminAnalytics(),
      loadAdminVercelAnalytics(),
    ]);

  return (
    <AnalyticsAdminClient
      analytics={analytics}
      vercelAnalytics={vercelAnalytics}
    />
  );
}
