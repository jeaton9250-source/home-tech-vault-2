import "server-only";

import { deriveDeviceNetworkPresence } from "@/lib/devices/devicePresence";

import type { SupabaseClient } from "@supabase/supabase-js";

export type VaultDeviceNetworkSnapshot = {
  id: string;
  online?: boolean | null;
  last_seen_at?: string | null;
  first_seen_at?: string | null;
  ip_address?: string | null;
  hostname?: string | null;
  manufacturer?: string | null;
  network_updated_at?: string | null;
};

type RecordNetworkSyncEventsInput = {
  admin: SupabaseClient;
  householdId: string;
  connectorId: string;
  discoveredDeviceId?: string | null;
  deviceId: string;
  previous: VaultDeviceNetworkSnapshot;
  next: VaultDeviceNetworkSnapshot;
  scannedAt: string;
  actorUserId?: string | null;
};

function presenceState(snapshot: VaultDeviceNetworkSnapshot) {
  return deriveDeviceNetworkPresence({
    online: snapshot.online,
    lastSeenAt: snapshot.last_seen_at,
    firstSeenAt: snapshot.first_seen_at,
    networkUpdatedAt: snapshot.network_updated_at,
  });
}

async function insertMonitorEvent(
  admin: SupabaseClient,
  input: {
    householdId: string;
    connectorId: string;
    discoveredDeviceId?: string | null;
    deviceId: string;
    eventType: string;
    previousState: Record<string, unknown> | null;
    newState: Record<string, unknown> | null;
    observedAt: string;
  }
) {
  const { error } = await admin.from("device_monitor_events").insert({
    household_id: input.householdId,
    connector_id: input.connectorId,
    discovered_device_id: input.discoveredDeviceId ?? null,
    device_id: input.deviceId,
    event_type: input.eventType,
    previous_state: input.previousState,
    new_state: input.newState,
    observed_at: input.observedAt,
  });

  if (error) {
    console.error(
      "[deviceNetworkSync] monitor event insert failed:",
      error.message
    );
  }
}

async function insertTimelineEvent(
  admin: SupabaseClient,
  input: {
    deviceId: string;
    userId: string;
    eventType: string;
    title: string;
    description?: string | null;
    eventDate: string;
  }
) {
  const { error } = await admin.from("device_events").insert({
    device_id: input.deviceId,
    user_id: input.userId,
    event_type: input.eventType,
    title: input.title,
    description: input.description ?? null,
    event_date: input.eventDate,
  });

  if (error) {
    console.error(
      "[deviceNetworkSync] timeline event insert failed:",
      error.message
    );
  }
}

/**
 * Record meaningful network observation changes after a matched vault device update.
 * Skips repetitive "still online" events on every scan.
 */
export async function recordVaultDeviceNetworkSyncEvents(
  input: RecordNetworkSyncEventsInput
) {
  const events: Array<{
    eventType: string;
    title: string;
    description?: string;
    previousState?: Record<string, unknown>;
    newState?: Record<string, unknown>;
  }> = [];

  const previousPresence = presenceState(input.previous);
  const nextPresence = presenceState(input.next);

  if (!input.previous.first_seen_at && input.next.first_seen_at) {
    events.push({
      eventType: "device_discovered",
      title: "Device discovered on the network",
      description: "The connector observed this device during a network scan.",
    });
  }

  if (
    previousPresence !== "online" &&
    nextPresence === "online"
  ) {
    events.push({
      eventType: "device_online",
      title: "Device detected online",
      description: "Seen during the latest connector scan.",
      previousState: { presence: previousPresence },
      newState: { presence: nextPresence },
    });
  }

  if (
    (previousPresence === "not_recently_detected" ||
      previousPresence === "unknown") &&
    (nextPresence === "online" ||
      nextPresence === "recently_detected")
  ) {
    events.push({
      eventType: "device_returned",
      title: "Device returned to the network",
      description: "The connector observed this device again.",
      previousState: { presence: previousPresence },
      newState: { presence: nextPresence },
    });
  }

  if (
    previousPresence !== "not_recently_detected" &&
    nextPresence === "not_recently_detected" &&
    input.previous.last_seen_at
  ) {
    events.push({
      eventType: "device_not_recently_detected",
      title: "Device not recently detected",
      description:
        "The connector has not observed this device recently.",
      previousState: { presence: previousPresence },
      newState: { presence: nextPresence },
    });
  }

  if (
    input.previous.ip_address &&
    input.next.ip_address &&
    input.previous.ip_address !== input.next.ip_address
  ) {
    events.push({
      eventType: "ip_changed",
      title: "IP address changed",
      description: `${input.previous.ip_address} → ${input.next.ip_address}`,
      previousState: { ip_address: input.previous.ip_address },
      newState: { ip_address: input.next.ip_address },
    });
  }

  if (
    input.previous.hostname &&
    input.next.hostname &&
    input.previous.hostname !== input.next.hostname
  ) {
    events.push({
      eventType: "hostname_changed",
      title: "Hostname changed",
      description: `${input.previous.hostname} → ${input.next.hostname}`,
      previousState: { hostname: input.previous.hostname },
      newState: { hostname: input.next.hostname },
    });
  }

  if (
    !input.previous.manufacturer?.trim() &&
    input.next.manufacturer?.trim()
  ) {
    events.push({
      eventType: "manufacturer_identified",
      title: "Manufacturer identified",
      description: input.next.manufacturer,
      newState: { manufacturer: input.next.manufacturer },
    });
  }

  for (const event of events) {
    await insertMonitorEvent(input.admin, {
      householdId: input.householdId,
      connectorId: input.connectorId,
      discoveredDeviceId: input.discoveredDeviceId,
      deviceId: input.deviceId,
      eventType: event.eventType,
      previousState: event.previousState ?? null,
      newState: event.newState ?? null,
      observedAt: input.scannedAt,
    });

    if (input.actorUserId) {
      await insertTimelineEvent(input.admin, {
        deviceId: input.deviceId,
        userId: input.actorUserId,
        eventType: event.eventType,
        title: event.title,
        description: event.description ?? null,
        eventDate: input.scannedAt,
      });
    }
  }
}

export async function recordDeviceMatchedNetworkEvent(input: {
  admin: SupabaseClient;
  householdId: string;
  connectorId: string;
  discoveredDeviceId: string;
  deviceId: string;
  matchedAt: string;
  actorUserId: string;
}) {
  await insertMonitorEvent(input.admin, {
    householdId: input.householdId,
    connectorId: input.connectorId,
    discoveredDeviceId: input.discoveredDeviceId,
    deviceId: input.deviceId,
    eventType: "device_matched",
    previousState: null,
    newState: { matched: true },
    observedAt: input.matchedAt,
  });

  await insertTimelineEvent(input.admin, {
    deviceId: input.deviceId,
    userId: input.actorUserId,
    eventType: "device_matched",
    title: "Matched to a network device",
    description:
      "This vault device is now linked to connector discovery results.",
    eventDate: input.matchedAt,
  });
}
