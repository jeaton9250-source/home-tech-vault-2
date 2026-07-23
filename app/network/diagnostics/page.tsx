"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Loader2,
  RefreshCw,
} from "lucide-react";

import ConnectorHealthDashboard from "@/components/connector/ConnectorHealthDashboard";
import ConnectorMultiList from "@/components/connector/ConnectorMultiList";
import ConnectorPlatformList from "@/components/connector/ConnectorPlatformList";
import ConnectorScanHistory from "@/components/connector/ConnectorScanHistory";
import ConnectorUpgradePrompt from "@/components/connector/ConnectorUpgradePrompt";
import DiscoveryInsightsCard from "@/components/connector/DiscoveryInsightsCard";
import { usePermissions } from "@/hooks/usePermissions";
import { useConnectorOverview } from "@/hooks/useConnectorOverview";
import {
  buildConnectorDiagnosticsBundle,
  serializeDiagnosticsBundle,
} from "@/lib/connector/diagnostics";

import PageShell from "@/components/ui/PageShell";
import PageHero from "@/components/ui/PageHero";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

export default function NetworkDiagnosticsPage() {
  const {
    householdId,
    householdOwnerName,
    plan,
    isPlatformAdmin,
    canViewFeature,
    loading: permissionsLoading,
    isDemo,
  } = usePermissions();

  const [exporting, setExporting] = useState(false);

  const monitoringEnabled = canViewFeature("connectorMonitoring");

  const overview = useConnectorOverview({
    householdId,
    householdName: householdOwnerName,
    plan,
    isPlatformAdmin,
    canUseMonitoring: monitoringEnabled,
    enabled: !permissionsLoading && Boolean(householdId) && !isDemo,
  });

  const diagnosticsBundle = useMemo(() => {
    return buildConnectorDiagnosticsBundle({
      householdId,
      householdName: householdOwnerName,
      plan,
      connectors: overview.connectors,
      stats: overview.stats,
      monitoringEnabled,
    });
  }, [
    householdId,
    householdOwnerName,
    monitoringEnabled,
    overview.connectors,
    overview.stats,
    plan,
  ]);

  async function handleExport() {
    try {
      setExporting(true);

      const blob = new Blob(
        [serializeDiagnosticsBundle(diagnosticsBundle)],
        { type: "application/json" }
      );
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `htv-connector-diagnostics-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  if (permissionsLoading || overview.loading) {
    return (
      <PageShell>
        <div className="flex min-h-72 items-center justify-center rounded-3xl border border-neutral-200 bg-white">
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2 className="animate-spin" size={22} />
            Loading connector diagnostics...
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mb-6">
        <Link
          href="/network"
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition hover:text-text-primary"
        >
          <ArrowLeft size={16} />
          Back to Network
        </Link>
      </div>

      <PageHero
        section="network"
        eyebrow="Diagnostics"
        title="Connector diagnostics"
        description="Inspect connector health, scan history, platform support, and export a support bundle."
      >
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            loading={exporting}
            loadingLabel="Exporting..."
            onClick={() => void handleExport()}
          >
            <Download size={16} />
            Export diagnostics
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void overview.refresh()}
          >
            <RefreshCw size={16} />
            Refresh
          </Button>
        </div>
      </PageHero>

      <section className="space-y-6">
        <ConnectorHealthDashboard health={overview.health} />
        <DiscoveryInsightsCard stats={overview.stats} />
        <ConnectorScanHistory entries={overview.scanHistory} />

        <PageCard className="p-7 md:p-8">
          <p className="text-overline text-section-network">
            Platforms
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-text-primary">
            Supported platforms
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            macOS is available today. Windows and Linux connectors are planned
            without changing this diagnostics layout.
          </p>
          <div className="mt-6">
            <ConnectorPlatformList />
          </div>
        </PageCard>

        <PageCard className="p-7 md:p-8">
          <p className="text-overline text-section-network">
            Installations
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-text-primary">
            Connector inventory
          </h2>
          <div className="mt-6">
            <ConnectorMultiList connectors={overview.connectors} />
          </div>
        </PageCard>

        {!monitoringEnabled ? <ConnectorUpgradePrompt /> : null}
      </section>
    </PageShell>
  );
}
