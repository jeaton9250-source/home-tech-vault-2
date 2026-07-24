import { Suspense } from "react";

import UsersAdminClient from "@/components/admin/users/UsersAdminClient";
import { AdminLoadingState } from "@/components/admin/layout/AdminPageLayout";
import { loadAdminUserMetrics } from "@/lib/admin/data/userMetrics";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Users — Home Tech Vault Admin",
};

export default async function AdminUsersPage() {
  const metrics = await loadAdminUserMetrics();

  return (
    <Suspense
      fallback={<AdminLoadingState label="Loading users…" />}
    >
      <UsersAdminClient metrics={metrics} />
    </Suspense>
  );
}
