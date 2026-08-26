"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Settings2 } from "lucide-react";

import Button from "@/components/ui/Button";
import PageCard from "@/components/ui/PageCard";
import ConnectorCard from "@/components/connector/ConnectorCard";
import ConnectorHealthDashboard from "@/components/connector/ConnectorHealthDashboard";
import ConnectorMonitoringCard from "@/components/connector/ConnectorMonitoringCard";
import ConnectorMultiList from "@/components/connector/ConnectorMultiList";
import ConnectorScanHistory from "@/components/connector/ConnectorScanHistory";
import ConnectorStatusGrid from "@/components/connector/ConnectorStatusGrid";
import ConnectorUpgradePrompt from "@/components/connector/ConnectorUpgradePrompt";
import DiscoveryInsightsCard from "@/components/connector/DiscoveryInsightsCard";
import SmartHomeSummaryCard from "@/components/connector/SmartHomeSummaryCard";
import { useDemoReadOnlyAction } from "@/components/demo/DemoExperienceProvider";
import { usePermissions } from "@/hooks/usePermissions";
import {
  describeConnectorPlatform,
  describeConnectorStatus,
  describeConnectedDevice,
  useConnectorOverview,
} from "@/hooks/useConnectorOverview";
import { connectorLimitLabel } from "@/lib/connector/access";
import {
  formatConnectorRelativeTime,
  formatConnectorTimestamp,
} from "@/lib/connector/scanHistory";
import { CONNECTOR_MACOS_APP_VERSION } from "@/lib/connector/constants";

type ConnectorHubSectionProps = {
  householdName?: string | null;
};

export default function ConnectorHubSection({
  householdName,
}: ConnectorHubSectionProps) {
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
  const [revoking, setRevoking] = useState(false);
  const [selectedConnectorId, setSelectedConnectorId] =
    useState<string | null>(null);

  const monitoringEnabled = canViewFeature("connectorMonitoring");

  const overview = useConnectorOverview({
    householdId,
    householdName: householdName ?? householdOwnerName,
    plan,
    isPlatformAdmin,
    canUseMonitoring: monitoringEnabled,
    enabled: !permissionsLoading && (Boolean(householdId) || isDemo),
    isDemo,
  });

  const selectedConnector = useMemo(() => {
    if (!selectedConnectorId) {
      return overview.primaryConnector;
    }

    return (
      overview.activeConnectors.find(
        (connector) => connector.id === selectedConnectorId
      ) ?? overview.primaryConnector
    );
  }, [
    overview.activeConnectors,
    overview.primaryConnector,
    selectedConnectorId,
  ]);

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

      await overview.refresh();
    } finally {
      setRevoking(false);
    }
  }

  if (permissionsLoading || overview.loading) {
    return (
      <section className="mt-2">
        <PageCard className="flex min-h-40 items-center justify-center p-8">
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <Loader2 className="animate-spin" size={18} />
            Loading connector status...
          </div>
        </PageCard>
      </section>
    );
  }

  if (!householdId && !isDemo) {
    return (
      <section className="mt-2">
        <PageCard className="p-7 md:p-8">
          <p className="text-overline text-section-network">
            Home Tech Vault Connector
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-text-primary">
            Set up your home Vault
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            The Connector uses a home Vault to organize discovered devices.
            Connector access is included on Free and does not require a
            Family plan.
          </p>
          <div className="mt-5">
            <Button href="/onboarding/create-household">
              Set Up My Home
            </Button>
          </div>
        </PageCard>
      </section>
    );
  }

  const currentHousehold =
    householdName ?? householdOwnerName ?? "Current household";

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-overline text-section-network">
            Home Tech Vault Connector
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-text-primary">
            Connector status and monitoring
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
            See whether the connector is installed, when it last checked in,
            and whether automatic monitoring is active for this household.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button href="/network/connect" variant="secondary">
            Manage pairing
          </Button>
          <Button href="/network/diagnostics" variant="secondary">
            <Settings2 size={16} />
            Diagnostics
          </Button>
        </div>
      </div>

      <ConnectorStatusGrid
        items={[
          {
            label: "Connector status",
            value: describeConnectorStatus(selectedConnector),
          },
          {
            label: "Connected device",
            value: describeConnectedDevice(selectedConnector),
            detail: describeConnectorPlatform(selectedConnector),
          },
          {
            label: "Connector version",
            value:
              selectedConnector?.appVersion ??
              CONNECTOR_MACOS_APP_VERSION,
            detail: overview.updateCheck?.message,
          },
          {
            label: "Last heartbeat",
            value: formatConnectorRelativeTime(
              selectedConnector?.lastSeenAt
            ),
            detail: formatConnectorTimestamp(
              selectedConnector?.lastSeenAt
            ),
          },
          {
            label: "Last manual scan",
            value: formatConnectorRelativeTime(
              selectedConnector?.lastScanAt
            ),
            detail: formatConnectorTimestamp(
              selectedConnector?.lastScanAt
            ),
          },
          {
            label: "Monitoring status",
            value: overview.monitoringEnabled
              ? "Automatic"
              : "Manual only",
            detail: overview.monitoringLabel,
          },
          {
            label: "Last seen",
            value: formatConnectorRelativeTime(
              selectedConnector?.lastSeenAt
            ),
          },
          {
            label: "Current household",
            value: currentHousehold,
            detail: connectorLimitLabel(plan),
          },
        ]}
      />

      <ConnectorCard
        isInstalled={overview.isInstalled}
        primaryConnector={selectedConnector}
        monitoringEnabled={overview.monitoringEnabled}
        updateCheck={overview.updateCheck}
        canManage={isAdmin && !isDemo}
        revoking={revoking}
        onRevoke={handleRevoke}
      />

      {overview.activeConnectors.length > 1 ? (
        <PageCard className="p-7 md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-overline text-section-network">
                Multi-connector
              </p>
              <h3 className="mt-2 text-xl font-semibold text-text-primary">
                Household connectors
              </h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {connectorLimitLabel(plan)}. Select a connector to inspect its
                status.
              </p>
            </div>
            <Link
              href="/network/connect"
              className="text-sm font-semibold text-text-secondary transition hover:text-text-primary"
            >
              Manage all connectors
            </Link>
          </div>

          <div className="mt-6">
            <ConnectorMultiList
              connectors={overview.connectors}
              selectedId={selectedConnector?.id ?? null}
              onSelect={setSelectedConnectorId}
            />
          </div>
        </PageCard>
      ) : null}

      <ConnectorMonitoringCard
        monitoringEnabled={overview.monitoringEnabled}
        lastScanAt={selectedConnector?.lastScanAt}
        isInstalled={overview.isInstalled}
      />

      {!overview.monitoringEnabled ? <ConnectorUpgradePrompt /> : null}

      <ConnectorHealthDashboard health={overview.health} />
      <DiscoveryInsightsCard stats={overview.stats} />
      <SmartHomeSummaryCard summary={overview.smartHomeSummary} />
      <ConnectorScanHistory entries={overview.scanHistory} />

      {overview.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {overview.error}
        </div>
      ) : null}
    </section>
  );
}
