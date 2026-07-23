import type { DiscoveryStatsSummary } from "@/lib/connector/discoveryTypes";
import type { ConnectorInstallationSummary } from "@/lib/connector/types";

export type SmartHomeSummary = {
  headline: string;
  description: string;
  metrics: Array<{
    id: string;
    label: string;
    value: string;
    detail: string;
  }>;
  recommendations: string[];
};

export function buildSmartHomeSummary(input: {
  connectors: ConnectorInstallationSummary[];
  stats: DiscoveryStatsSummary | null;
  monitoringEnabled: boolean;
}): SmartHomeSummary {
  const activeConnectors = input.connectors.filter(
    (connector) => connector.status !== "revoked"
  );

  if (activeConnectors.length === 0) {
    return {
      headline: "Discover your smart home",
      description:
        "Install the connector to map devices on your network and keep your vault synchronized.",
      metrics: [
        {
          id: "connectors",
          label: "Connectors",
          value: "0",
          detail: "No Mac paired yet",
        },
        {
          id: "discovered",
          label: "Discovered",
          value: "—",
          detail: "Run a scan after pairing",
        },
        {
          id: "online",
          label: "Online now",
          value: "—",
          detail: "Presence requires Pro monitoring",
        },
      ],
      recommendations: [
        "Download and pair the connector on a home Mac.",
        "Run a manual scan to populate discovery results.",
      ],
    };
  }

  const stats = input.stats;
  const onlineCount = stats?.recentlyDetected ?? 0;
  const matchedCount = stats?.matchedDevices ?? 0;
  const reviewCount = stats?.needsReview ?? 0;

  return {
    headline: input.monitoringEnabled
      ? "Your home network is being monitored"
      : "Manual discovery is active",
    description: input.monitoringEnabled
      ? "Background scans keep device presence, discovery, and Home Pulse up to date."
      : "Manual scans and discovery review are available on Free. Upgrade to Pro for automatic monitoring.",
    metrics: [
      {
        id: "connectors",
        label: "Connectors",
        value: String(activeConnectors.length),
        detail:
          activeConnectors.length === 1
            ? activeConnectors[0].name
            : `${activeConnectors.length} paired Macs`,
      },
      {
        id: "discovered",
        label: "Discovered",
        value: String(stats?.totalDiscovered ?? 0),
        detail: `${matchedCount} matched to vault`,
      },
      {
        id: "online",
        label: "Recently seen",
        value: String(onlineCount),
        detail: input.monitoringEnabled
          ? "Updated by connector scans"
          : "Enable Pro for live presence",
      },
    ],
    recommendations: [
      ...(reviewCount > 0
        ? [
            `Review ${reviewCount} possible match${reviewCount === 1 ? "" : "es"} in discovery.`,
          ]
        : []),
      ...(stats?.newDevices
        ? [
            `Import or ignore ${stats.newDevices} newly discovered device${stats.newDevices === 1 ? "" : "s"}.`,
          ]
        : []),
      ...(!input.monitoringEnabled
        ? ["Upgrade to Pro for automatic scans every 15 minutes."]
        : ["Open diagnostics if a connector stops reporting heartbeats."]),
    ],
  };
}
