"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

import NetworkConnectorTab from "@/components/network/NetworkConnectorTab";
import NetworkDiscoveryTab, {
  type DiscoveryFilterId,
} from "@/components/network/NetworkDiscoveryTab";
import NetworkHeader from "@/components/network/NetworkHeader";
import NetworkMonitoringTab from "@/components/network/NetworkMonitoringTab";
import NetworkOverviewTab from "@/components/network/NetworkOverviewTab";
import { NetworkPageSkeleton } from "@/components/network/NetworkSkeleton";
import NetworkTabs from "@/components/network/NetworkTabs";
import PageShell from "@/components/ui/PageShell";
import { useDemoReadOnlyAction } from "@/components/demo/DemoExperienceProvider";
import { usePermissions } from "@/hooks/usePermissions";
import { useNetworkPageData } from "@/hooks/useNetworkPageData";
import { connectorLimitLabel } from "@/lib/connector/access";
import { resolveNetworkTab } from "@/lib/network/tabs";

function NetworkPageInner() {
  const searchParams = useSearchParams();
  const activeTab = resolveNetworkTab(searchParams.get("tab"));
  const [discoveryFilter, setDiscoveryFilter] =
    useState<DiscoveryFilterId>("needs_review");
  const [revoking, setRevoking] = useState(false);

  const {
    householdId,
    householdOwnerName,
    isDemo,
    isAdmin,
    plan,
    isPlatformAdmin,
    canViewFeature,
    loading: permissionsLoading,
  } = usePermissions();

  const showReadOnlyModal = useDemoReadOnlyAction();
  const monitoringEnabled = canViewFeature("connectorMonitoring");

  const data = useNetworkPageData({
    householdId,
    plan,
    isPlatformAdmin,
    canUseMonitoring: monitoringEnabled,
    enabled: !permissionsLoading && Boolean(householdId) && !isDemo,
  });

  async function handleRevoke(connectorId: string) {
    if (
      showReadOnlyModal({
        preventDefault: () => undefined,
      })
    ) {
      return;
    }

    if (!householdId || !isAdmin) {
      return;
    }

    try {
      setRevoking(true);

      const response = await fetch("/api/connector/pair/revoke", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          householdId,
          connectorId,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to revoke connector.");
      }

      await data.refresh();
    } finally {
      setRevoking(false);
    }
  }

  const loading = permissionsLoading || data.loading;

  return (
    <PageShell>
      <NetworkHeader
        summary={loading ? null : data.summary}
        headerSummary={data.headerSummary}
        loading={loading}
      />

      <NetworkTabs activeTab={activeTab} />

      <div
        id={`network-panel-${activeTab}`}
        role="tabpanel"
        className="mt-8"
      >
        {loading ? (
          <NetworkPageSkeleton />
        ) : (
          <>
            {activeTab === "overview" ? (
              <NetworkOverviewTab data={data} />
            ) : null}

            {activeTab === "discovery" ? (
              <NetworkDiscoveryTab
                data={data}
                activeFilter={discoveryFilter}
                onFilterChange={setDiscoveryFilter}
              />
            ) : null}

            {activeTab === "monitoring" ? (
              <NetworkMonitoringTab data={data} />
            ) : null}

            {activeTab === "connector" ? (
              <NetworkConnectorTab
                data={data}
                householdName={householdOwnerName}
                planLabel={connectorLimitLabel(plan)}
                canManage={isAdmin && !isDemo}
                isDemo={isDemo}
                householdId={householdId}
                onRevoke={handleRevoke}
                revoking={revoking}
              />
            ) : null}
          </>
        )}
      </div>
    </PageShell>
  );
}

export default function NetworkPageContent() {
  return (
    <Suspense
      fallback={
        <PageShell>
          <NetworkPageSkeleton />
        </PageShell>
      }
    >
      <NetworkPageInner />
    </Suspense>
  );
}
