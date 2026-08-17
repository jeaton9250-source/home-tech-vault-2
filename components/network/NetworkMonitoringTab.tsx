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
      <PageCard className="border-[#182533]/10 bg-[#f8f5ef] p-7 shadow-[0_18px_45px_-36px_rgba(15,25,35,0.45)] md:p-8">
        <h2 className="text-xl font-semibold text-[#17212a]">
          Monitoring unavailable
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#68737b]">
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
        <PageCard className="border-[#182533]/10 bg-[#f8f5ef] p-7 shadow-[0_18px_45px_-36px_rgba(15,25,35,0.45)] md:p-8">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#617c43]">Monitoring</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#17212a]">
            Manual monitoring
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#68737b]">
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

          <p className="mt-6 text-sm text-[#68737b]">
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
      <PageCard className="border-[#182533]/10 bg-[#f8f5ef] p-7 shadow-[0_18px_45px_-36px_rgba(15,25,35,0.45)] md:p-8">
        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#617c43]">Monitoring</p>
        <h2 className="mt-2 text-2xl font-semibold text-[#17212a]">
          Automatic monitoring
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#68737b]">
          Status: {automaticStatus}
        </p>

        {summary.connectorOffline ? (
          <p className="mt-4 rounded-2xl border border-[#b58a42]/20 bg-[#b58a42]/10 px-4 py-3 text-sm text-[#916c31]">
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
        <PageCard className="border-[#182533]/10 bg-[#f8f5ef] p-7 shadow-[0_18px_45px_-36px_rgba(15,25,35,0.45)] md:p-8">
          <h3 className="text-lg font-semibold text-[#17212a]">
            Recent monitoring activity
          </h3>
          <ul className="mt-4 space-y-3">
            {data.activityItems.slice(0, 5).map((item) => (
              <li
                key={item.id}
                className="rounded-[20px] border border-border-subtle bg-surface-sunken px-4 py-3 text-sm text-[#68737b]"
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
    <div className="rounded-[20px] border border-[#182533]/8 bg-[#eee9df]/55 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a949b]">
        {label}
      </p>
      <p className="mt-2 font-semibold text-[#17212a]">{value}</p>
      {detail ? (
        <p className="mt-1 text-xs text-[#68737b]">{detail}</p>
      ) : null}
    </div>
  );
}
