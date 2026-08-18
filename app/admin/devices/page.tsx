import { Suspense } from "react";

import DevicesAdminClient from "@/components/admin/devices/DevicesAdminClient";
import { AdminLoadingState } from "@/components/admin/layout/AdminPageLayout";
import { loadAdminDevices } from "@/lib/admin/data/devices";

export const metadata = {
  title: "Devices — Home Tech Vault Admin",
};

export default async function AdminDevicesPage() {
  const initial = await loadAdminDevices({
    pagination: { page: 1, limit: 5 },
  });

  return (
    <Suspense
      fallback={
        <AdminLoadingState label="Loading devices…" />
      }
    >
      <DevicesAdminClient
        initialSummary={initial.summary}
      />
    </Suspense>
  );
}
