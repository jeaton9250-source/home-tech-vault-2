import type { ConnectorInstallationSummary } from "@/lib/connector/types";

export type ConnectorScanHistoryEntry = {
  id: string;
  connectorId: string;
  connectorName: string;
  scannedAt: string;
  source: "manual" | "automatic" | "unknown";
  platform: string | null;
};

export function buildConnectorScanHistory(
  connectors: ConnectorInstallationSummary[]
): ConnectorScanHistoryEntry[] {
  return connectors
    .filter(
      (connector) =>
        connector.status !== "revoked" &&
        Boolean(connector.lastScanAt)
    )
    .map((connector) => ({
      id: `${connector.id}:${connector.lastScanAt}`,
      connectorId: connector.id,
      connectorName: connector.name,
      scannedAt: connector.lastScanAt as string,
      source: "manual" as const,
      platform: connector.platform,
    }))
    .sort(
      (left, right) =>
        new Date(right.scannedAt).getTime() -
        new Date(left.scannedAt).getTime()
    );
}

export function formatConnectorTimestamp(
  value: string | null | undefined
): string {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatConnectorRelativeTime(
  value: string | null | undefined,
  now = Date.now()
): string {
  if (!value) {
    return "Never";
  }

  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return value;
  }

  const difference = now - timestamp;
  const minutes = Math.floor(difference / (1000 * 60));

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days} day${days === 1 ? "" : "s"} ago`;
}
