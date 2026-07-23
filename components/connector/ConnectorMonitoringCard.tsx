"use client";

import { Activity, Clock3, Radar } from "lucide-react";

import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";
import ConnectorMonitoringBadge from "@/components/connector/ConnectorMonitoringBadge";
import {
  buildConnectorMonitoringSummary,
  type ConnectorMonitoringSummary,
} from "@/lib/connector/connectorMonitoring";
import { formatConnectorTimestamp } from "@/lib/connector/scanHistory";

type ConnectorMonitoringCardProps = {
  monitoringEnabled: boolean;
  lastScanAt?: string | null;
  isInstalled?: boolean;
};

export default function ConnectorMonitoringCard({
  monitoringEnabled,
  lastScanAt,
  isInstalled = true,
}: ConnectorMonitoringCardProps) {
  const summary = buildConnectorMonitoringSummary({
    monitoringEnabled,
    lastScanAt,
  });

  return (
    <PageCard className="p-7 md:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-overline text-section-network">Monitoring</p>
            <ConnectorMonitoringBadge enabled={monitoringEnabled} />
          </div>
          <h3 className="mt-2 text-xl font-semibold text-text-primary">
            {summary.label}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            {summary.description}
          </p>
        </div>

        {!monitoringEnabled ? (
          <Button href="/upgrade" variant="secondary">
            Upgrade to Pro
          </Button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <MonitoringStat
          icon={Radar}
          label="Last scan"
          value={isInstalled ? summary.lastScanLabel : "No connector paired"}
          detail={
            summary.lastScanAt
              ? formatConnectorTimestamp(summary.lastScanAt)
              : undefined
          }
        />
        <MonitoringStat
          icon={Clock3}
          label={
            summary.mode === "automatic" ? "Next automatic scan" : "Scan mode"
          }
          value={
            summary.mode === "automatic"
              ? summary.nextScanLabel
              : "Manual only"
          }
          detail={
            summary.mode === "automatic"
              ? `Every ${summary.intervalMinutes} minutes on Pro`
              : "Run Scan My Network from the connector app"
          }
        />
      </div>

      {!isInstalled ? (
        <p className="mt-5 rounded-2xl bg-surface-sunken px-4 py-3 text-sm text-text-secondary">
          Pair the connector to start monitoring your home network.
        </p>
      ) : null}
    </PageCard>
  );
}

function MonitoringStat({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-[20px] border border-border-subtle bg-surface-sunken p-4">
      <div className="flex items-center gap-2 text-text-tertiary">
        <Icon size={16} />
        <p className="text-xs font-semibold uppercase tracking-[0.14em]">
          {label}
        </p>
      </div>
      <p className="mt-2 font-semibold text-text-primary">{value}</p>
      {detail ? (
        <p className="mt-1 text-xs text-text-secondary">{detail}</p>
      ) : null}
    </div>
  );
}

export type { ConnectorMonitoringSummary };
