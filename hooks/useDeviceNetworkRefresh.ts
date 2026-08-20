"use client";

import { useEffect, useMemo, useState } from "react";

import { deriveConnectorPresence } from "@/lib/connector/presence";
import { normalizeMacAddress } from "@/lib/connector/network";
import {
  mergePresenceFromDiscovery,
  pickFreshestDiscoveryPresence,
} from "@/lib/devices/deviceNetworkTimestamps";
import { supabase } from "@/lib/supabase";
import {
  buildDiscoveryDeviceOrFilter,
  buildUuidRealtimeFilter,
  isSafeUuid,
} from "@/lib/security/supabaseFilters";
import { applyHouseholdScope } from "@/lib/data/householdScope";

export type DeviceNetworkRecord = {
  id: string;
  online?: boolean | null;
  last_seen_at?: string | null;
  first_seen_at?: string | null;
  network_updated_at?: string | null;
  ip_address?: string | null;
  mac_address?: string | null;
  hostname?: string | null;
  manufacturer?: string | null;
  discovery_source?: string | null;
  connector_id?: string | null;
  network_fingerprint?: string | null;
};

type UseDeviceNetworkRefreshInput = {
  deviceId: string;
  householdId: string | null;
  userId: string | null;
  enabled?: boolean;
  pollIntervalMs?: number;
};

export function useDeviceNetworkRefresh(
  input: UseDeviceNetworkRefreshInput,
  currentDevice: DeviceNetworkRecord | null,
  onNetworkFieldsUpdate: (
    fields: Partial<DeviceNetworkRecord>
  ) => void
) {
  const [connectorName, setConnectorName] = useState<string | null>(
    null
  );
  const [connectorOnline, setConnectorOnline] = useState<boolean | null>(
    null
  );
  const [connectorLastSeenAt, setConnectorLastSeenAt] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (
      !input.enabled ||
      !input.deviceId ||
      !input.userId ||
      !input.householdId
    ) {
      return;
    }

    if (
      !isSafeUuid(input.deviceId) ||
      !isSafeUuid(input.userId) ||
      !isSafeUuid(input.householdId)
    ) {
      console.warn(
        "Skipping device network refresh because one or more identifiers are invalid."
      );
      return;
    }

    let cancelled = false;
    const householdId = input.householdId;
    const userId = input.userId;

    async function refreshNetworkState() {
      const deviceQuery = applyHouseholdScope(
        supabase
          .from("devices")
          .select(
            "id, online, last_seen_at, first_seen_at, network_updated_at, ip_address, mac_address, hostname, manufacturer, discovery_source, connector_id, network_fingerprint"
          )
          .eq("id", input.deviceId)
          .maybeSingle(),
        householdId,
        userId
      );

      const { data: deviceRow, error: deviceError } =
        await deviceQuery;

      if (cancelled || deviceError || !deviceRow) {
        return;
      }

      const { data: discoveryRows } = await supabase
        .from("discovered_devices")
        .select("imported_device_id, mac_address, online, last_seen_at")
        .eq("household_id", householdId)
        .is("ignored_at", null)
        .or(
          buildDiscoveryDeviceOrFilter(
            input.deviceId
          )
        )
        .order("last_seen_at", { ascending: false })
        .limit(20);

      if (cancelled) {
        return;
      }

      const deviceMac = normalizeMacAddress(
        deviceRow.mac_address ?? ""
      );
      const relevantDiscoveryRows = (discoveryRows ?? []).filter(
        (row) =>
          row.imported_device_id === input.deviceId ||
          (deviceMac &&
            normalizeMacAddress(row.mac_address ?? "") === deviceMac)
      );

      const merged = mergePresenceFromDiscovery(
        deviceRow,
        pickFreshestDiscoveryPresence(relevantDiscoveryRows)
      );

      onNetworkFieldsUpdate({
        ...deviceRow,
        online: merged.online,
        last_seen_at: merged.last_seen_at,
        network_updated_at: merged.network_updated_at,
      });

      if (deviceRow.connector_id) {
        const { data: connectorRow } = await supabase
          .from("connector_installations")
          .select("name, last_seen_at, status")
          .eq("id", deviceRow.connector_id)
          .maybeSingle();

        if (cancelled) {
          return;
        }

        setConnectorName(connectorRow?.name ?? null);
        setConnectorLastSeenAt(connectorRow?.last_seen_at ?? null);
        setConnectorOnline(
          deriveConnectorPresence(
            (connectorRow?.status as "active" | "pending" | "revoked") ??
              "pending",
            connectorRow?.last_seen_at ?? null
          ) === "online"
        );
      } else if (!cancelled) {
        setConnectorName(null);
        setConnectorLastSeenAt(null);
        setConnectorOnline(null);
      }
    }

    void refreshNetworkState();

    const intervalId = window.setInterval(() => {
      void refreshNetworkState();
    }, input.pollIntervalMs ?? 45_000);

    const channel = supabase
      .channel(`device-network-${input.deviceId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "devices",
          filter: buildUuidRealtimeFilter(
            "id",
            input.deviceId
          ),
        },
        () => {
          void refreshNetworkState();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "discovered_devices",
          filter: buildUuidRealtimeFilter(
            "imported_device_id",
            input.deviceId
          ),
        },
        () => {
          void refreshNetworkState();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      void supabase.removeChannel(channel);
    };
  }, [
    input.deviceId,
    input.enabled,
    input.householdId,
    input.pollIntervalMs,
    input.userId,
    onNetworkFieldsUpdate,
  ]);

  const connectorStatusMayBeOutdated = useMemo(() => {
    return (
      connectorOnline === true &&
      Boolean(currentDevice?.network_updated_at) &&
      Boolean(connectorLastSeenAt) &&
      Boolean(currentDevice?.last_seen_at) &&
      new Date(connectorLastSeenAt ?? 0).getTime() >
        new Date(currentDevice?.last_seen_at ?? 0).getTime() +
          5 * 60 * 1000
    );
  }, [
    connectorLastSeenAt,
    connectorOnline,
    currentDevice?.last_seen_at,
    currentDevice?.network_updated_at,
  ]);

  return {
    connectorName,
    connectorOnline,
    connectorLastSeenAt,
    connectorStatusMayBeOutdated,
  };
}
