import AnalyticsAdminClient from "@/components/admin/analytics/AnalyticsAdminClient";
import { loadAdminAnalytics } from "@/lib/admin/data/loaders";

export const metadata = {
  title: "Analytics — Home Tech Vault Admin",
};

export default async function AdminAnalyticsPage() {
  const analytics = await loadAdminAnalytics();

  return (
    <AnalyticsAdminClient analytics={analytics} />
  );
}
