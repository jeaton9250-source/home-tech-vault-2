import { Suspense } from "react";

import UsersAdminClient from "@/components/admin/users/UsersAdminClient";
import { AdminLoadingState } from "@/components/admin/layout/AdminPageLayout";
import { loadAdminDashboardMetrics } from "@/lib/admin/data/dashboard";

export const metadata = {
  title: "Users — Home Tech Vault Admin",
};

export default async function AdminUsersPage() {
  const metrics = await loadAdminDashboardMetrics();

  return (
    <Suspense
      fallback={<AdminLoadingState label="Loading users…" />}
    >
      <UsersAdminClient
        summary={{
          totalUsers: metrics.totalUsers,
          newUsersToday: metrics.newUsersToday,
          activeSubscriptions:
            metrics.activeSubscriptions,
          paidMembers:
            metrics.proUsers + metrics.familyUsers,
        }}
      />
    </Suspense>
  );
}
