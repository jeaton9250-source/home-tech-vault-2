"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { checkConnectorUpdate } from "@/lib/connector/updates";
import { buildConnectorMonitoringSummary } from "@/lib/connector/connectorMonitoring";
import { buildDemoNetworkPagePayload } from "@/lib/demo/demoConnectorExperience";
import { buildNetworkActivityItems } from "@/lib/network/activity";
import {
  buildNetworkHeaderSummary,
  buildNetworkSummary,
  type NetworkSummary,
} from "@/lib/network/summary";

import type { ConnectorInstallationSummary } from "@/lib/connector/types";
import type {
  DiscoveredDeviceSummary,
  DiscoveryStatsSummary,
} from "@/lib/connector/discoveryTypes";
import type { SubscriptionPlan } from "@/hooks/useSubscription";

export type NetworkPageData = {
  loading: boolean;
  error: string | null;
  summary: NetworkSummary;
  headerSummary: string | null;
  devices: DiscoveredDeviceSummary[];
  connectors: ConnectorInstallationSummary[];
  stats: DiscoveryStatsSummary | null;
  monitoringEnabled: boolean;
  monitoringSummary: ReturnType<typeof buildConnectorMonitoringSummary>;
  activityItems: ReturnType<typeof buildNetworkActivityItems>;
  updateCheck: ReturnType<typeof checkConnectorUpdate> | null;
  refresh: () => Promise<void>;
};

type UseNetworkPageDataInput = {
  householdId: string | null;
  plan: SubscriptionPlan;
  isPlatformAdmin: boolean;
  canUseMonitoring: boolean;
  enabled?: boolean;
  isDemo?: boolean;
};

async function fetchNetworkPagePayload(householdId: string) {
  const [statusResponse, discoveryResponse] = await Promise.all([
    fetch(
      `/api/connector/pair/status?householdId=${encodeURIComponent(householdId)}`,
      { cache: "no-store" }
    ),
    fetch(
      `/api/connector/discovery?householdId=${encodeURIComponent(householdId)}`,
      { cache: "no-store" }
    ),
  ]);

  const statusPayload = (await statusResponse.json()) as {
    connectors?: ConnectorInstallationSummary[];
    error?: string;
  };

  const discoveryPayload = (await discoveryResponse.json()) as {
    devices?: DiscoveredDeviceSummary[];
    stats?: DiscoveryStatsSummary;
    error?: string;
  };

  if (!statusResponse.ok) {
    throw new Error(
      statusPayload.error ?? "Unable to load connector status."
    );
  }

  if (!discoveryResponse.ok) {
    throw new Error(
      discoveryPayload.error ??
        "Unable to load discovery results."
    );
  }

  return {
    connectors: statusPayload.connectors ?? [],
    devices: discoveryPayload.devices ?? [],
    stats: discoveryPayload.stats ?? null,
  };
}

export function useNetworkPageData(
  input: UseNetworkPageDataInput
): NetworkPageData {
  const [connectors, setConnectors] = useState<
    ConnectorInstallationSummary[]
  >([]);
  const [devices, setDevices] = useState<
    DiscoveredDeviceSummary[]
  >([]);
  const [stats, setStats] =
    useState<DiscoveryStatsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNetworkPageData = useCallback(async () => {
    if (input.isDemo) {
      return;
    }

    if (!input.householdId || input.enabled === false) {
      setConnectors([]);
      setDevices([]);
      setStats(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = await fetchNetworkPagePayload(input.householdId);
      setConnectors(payload.connectors);
      setDevices(payload.devices);
      setStats(payload.stats);
    } catch (loadError: unknown) {
      setConnectors([]);
      setDevices([]);
      setStats(null);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Network information is temporarily unavailable."
      );
    } finally {
      setLoading(false);
    }
  }, [input.enabled, input.householdId, input.isDemo]);

  const demoPayload = useMemo(
    () => (input.isDemo ? buildDemoNetworkPagePayload() : null),
    [input.isDemo]
  );

  useEffect(() => {
    if (input.isDemo) {
      return;
    }

    let cancelled = false;

    async function run() {
      if (!input.householdId || input.enabled === false) {
        if (!cancelled) {
          setConnectors([]);
          setDevices([]);
          setStats(null);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setLoading(true);
        setError(null);
      }

      try {
        const payload = await fetchNetworkPagePayload(input.householdId);

        if (!cancelled) {
          setConnectors(payload.connectors);
          setDevices(payload.devices);
          setStats(payload.stats);
        }
      } catch (loadError: unknown) {
        if (!cancelled) {
          setConnectors([]);
          setDevices([]);
          setStats(null);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Network information is temporarily unavailable."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void run();

    const intervalId = window.setInterval(() => {
      if (!input.householdId || input.enabled === false) {
        return;
      }

      void fetchNetworkPagePayload(input.householdId)
        .then((payload) => {
          if (cancelled) {
            return;
          }

          setConnectors(payload.connectors);
          setDevices(payload.devices);
          setStats(payload.stats);
          setError(null);
        })
        .catch(() => {
          // Keep the current snapshot on background refresh failures.
        });
    }, 45_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [input.enabled, input.householdId, input.isDemo]);

  const monitoringEnabled = input.isDemo
    ? true
    : input.canUseMonitoring;

  const effectiveConnectors =
    demoPayload?.connectors ?? connectors;
  const effectiveDevices = demoPayload?.devices ?? devices;
  const effectiveStats = demoPayload?.stats ?? stats;
  const effectiveLoading = input.isDemo ? false : loading;
  const effectiveError = input.isDemo ? null : error;

  const summary = useMemo(
    () =>
      buildNetworkSummary({
        connectors: effectiveConnectors,
        devices: effectiveDevices,
        stats: effectiveStats,
        monitoringEnabled,
      }),
    [effectiveConnectors, effectiveDevices, effectiveStats, monitoringEnabled]
  );

  const monitoringSummary = useMemo(
    () =>
      buildConnectorMonitoringSummary({
        monitoringEnabled,
        lastScanAt: summary.primaryConnector?.lastScanAt,
      }),
    [monitoringEnabled, summary.primaryConnector?.lastScanAt]
  );

  const activityItems = useMemo(
    () =>
      buildNetworkActivityItems({
        devices: effectiveDevices,
        connectors: effectiveConnectors,
        reviewCount: summary.reviewCount,
      }),
    [effectiveDevices, effectiveConnectors, summary.reviewCount]
  );

  const updateCheck = summary.primaryConnector
    ? checkConnectorUpdate(summary.primaryConnector.appVersion)
    : null;

  return {
    loading: effectiveLoading,
    error: effectiveError,
    summary,
    headerSummary: buildNetworkHeaderSummary(summary, effectiveLoading),
    devices: effectiveDevices,
    connectors: effectiveConnectors,
    stats: effectiveStats,
    monitoringEnabled,
    monitoringSummary,
    activityItems,
    updateCheck,
    refresh: loadNetworkPageData,
  };
}
