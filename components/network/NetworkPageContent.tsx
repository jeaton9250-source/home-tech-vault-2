"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

import { CircleAlert, RotateCcw, Wifi } from "lucide-react";

import NetworkConnectorTab from "@/components/network/NetworkConnectorTab";
import NetworkDiscoveryTab, {
  type DiscoveryFilterId,
} from "@/components/network/NetworkDiscoveryTab";
import NetworkHeader from "@/components/network/NetworkHeader";
import NetworkMonitoringTab from "@/components/network/NetworkMonitoringTab";
import NetworkOverviewTab from "@/components/network/NetworkOverviewTab";
import { NetworkPageSkeleton } from "@/components/network/NetworkSkeleton";
import NetworkTabs from "@/components/network/NetworkTabs";
import Button from "@/components/ui/Button";
import PageCard from "@/components/ui/PageCard";
import PageShell from "@/components/ui/PageShell";
import { ViewerBanner } from "@/components/ui/PermissionUI";
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
  const [refreshing, setRefreshing] = useState(false);

  const {
    user,
    householdId,
    householdOwnerName,
    isDemo,
    isAdmin,
    role,
    canEdit,
    plan,
    isPlatformAdmin,
    canViewFeature,
    loading: permissionsLoading,
  } = usePermissions();

  const showReadOnlyModal = useDemoReadOnlyAction();
  const monitoringEnabled = canViewFeature("connectorMonitoring");

  const showViewerAccess =
    !permissionsLoading &&
    !isDemo &&
    Boolean(user) &&
    role === "viewer";

const canManageConnector =
  !permissionsLoading &&
  monitoringEnabled &&
  isAdmin &&
  !isDemo &&
  Boolean(householdId);

  const canLinkDevices =
    !permissionsLoading && canEdit && !isDemo && Boolean(user);

  const canRefresh =
    !permissionsLoading && !isDemo && Boolean(householdId);

  const data = useNetworkPageData({
    householdId,
    plan,
    isPlatformAdmin,
    canUseMonitoring: monitoringEnabled,
    enabled: !permissionsLoading && (Boolean(householdId) || isDemo),
    isDemo,
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

  async function handleRefresh() {
    if (isDemo || !user) {
      showReadOnlyModal();
      return;
    }

    try {
      setRefreshing(true);
      await data.refresh();
    } finally {
      setRefreshing(false);
    }
  }

  function handleDemoAction() {
    showReadOnlyModal();
  }

  const loading = permissionsLoading || data.loading;

  return (
    <PageShell>
      <NetworkHeader
        summary={loading ? null : data.summary}
        headerSummary={data.headerSummary}
        loading={loading}
        refreshing={refreshing}
        canRefresh={canRefresh}
        canManageConnector={canManageConnector}
        isDemo={isDemo || !user}
        isViewer={showViewerAccess}
        onRefresh={() => {
          void handleRefresh();
        }}
        onDemoAction={handleDemoAction}
      />

      {showViewerAccess ? (
        <ViewerBanner description="You can review connector status and network discoveries. Viewer access cannot start scans, link devices, or manage connectors." />
      ) : null}

      {(isDemo || !user) && !loading ? (
        <PageCard className="border-[#b58a42]/20 bg-[#b58a42]/10 p-4 md:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#617c43]/20 bg-[#617c43] text-white">
              <Wifi size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#17212a]">
                Demo Mode
              </p>
              <p className="mt-1 text-sm leading-6 text-[#68737b]">
                You are exploring simulated connector and discovery data. No
                real network is being scanned.
              </p>
            </div>
          </div>
        </PageCard>
      ) : null}

      {data.error ? (
        <PageCard className="border-[#a6584e]/20 bg-[#a6584e]/10 p-5 md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#a6584e]/10 text-[#984e46]">
                <CircleAlert size={18} />
              </div>
              <div>
                <p className="font-semibold text-[#17212a]">
                  Unable to load network
                </p>
                <p className="mt-1 text-sm leading-6 text-[#68737b]">
                  Home Wi-Fi information is temporarily unavailable. Please try
                  again.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                void handleRefresh();
              }}
            >
              <RotateCcw size={16} />
              Retry
            </Button>
          </div>
        </PageCard>
      ) : null}

      <NetworkTabs activeTab={activeTab} />

      <div
        id={`network-panel-${activeTab}`}
        role="tabpanel"
        className="mt-5"
      >
        {loading ? (
          <NetworkPageSkeleton />
        ) : data.error && data.devices.length === 0 ? null : (
          <>
            {activeTab === "overview" ? (
              <NetworkOverviewTab
                data={data}
                isDemo={isDemo || !user}
                canLink={canLinkDevices}
                canRefresh={canRefresh}
                refreshing={refreshing}
                onRefresh={() => {
                  void handleRefresh();
                }}
                onDemoAction={handleDemoAction}
              />
            ) : null}

            {activeTab === "discovery" ? (
              <NetworkDiscoveryTab
                data={data}
                activeFilter={discoveryFilter}
                onFilterChange={setDiscoveryFilter}
                isDemo={isDemo || !user}
                canLink={canLinkDevices}
                onDemoAction={handleDemoAction}
              />
            ) : null}

            {activeTab === "monitoring" ? (
              <NetworkMonitoringTab data={data} isDemo={isDemo || !user} />
            ) : null}

            {activeTab === "connector" ? (
              <NetworkConnectorTab
                data={data}
                householdName={householdOwnerName}
                planLabel={connectorLimitLabel(plan)}
                canManage={canManageConnector}
                canControl={canLinkDevices}
                isDemo={isDemo || !user}
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
