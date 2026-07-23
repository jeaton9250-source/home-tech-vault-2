import { formatConnectorRelativeTime } from "@/lib/connector/scanHistory";

import type { ConnectorInstallationSummary } from "@/lib/connector/types";
import type { DiscoveredDeviceSummary } from "@/lib/connector/discoveryTypes";

export type NetworkActivityItem = {
  id: string;
  message: string;
  timestamp: string | null;
  tone: "neutral" | "attention" | "positive";
};

function deviceLabel(device: DiscoveredDeviceSummary): string {
  return (
    device.hostname ??
    device.manufacturer ??
    device.ipAddress ??
    "Discovered device"
  );
}

export function buildNetworkActivityItems(input: {
  devices: DiscoveredDeviceSummary[];
  connectors: ConnectorInstallationSummary[];
  reviewCount: number;
  now?: number;
}): NetworkActivityItem[] {
  const items: NetworkActivityItem[] = [];

  if (input.reviewCount > 0) {
    items.push({
      id: "review-needed",
      message: `${input.reviewCount} new device${input.reviewCount === 1 ? "" : "s"} need review`,
      timestamp: null,
      tone: "attention",
    });
  }

  const latestScanConnector = input.connectors
    .filter(
      (connector) =>
        connector.status !== "revoked" &&
        connector.lastScanAt
    )
    .sort(
      (left, right) =>
        new Date(right.lastScanAt ?? 0).getTime() -
        new Date(left.lastScanAt ?? 0).getTime()
    )[0];

  if (latestScanConnector?.lastScanAt) {
    items.push({
      id: `scan-${latestScanConnector.id}`,
      message: "Connector completed a scan",
      timestamp: latestScanConnector.lastScanAt,
      tone: "neutral",
    });
  }

  const recentMatches = input.devices
    .filter(
      (device) =>
        device.matchStatus === "matched" &&
        device.matchedDevice?.deviceName
    )
    .slice(0, 3);

  for (const device of recentMatches) {
    items.push({
      id: `match-${device.id}`,
      message: `${deviceLabel(device)} matched to ${device.matchedDevice?.deviceName ?? "a vault device"}`,
      timestamp: device.lastSeenAt,
      tone: "positive",
    });
  }

  return items.slice(0, 5).map((item) => ({
    ...item,
    message: item.timestamp
      ? `${item.message} · ${formatConnectorRelativeTime(item.timestamp, input.now)}`
      : item.message,
  }));
}
