import Button from "@/components/ui/Button";
import PageCard from "@/components/ui/PageCard";
import ConnectorUpgradePrompt from "@/components/connector/ConnectorUpgradePrompt";
import { formatConnectorTimestamp } from "@/lib/connector/scanHistory";

import type { NetworkPageData } from "@/hooks/useNetworkPageData";

type NetworkMonitoringTabProps = {
  data: NetworkPageData;
  isDemo?: boolean;
};

export default function NetworkMonitoringTab({
  data,
  isDemo = false,
}: NetworkMonitoringTabProps) {
  const { summary, monitoringEnabled, monitoringSummary } = data;

  if (!summary.hasConnector) {
    return (
      <PageCard className="p-7 md:p-8">
        <h2 className="text-xl font-semibold text-text-primary">
          Monitoring unavailable
        </h2>
        <p className="mt-3 text-sm leading-7 text-text-secondary">
          Pair a connector before monitoring can begin.
        </p>
        <div className="mt-6">
          <Button href="/network/connect">Connect Your Home Network</Button>
        </div>
      </PageCard>
    );
  }

  if (!monitoringEnabled) {
    return (
      <div className="space-y-6">
        <PageCard className="p-7 md:p-8">
          <p className="text-overline text-section-network">Monitoring</p>
          <h2 className="mt-2 text-2xl font-semibold text-text-primary">
            Manual monitoring
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
            Run a network scan whenever you want to refresh your connected-device
            information.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <MonitoringMetric
              label="Last manual scan"
              value={summary.lastScanLabel}
              detail={
                summary.lastScan
                  ? formatConnectorTimestamp(summary.lastScan)
                  : undefined
              }
            />
            <MonitoringMetric
              label="Devices found"
              value={
                summary.lastScan
                  ? String(summary.totalDiscovered)
                  : "—"
              }
            />
          </div>

          <p className="mt-6 text-sm text-text-secondary">
            Run Scan My Network from the connector app on your home computer.
          </p>
        </PageCard>

        <ConnectorUpgradePrompt />
      </div>
    );
  }

  const automaticStatus =
    summary.connectorOffline
      ? "Connector offline"
      : summary.monitoringMode === "paused"
        ? "Paused"
        : "Running";

  return (
    <div className="space-y-6">
      <PageCard className="p-7 md:p-8">
        <p className="text-overline text-section-network">Monitoring</p>
        <h2 className="mt-2 text-2xl font-semibold text-text-primary">
          Automatic monitoring
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
          Status: {automaticStatus}
        </p>

        {summary.connectorOffline ? (
          <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Connector not recently seen. Monitoring is paused until the
            connector reconnects.
          </p>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MonitoringMetric
            label="Last scan"
            value={monitoringSummary.lastScanLabel}
          />
          <MonitoringMetric
            label="Next scan"
            value={monitoringSummary.nextScanLabel}
          />
          <MonitoringMetric
            label="Scan interval"
            value={`Every ${monitoringSummary.intervalMinutes} minutes`}
          />
          <MonitoringMetric
            label="Recently detected"
            value={String(summary.recentlyDetectedCount)}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button href={isDemo ? "/network/discovery" : "/network/connect"} variant="secondary">
            {isDemo ? "Open Discovery Review" : "Manage Connector"}
          </Button>
        </div>
      </PageCard>

      {data.activityItems.length > 0 ? (
        <PageCard className="p-7 md:p-8">
          <h3 className="text-lg font-semibold text-text-primary">
            Recent monitoring activity
          </h3>
          <ul className="mt-4 space-y-3">
            {data.activityItems.slice(0, 5).map((item) => (
              <li
                key={item.id}
                className="rounded-[20px] border border-border-subtle bg-surface-sunken px-4 py-3 text-sm text-text-secondary"
              >
                {item.message}
              </li>
            ))}
          </ul>
        </PageCard>
      ) : null}
    </div>
  );
}

function MonitoringMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-[20px] border border-border-subtle bg-surface-sunken p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
        {label}
      </p>
      <p className="mt-2 font-semibold text-text-primary">{value}</p>
      {detail ? (
        <p className="mt-1 text-xs text-text-secondary">{detail}</p>
      ) : null}
    </div>
  );
}
