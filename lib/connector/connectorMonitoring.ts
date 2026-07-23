import { CONNECTOR_AUTO_SCAN_INTERVAL_MINUTES } from "@/lib/connector/connectorPlans";
import {
  formatConnectorRelativeTime,
  formatConnectorTimestamp,
} from "@/lib/connector/scanHistory";

export type ConnectorMonitoringSummary = {
  mode: "manual" | "automatic";
  label: string;
  description: string;
  nextScanAt: string | null;
  nextScanLabel: string;
  lastScanAt: string | null;
  lastScanLabel: string;
  intervalMinutes: number;
};

export function computeNextAutomaticScan(
  lastScanAt: string | null | undefined,
  intervalMinutes = CONNECTOR_AUTO_SCAN_INTERVAL_MINUTES,
  now = Date.now()
): string | null {
  if (!lastScanAt) {
    return null;
  }

  const lastScanMs = new Date(lastScanAt).getTime();

  if (!Number.isFinite(lastScanMs)) {
    return null;
  }

  const intervalMs = intervalMinutes * 60 * 1000;
  let nextScanMs = lastScanMs + intervalMs;

  while (nextScanMs <= now) {
    nextScanMs += intervalMs;
  }

  return new Date(nextScanMs).toISOString();
}

export function buildConnectorMonitoringSummary(input: {
  monitoringEnabled: boolean;
  lastScanAt?: string | null;
  now?: number;
}): ConnectorMonitoringSummary {
  const lastScanAt = input.lastScanAt ?? null;

  if (!input.monitoringEnabled) {
    return {
      mode: "manual",
      label: "Manual scans",
      description:
        "Run Scan My Network from the connector app whenever you want fresh discovery results.",
      nextScanAt: null,
      nextScanLabel: "Automatic scans require Pro",
      lastScanAt,
      lastScanLabel: formatConnectorRelativeTime(lastScanAt, input.now),
      intervalMinutes: CONNECTOR_AUTO_SCAN_INTERVAL_MINUTES,
    };
  }

  const nextScanAt = computeNextAutomaticScan(
    lastScanAt,
    CONNECTOR_AUTO_SCAN_INTERVAL_MINUTES,
    input.now
  );

  return {
    mode: "automatic",
    label: "Automatic monitoring",
    description:
      "Your connector scans the network every 15 minutes and keeps device presence up to date.",
    nextScanAt,
    nextScanLabel: nextScanAt
      ? formatConnectorTimestamp(nextScanAt)
      : "Scheduled after first scan",
    lastScanAt,
    lastScanLabel: formatConnectorRelativeTime(lastScanAt, input.now),
    intervalMinutes: CONNECTOR_AUTO_SCAN_INTERVAL_MINUTES,
  };
}
