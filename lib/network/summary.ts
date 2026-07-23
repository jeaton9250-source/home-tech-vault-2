import { buildConnectorMonitoringSummary } from "@/lib/connector/connectorMonitoring";
import {
  deriveConnectorPresence,
  connectorPresenceLabel,
} from "@/lib/connector/presence";
import { formatConnectorRelativeTime } from "@/lib/connector/scanHistory";

import type { ConnectorInstallationSummary } from "@/lib/connector/types";
import type {
  DiscoveredDeviceSummary,
  DiscoveryStatsSummary,
} from "@/lib/connector/discoveryTypes";

export type NetworkConnectorStatus =
  | "connected"
  | "recently_seen"
  | "offline"
  | "not_connected"
  | "pending";

export type NetworkMonitoringMode =
  | "automatic"
  | "manual"
  | "paused";

export type NetworkSummary = {
  connectorCount: number;
  connectorStatus: NetworkConnectorStatus;
  connectorStatusLabel: string;
  monitoringMode: NetworkMonitoringMode;
  monitoringLabel: string;
  lastHeartbeat: string | null;
  lastHeartbeatLabel: string;
  lastScan: string | null;
  lastScanLabel: string;
  nextScanLabel: string | null;
  scanIntervalMinutes: number | null;
  totalDiscovered: number;
  matchedCount: number;
  addedToVaultCount: number;
  newCount: number;
  possibleMatchCount: number;
  reviewCount: number;
  ignoredCount: number;
  recentlyDetectedCount: number;
  hasConnector: boolean;
  connectorOffline: boolean;
  primaryConnector: ConnectorInstallationSummary | null;
};

export function countAddedToVault(
  devices: DiscoveredDeviceSummary[]
): number {
  return devices.filter(
    (device) => Boolean(device.importedDeviceId)
  ).length;
}

export function computeReviewCount(stats: DiscoveryStatsSummary | null): number {
  if (!stats) {
    return 0;
  }

  return stats.newDevices + stats.needsReview;
}

export function mapConnectorStatus(
  connector: ConnectorInstallationSummary | null
): {
  status: NetworkConnectorStatus;
  label: string;
  offline: boolean;
} {
  if (!connector) {
    return {
      status: "not_connected",
      label: "Not connected",
      offline: true,
    };
  }

  const presence = deriveConnectorPresence(
    connector.status,
    connector.lastSeenAt
  );

  if (presence === "pending") {
    return {
      status: "pending",
      label: "Pending",
      offline: false,
    };
  }

  if (presence === "online") {
    return {
      status: "connected",
      label: "Connected",
      offline: false,
    };
  }

  if (presence === "recently_seen") {
    return {
      status: "recently_seen",
      label: "Recently seen",
      offline: false,
    };
  }

  return {
    status: "offline",
    label: "Offline",
    offline: true,
  };
}

export function buildNetworkSummary(input: {
  connectors: ConnectorInstallationSummary[];
  devices: DiscoveredDeviceSummary[];
  stats: DiscoveryStatsSummary | null;
  monitoringEnabled: boolean;
  monitoringPaused?: boolean;
  now?: number;
}): NetworkSummary {
  const activeConnectors = input.connectors.filter(
    (connector) => connector.status !== "revoked"
  );
  const primaryConnector = activeConnectors[0] ?? null;
  const connectorStatus = mapConnectorStatus(primaryConnector);
  const monitoring = buildConnectorMonitoringSummary({
    monitoringEnabled: input.monitoringEnabled,
    lastScanAt: primaryConnector?.lastScanAt,
    now: input.now,
  });

  const stats = input.stats;
  const reviewCount = computeReviewCount(stats);
  const monitoringMode: NetworkMonitoringMode = !input.monitoringEnabled
    ? "manual"
    : input.monitoringPaused || connectorStatus.offline
      ? "paused"
      : "automatic";

  const monitoringLabel =
    monitoringMode === "manual"
      ? "Manual"
      : monitoringMode === "paused"
        ? "Paused"
        : "Automatic";

  return {
    connectorCount: activeConnectors.length,
    connectorStatus: connectorStatus.status,
    connectorStatusLabel: connectorStatus.label,
    monitoringMode,
    monitoringLabel,
    lastHeartbeat: primaryConnector?.lastSeenAt ?? null,
    lastHeartbeatLabel: primaryConnector
      ? connectorPresenceLabel(
          deriveConnectorPresence(
            primaryConnector.status,
            primaryConnector.lastSeenAt,
            input.now
          )
        )
      : "Not connected",
    lastScan: primaryConnector?.lastScanAt ?? null,
    lastScanLabel: formatConnectorRelativeTime(
      primaryConnector?.lastScanAt,
      input.now
    ),
    nextScanLabel:
      monitoring.mode === "automatic"
        ? monitoring.nextScanLabel
        : null,
    scanIntervalMinutes:
      monitoring.mode === "automatic"
        ? monitoring.intervalMinutes
        : null,
    totalDiscovered: stats?.totalDiscovered ?? input.devices.length,
    matchedCount: stats?.matchedDevices ?? 0,
    addedToVaultCount: countAddedToVault(input.devices),
    newCount: stats?.newDevices ?? 0,
    possibleMatchCount: stats?.needsReview ?? 0,
    reviewCount,
    ignoredCount: stats?.ignoredDevices ?? 0,
    recentlyDetectedCount: stats?.recentlyDetected ?? 0,
    hasConnector: activeConnectors.length > 0,
    connectorOffline: connectorStatus.offline,
    primaryConnector,
  };
}

export function buildNetworkHeaderSummary(
  summary: NetworkSummary,
  loading: boolean
): string | null {
  if (loading) {
    return null;
  }

  const parts: string[] = [];

  parts.push(
    summary.hasConnector
      ? `Connector ${summary.connectorStatusLabel.toLowerCase()}`
      : "Connector not connected"
  );

  if (summary.totalDiscovered > 0) {
    parts.push(
      `${summary.totalDiscovered} device${summary.totalDiscovered === 1 ? "" : "s"} discovered`
    );
  } else if (summary.hasConnector && summary.lastScan) {
    parts.push("No devices found yet");
  } else if (summary.hasConnector) {
    parts.push("No scan completed yet");
  }

  if (summary.reviewCount > 0) {
    parts.push(
      `${summary.reviewCount} need review`
    );
  }

  return parts.join(" · ");
}
