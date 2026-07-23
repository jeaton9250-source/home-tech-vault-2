import {
  deriveConnectorPresence,
  type ConnectorPresence,
} from "@/lib/connector/presence";

import type { ConnectorInstallationSummary } from "@/lib/connector/types";
import type { DiscoveryStatsSummary } from "@/lib/connector/discoveryTypes";

export type ConnectorHealthStatus =
  | "excellent"
  | "healthy"
  | "attention"
  | "offline"
  | "not_installed";

export type ConnectorHealthSummary = {
  status: ConnectorHealthStatus;
  score: number;
  label: string;
  description: string;
  signals: Array<{
    id: string;
    label: string;
    ok: boolean;
    detail: string;
  }>;
};

function presenceScore(presence: ConnectorPresence): number {
  switch (presence) {
    case "online":
      return 100;
    case "recently_seen":
      return 75;
    case "pending":
      return 50;
    case "offline":
      return 25;
    case "revoked":
      return 0;
  }
}

export function computeConnectorHealth(input: {
  connectors: ConnectorInstallationSummary[];
  monitoringEnabled: boolean;
  stats: DiscoveryStatsSummary | null;
  now?: number;
}): ConnectorHealthSummary {
  const activeConnectors = input.connectors.filter(
    (connector) => connector.status !== "revoked"
  );

  if (activeConnectors.length === 0) {
    return {
      status: "not_installed",
      score: 0,
      label: "Not installed",
      description:
        "Install the Home Tech Vault Connector to discover devices on your network.",
      signals: [
        {
          id: "installation",
          label: "Connector installed",
          ok: false,
          detail: "No active connector paired.",
        },
      ],
    };
  }

  const primary = activeConnectors[0];
  const presence = deriveConnectorPresence(
    primary.status,
    primary.lastSeenAt,
    input.now
  );
  const heartbeatScore = presenceScore(presence);
  const scanScore = primary.lastScanAt ? 100 : 40;
  const monitoringScore = input.monitoringEnabled ? 100 : 60;
  const discoveryScore = input.stats
    ? Math.min(
        100,
        Math.round(
          ((input.stats.matchedDevices +
            input.stats.totalDiscovered) /
            Math.max(input.stats.totalDiscovered, 1)) *
            100
        )
      )
    : 50;

  const score = Math.round(
    heartbeatScore * 0.35 +
      scanScore * 0.25 +
      monitoringScore * 0.2 +
      discoveryScore * 0.2
  );

  const signals = [
    {
      id: "heartbeat",
      label: "Heartbeat",
      ok: presence === "online" || presence === "recently_seen",
      detail:
        presence === "online"
          ? "Connector checked in recently."
          : "Waiting for a recent heartbeat.",
    },
    {
      id: "scan",
      label: "Last scan",
      ok: Boolean(primary.lastScanAt),
      detail: primary.lastScanAt
        ? "Manual or automatic scan completed."
        : "No scan recorded yet.",
    },
    {
      id: "monitoring",
      label: "Monitoring",
      ok: input.monitoringEnabled,
      detail: input.monitoringEnabled
        ? "Automatic monitoring is active."
        : "Manual scans only on Free.",
    },
    {
      id: "discovery",
      label: "Discovery coverage",
      ok: Boolean(input.stats?.totalDiscovered),
      detail: input.stats
        ? `${input.stats.totalDiscovered} devices discovered.`
        : "Run a scan to populate discovery results.",
    },
  ];

  let status: ConnectorHealthStatus = "healthy";
  let label = "Healthy";

  if (presence === "offline" || presence === "revoked") {
    status = "offline";
    label = "Offline";
  } else if (score >= 90) {
    status = "excellent";
    label = "Excellent";
  } else if (score >= 70) {
    status = "healthy";
    label = "Healthy";
  } else {
    status = "attention";
    label = "Needs attention";
  }

  return {
    status,
    score,
    label,
    description:
      status === "offline"
        ? "The connector has not checked in recently."
        : "Connector health reflects heartbeat, scans, monitoring, and discovery coverage.",
    signals,
  };
}
