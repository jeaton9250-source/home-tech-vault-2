"use client";

import {
  buildDemoConnectorInstallation,
  buildDemoDiscoveryStats,
  buildDemoDiscoveredDevices,
  DEMO_CONNECTOR_NAME,
  DEMO_CONNECTOR_VERSION,
} from "@/lib/demo/demoConnectorExperience";
import { formatDemoRelativeTime } from "@/lib/demo/demoNetworkTime";
import { formatPlatformLabel } from "@/lib/connector/platforms";

import PageCard from "@/components/ui/PageCard";

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-border-subtle bg-surface-sunken p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
        {label}
      </p>
      <p className="mt-2 font-semibold text-text-primary">{value}</p>
    </div>
  );
}

export default function DemoSmartConnectorCard() {
  const connector = buildDemoConnectorInstallation();
  const stats = buildDemoDiscoveryStats(buildDemoDiscoveredDevices());

  return (
    <PageCard className="p-7 md:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-overline text-section-network">Demo Smart Connector</p>
        <span className="rounded-full bg-surface-sunken px-3 py-1 text-xs font-semibold text-text-secondary">
          Interactive Demo
        </span>
      </div>

      <h2 className="mt-2 text-2xl font-semibold text-text-primary">
        See how Home Tech Vault can discover and monitor devices in a connected
        home.
      </h2>

      <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
        Demo data — no real network is being scanned.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoRow label="Status" value="Connected" />
        <InfoRow label="Connector" value={DEMO_CONNECTOR_NAME} />
        <InfoRow
          label="Platform"
          value={formatPlatformLabel(connector.platform)}
        />
        <InfoRow label="Version" value={DEMO_CONNECTOR_VERSION} />
        <InfoRow label="Monitoring" value="Automatic" />
        <InfoRow
          label="Last heartbeat"
          value={formatDemoRelativeTime(connector.lastSeenAt)}
        />
        <InfoRow
          label="Last scan"
          value={formatDemoRelativeTime(connector.lastScanAt)}
        />
        <InfoRow
          label="Devices discovered"
          value={String(stats.totalDiscovered)}
        />
        <InfoRow
          label="Matched to vault"
          value={String(stats.matchedDevices)}
        />
        <InfoRow
          label="Needs review"
          value={String(stats.needsReview)}
        />
      </div>
    </PageCard>
  );
}
