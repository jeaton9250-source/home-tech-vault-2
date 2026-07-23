import { CONNECTOR_MACOS_APP_VERSION } from "@/lib/connector/constants";
import { computeConnectorHealth } from "@/lib/connector/health";
import { buildConnectorScanHistory } from "@/lib/connector/scanHistory";
import { checkConnectorUpdate } from "@/lib/connector/updates";
import { getConnectorPlatforms } from "@/lib/connector/platforms";

import type { ConnectorInstallationSummary } from "@/lib/connector/types";
import type { DiscoveryStatsSummary } from "@/lib/connector/discoveryTypes";

export type ConnectorDiagnosticsBundle = {
  exportedAt: string;
  householdId: string | null;
  householdName: string | null;
  plan: string;
  latestVersion: string;
  platforms: ReturnType<typeof getConnectorPlatforms>;
  connectors: ConnectorInstallationSummary[];
  scanHistory: ReturnType<typeof buildConnectorScanHistory>;
  stats: DiscoveryStatsSummary | null;
  health: ReturnType<typeof computeConnectorHealth>;
  updateChecks: ReturnType<typeof checkConnectorUpdate>[];
};

export function buildConnectorDiagnosticsBundle(input: {
  householdId: string | null;
  householdName: string | null;
  plan: string;
  connectors: ConnectorInstallationSummary[];
  stats: DiscoveryStatsSummary | null;
  monitoringEnabled: boolean;
}): ConnectorDiagnosticsBundle {
  const activeConnectors = input.connectors.filter(
    (connector) => connector.status !== "revoked"
  );

  return {
    exportedAt: new Date().toISOString(),
    householdId: input.householdId,
    householdName: input.householdName,
    plan: input.plan,
    latestVersion: CONNECTOR_MACOS_APP_VERSION,
    platforms: getConnectorPlatforms(),
    connectors: input.connectors,
    scanHistory: buildConnectorScanHistory(input.connectors),
    stats: input.stats,
    health: computeConnectorHealth({
      connectors: input.connectors,
      monitoringEnabled: input.monitoringEnabled,
      stats: input.stats,
    }),
    updateChecks: activeConnectors.map((connector) =>
      checkConnectorUpdate(connector.appVersion)
    ),
  };
}

export function serializeDiagnosticsBundle(
  bundle: ConnectorDiagnosticsBundle
): string {
  return JSON.stringify(bundle, null, 2);
}
