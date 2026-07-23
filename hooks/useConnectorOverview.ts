"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { buildConnectorAccessContext } from "@/lib/connector/access";
import { computeConnectorHealth } from "@/lib/connector/health";
import { buildConnectorScanHistory } from "@/lib/connector/scanHistory";
import { buildSmartHomeSummary } from "@/lib/connector/smartHomeSummary";
import { checkConnectorUpdate } from "@/lib/connector/updates";
import {
  deriveConnectorPresence,
  connectorPresenceLabel,
} from "@/lib/connector/presence";
import { formatPlatformLabel } from "@/lib/connector/platforms";

import type { ConnectorInstallationSummary } from "@/lib/connector/types";
import type { DiscoveryStatsSummary } from "@/lib/connector/discoveryTypes";
import type { SubscriptionPlan } from "@/hooks/useSubscription";

export type ConnectorOverviewState = {
  loading: boolean;
  error: string | null;
  connectors: ConnectorInstallationSummary[];
  stats: DiscoveryStatsSummary | null;
  activeConnectors: ConnectorInstallationSummary[];
  primaryConnector: ConnectorInstallationSummary | null;
  isInstalled: boolean;
  monitoringEnabled: boolean;
  monitoringLabel: string;
  householdName: string | null;
  health: ReturnType<typeof computeConnectorHealth>;
  scanHistory: ReturnType<typeof buildConnectorScanHistory>;
  smartHomeSummary: ReturnType<typeof buildSmartHomeSummary>;
  updateCheck: ReturnType<typeof checkConnectorUpdate> | null;
  access: ReturnType<typeof buildConnectorAccessContext>;
  refresh: () => Promise<void>;
};

type UseConnectorOverviewInput = {
  householdId: string | null;
  householdName?: string | null;
  plan: SubscriptionPlan;
  isPlatformAdmin: boolean;
  canUseMonitoring: boolean;
  enabled?: boolean;
};

export function useConnectorOverview(
  input: UseConnectorOverviewInput
): ConnectorOverviewState {
  const [connectors, setConnectors] = useState<
    ConnectorInstallationSummary[]
  >([]);
  const [stats, setStats] =
    useState<DiscoveryStatsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    null
  );

  const refresh = useCallback(async () => {
    if (!input.householdId || input.enabled === false) {
      setConnectors([]);
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [statusResponse, discoveryResponse] =
        await Promise.all([
          fetch(
            `/api/connector/pair/status?householdId=${encodeURIComponent(input.householdId)}`,
            { cache: "no-store" }
          ),
          fetch(
            `/api/connector/discovery?householdId=${encodeURIComponent(input.householdId)}`,
            { cache: "no-store" }
          ),
        ]);

      const statusPayload =
        (await statusResponse.json()) as {
          connectors?: ConnectorInstallationSummary[];
          error?: string;
        };

      const discoveryPayload =
        (await discoveryResponse.json()) as {
          stats?: DiscoveryStatsSummary;
          error?: string;
        };

      if (!statusResponse.ok) {
        throw new Error(
          statusPayload.error ??
            "Unable to load connector status."
        );
      }

      setConnectors(statusPayload.connectors ?? []);
      setStats(discoveryPayload.stats ?? null);
    } catch (loadError: unknown) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load connector overview."
      );
    } finally {
      setLoading(false);
    }
  }, [input.enabled, input.householdId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const activeConnectors = useMemo(
    () =>
      connectors.filter(
        (connector) => connector.status !== "revoked"
      ),
    [connectors]
  );

  const primaryConnector = activeConnectors[0] ?? null;
  const monitoringEnabled = input.canUseMonitoring;
  const access = buildConnectorAccessContext({
    plan: input.plan,
    isPlatformAdmin: input.isPlatformAdmin,
    canUseMonitoring: monitoringEnabled,
    activeConnectorCount: activeConnectors.length,
  });

  const health = computeConnectorHealth({
    connectors,
    monitoringEnabled,
    stats,
  });

  const scanHistory = buildConnectorScanHistory(connectors);
  const smartHomeSummary = buildSmartHomeSummary({
    connectors,
    stats,
    monitoringEnabled,
  });

  const updateCheck = primaryConnector
    ? checkConnectorUpdate(primaryConnector.appVersion)
    : null;

  const monitoringLabel = monitoringEnabled
    ? "Automatic monitoring active"
    : "Manual scans only";

  return {
    loading,
    error,
    connectors,
    stats,
    activeConnectors,
    primaryConnector,
    isInstalled: activeConnectors.length > 0,
    monitoringEnabled,
    monitoringLabel,
    householdName: input.householdName ?? null,
    health,
    scanHistory,
    smartHomeSummary,
    updateCheck,
    access,
    refresh,
  };
}

export function describeConnectorStatus(
  connector: ConnectorInstallationSummary | null
) {
  if (!connector) {
    return "Not installed";
  }

  return connectorPresenceLabel(
    deriveConnectorPresence(
      connector.status,
      connector.lastSeenAt
    )
  );
}

export function describeConnectedDevice(
  connector: ConnectorInstallationSummary | null
) {
  if (!connector) {
    return "No device paired";
  }

  return connector.name;
}

export function describeConnectorPlatform(
  connector: ConnectorInstallationSummary | null
) {
  if (!connector) {
    return "—";
  }

  return formatPlatformLabel(connector.platform);
}
