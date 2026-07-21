import { supabase, formatSupabaseError } from "@/lib/supabase";

import {
  applyHouseholdScope,
  applyOwnerUserScope,
  resolveHouseholdScope,
} from "@/lib/data/householdScope";

import { getActivityTypeLabel } from "@/lib/activity/icons";

import type {
  ActivityFeedFilters,
  VaultActivityEvent,
  VaultActivityType,
} from "@/lib/activity/types";

type DeviceEventRow = {
  id: string;
  device_id: string;
  user_id: string;
  event_type: string;
  title: string;
  description: string | null;
  event_date: string;
  created_at: string;
};

type NetworkScanRow = {
  id: string;
  scanned_at: string | null;
  devices_found: number | null;
  new_devices: number | null;
};

function mapDeviceEventType(
  eventType: string
): VaultActivityType {
  switch (eventType) {
    case "Added":
      return "device.added";

    case "Update":
      return "device.edited";

    case "Deleted":
      return "device.deleted";

    case "Document":
      return "document.uploaded";

    case "Warranty":
      return "warranty.added";

    case "Maintenance":
      return "maintenance.completed";

    case "Photo":
      return "photo.uploaded";

    default:
      return "maintenance.completed";
  }
}

function deviceEventToActivity(
  row: DeviceEventRow
): VaultActivityEvent {
  return {
    id: `device-event-${row.id}`,
    activityType: mapDeviceEventType(
      row.event_type
    ),
    title: row.title,
    description: row.description,
    occurredAt: row.event_date || row.created_at,
    userId: row.user_id,
    userDisplayName: null,
    householdId: null,
    deviceId: row.device_id,
    entityId: row.id,
    source: "device_events",
  };
}

function dedupeEvents(
  events: VaultActivityEvent[]
): VaultActivityEvent[] {
  const seenIds = new Set<string>();
  const seenEntities = new Set<string>();

  return events.filter((event) => {
    if (seenIds.has(event.id)) {
      return false;
    }

    seenIds.add(event.id);

    if (event.entityId) {
      const entityKey = `${event.activityType}-${event.entityId}`;

      if (seenEntities.has(entityKey)) {
        return false;
      }

      seenEntities.add(entityKey);
    }

    return true;
  });
}

/**
 * Read-only activity feed derived from scoped vault records.
 * Device timeline events come from `device_events`.
 * Household network scans come from scoped `network_scans`.
 */
export async function loadActivityFeed(
  filters: ActivityFeedFilters
): Promise<VaultActivityEvent[]> {
  const {
    deviceId,
    householdId,
    householdOwnerId,
    userId,
    limit = 50,
  } = filters;

  if (!userId) {
    return [];
  }

  const events: VaultActivityEvent[] = [];
  let deviceIds: string[] = [];

  if (deviceId) {
    deviceIds = [deviceId];
  } else {
    const scope = resolveHouseholdScope(
      householdId ?? null,
      userId
    );

    const devicesResult =
      await applyHouseholdScope(
        supabase.from("devices").select("id"),
        householdId ?? null,
        userId
      );

    if (devicesResult.error) {
      console.error(
        "Unable to load devices for activity feed:",
        {
          scope,
          userId,
          householdId,
          error: formatSupabaseError(
            devicesResult.error
          ),
        }
      );
    } else {
      deviceIds = (
        (devicesResult.data ?? []) as {
          id: string;
        }[]
      ).map((device) => device.id);
    }
  }

  if (deviceIds.length > 0) {
    const deviceEventsResult =
      await supabase
        .from("device_events")
        .select("*")
        .in("device_id", deviceIds)
        .order("event_date", {
          ascending: false,
        })
        .limit(limit);

    if (deviceEventsResult.error) {
      console.error(
        "Unable to load device events:",
        formatSupabaseError(
          deviceEventsResult.error
        )
      );
    } else {
      events.push(
        ...(
          (deviceEventsResult.data ||
            []) as DeviceEventRow[]
        ).map(deviceEventToActivity)
      );
    }
  }

  if (!deviceId) {
    const scansResult =
      await applyOwnerUserScope(
        supabase
          .from("network_scans")
          .select(
            "id, scanned_at, devices_found, new_devices"
          )
          .order("scanned_at", {
            ascending: false,
          })
          .limit(10),
        householdId ?? null,
        userId,
        householdOwnerId ?? null
      );

    if (!scansResult.error) {
      for (const scan of (scansResult.data ??
        []) as NetworkScanRow[]) {
        if (!scan.scanned_at) {
          continue;
        }

        events.push({
          id: `derived-scan-${scan.id}`,
          activityType:
            "network.scan.completed",
          title: "Network scan completed",
          description: `Found ${scan.devices_found ?? 0} device${
            (scan.devices_found ?? 0) === 1
              ? ""
              : "s"
          }${
            scan.new_devices
              ? ` (${scan.new_devices} new)`
              : ""
          }.`,
          occurredAt: scan.scanned_at,
          userId,
          userDisplayName: null,
          householdId: householdId ?? null,
          deviceId: null,
          entityId: scan.id,
          source: "derived",
        });
      }
    }
  }

  const filtered = deviceId
    ? events.filter(
        (event) =>
          event.deviceId === deviceId
      )
    : events;

  return dedupeEvents(filtered)
    .sort(
      (first, second) =>
        new Date(
          second.occurredAt
        ).getTime() -
        new Date(
          first.occurredAt
        ).getTime()
    )
    .slice(0, limit);
}

export function getDefaultActivityTitle(
  activityType: VaultActivityType,
  subject: string
): string {
  switch (activityType) {
    case "device.added":
      return `${subject} added to vault`;

    case "device.edited":
      return `${subject} updated`;

    case "device.deleted":
      return `${subject} removed from vault`;

    case "document.uploaded":
      return `Document uploaded for ${subject}`;

    case "receipt.uploaded":
      return `Receipt uploaded for ${subject}`;

    case "warranty.added":
      return `Warranty recorded for ${subject}`;

    case "subscription.added":
      return `${subject} subscription added`;

    case "network.scan.completed":
      return "Network scan completed";

    case "family.member.invited":
      return `${subject} invited to household`;

    case "family.member.joined":
      return `${subject} joined the household`;

    case "family.member.removed":
      return `${subject} removed from household`;

    case "room.created":
      return `${subject} room created`;

    case "room.deleted":
      return `${subject} room removed`;

    default:
      return getActivityTypeLabel(
        activityType
      );
  }
}
