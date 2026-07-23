import type { DiscoveryStatsSummary } from "@/lib/connector/discoveryTypes";
import type { ConnectorInstallationSummary } from "@/lib/connector/types";

import {
  computeConnectorHealth,
  type ConnectorHealthSummary,
} from "@/lib/connector/health";

export type HomePulseConnectorSignal = {
  id: string;
  title: string;
  message: string;
  href: string;
  priority: number;
  tone: "positive" | "warning" | "neutral";
};

export function buildHomePulseConnectorSignals(input: {
  connectors: ConnectorInstallationSummary[];
  stats: DiscoveryStatsSummary | null;
  monitoringEnabled: boolean;
}): HomePulseConnectorSignal[] {
  const health = computeConnectorHealth({
    connectors: input.connectors,
    monitoringEnabled: input.monitoringEnabled,
    stats: input.stats,
  });

  const signals: HomePulseConnectorSignal[] = [];

  if (health.status === "not_installed") {
    signals.push({
      id: "connector-install",
      title: "Install the connector",
      message:
        "Pair a Mac to discover and monitor devices on your home network.",
      href: "/network/connect",
      priority: 90,
      tone: "warning",
    });
    return signals;
  }

  if (health.status === "offline") {
    signals.push({
      id: "connector-offline",
      title: "Connector offline",
      message:
        "Your connector has not checked in recently. Open the connector app on your Mac.",
      href: "/network",
      priority: 85,
      tone: "warning",
    });
  }

  if (input.stats?.needsReview) {
    signals.push({
      id: "connector-review",
      title: "Review discovered devices",
      message: `${input.stats.needsReview} device${input.stats.needsReview === 1 ? "" : "s"} need review before import.`,
      href: "/network/discovery",
      priority: 80,
      tone: "warning",
    });
  }

  if (input.stats?.newDevices) {
    signals.push({
      id: "connector-new",
      title: "New devices detected",
      message: `${input.stats.newDevices} new device${input.stats.newDevices === 1 ? "" : "s"} found on your network.`,
      href: "/network/discovery",
      priority: 75,
      tone: "neutral",
    });
  }

  if (!input.monitoringEnabled) {
    signals.push({
      id: "connector-monitoring",
      title: "Automatic monitoring available",
      message:
        "Upgrade to Pro for background scans, presence monitoring, and live Home Pulse updates.",
      href: "/upgrade",
      priority: 60,
      tone: "neutral",
    });
  } else if (health.status === "excellent" || health.status === "healthy") {
    signals.push({
      id: "connector-healthy",
      title: "Network monitoring active",
      message: "Your connector is healthy and keeping discovery results up to date.",
      href: "/network",
      priority: 40,
      tone: "positive",
    });
  }

  return signals.sort(
    (left, right) => right.priority - left.priority
  );
}

export function summarizeConnectorHealthForPulse(
  health: ConnectorHealthSummary
): string {
  if (health.status === "not_installed") {
    return "Connector not installed";
  }

  return `Connector ${health.label.toLowerCase()} (${health.score}%)`;
}
