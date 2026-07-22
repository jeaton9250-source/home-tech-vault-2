import { Suspense } from "react";

import HouseholdsAdminClient from "@/components/admin/households/HouseholdsAdminClient";
import { AdminLoadingState } from "@/components/admin/layout/AdminPageLayout";
import { loadAdminAnalytics } from "@/lib/admin/data/loaders";

export const metadata = {
  title: "Households — Home Tech Vault Admin",
};

export default async function AdminHouseholdsPage() {
  const analytics = await loadAdminAnalytics();

  return (
    <Suspense
      fallback={
        <AdminLoadingState label="Loading households…" />
      }
    >
      <HouseholdsAdminClient
        summary={{
          totalHouseholds: analytics.totalHouseholds,
          totalDevices: analytics.totalDevices,
          totalDocuments: analytics.totalDocuments,
          openSupportTickets:
            analytics.openSupportTickets,
        }}
      />
    </Suspense>
  );
}
