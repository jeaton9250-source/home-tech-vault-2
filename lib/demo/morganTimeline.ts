import type { DemoTimelineEvent } from "@/lib/demo/types";
import type { DemoDevice } from "@/lib/demo/types";
import { getDemoDeviceNetworkProfile } from "@/lib/demo/demoDeviceNetworkProfiles";
import {
  demoTimestampDaysAgo,
  demoTimestampMinutesAgo,
  formatDemoRelativeTime,
} from "@/lib/demo/demoNetworkTime";

function offsetDate(
  baseDate: string,
  days: number
): string {
  const date = new Date(`${baseDate}T12:00:00.000Z`);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function getDemoTimelineForDevice(
  device: DemoDevice
): DemoTimelineEvent[] {
  const purchase = device.purchase_date;
  const id = device.id;
  const networkProfile = getDemoDeviceNetworkProfile(id);

  const baseEvents: DemoTimelineEvent[] = [
    {
      id: `${id}-evt-purchase`,
      device_id: id,
      event_type: "Purchase",
      title: "Purchased",
      description: `${device.device_name} purchased and added to the Morgan Household vault.`,
      event_date: offsetDate(purchase, 0),
    },
    {
      id: `${id}-evt-receipt`,
      device_id: id,
      event_type: "Receipt",
      title: "Receipt uploaded",
      description: "Purchase receipt attached to the device record.",
      event_date: offsetDate(purchase, 1),
    },
    {
      id: `${id}-evt-warranty`,
      device_id: id,
      event_type: "Warranty",
      title: "Warranty added",
      description: device.warranty_date
        ? "Warranty coverage documented with expiration date."
        : "Warranty details pending — add coverage information.",
      event_date: offsetDate(purchase, 7),
    },
    {
      id: `${id}-evt-photos`,
      device_id: id,
      event_type: "Photos",
      title: "Photos added",
      description: "Product photos uploaded for easy identification.",
      event_date: offsetDate(purchase, 14),
    },
    {
      id: `${id}-evt-maintenance`,
      device_id: id,
      event_type: "Maintenance",
      title: "Maintenance recorded",
      description: "Routine care or setup completed and logged.",
      event_date: offsetDate(purchase, 90),
    },
    {
      id: `${id}-evt-software`,
      device_id: id,
      event_type: "Software Update",
      title: "Software updated",
      description: "Latest firmware or software update installed.",
      event_date: offsetDate(purchase, 180),
    },
  ];

  if (!networkProfile) {
    return baseEvents;
  }

  const networkEvents: DemoTimelineEvent[] = [
    {
      id: `${id}-evt-network-discovered`,
      device_id: id,
      event_type: "device_discovered",
      title: "First detected on the home network",
      description: `${device.device_name} was observed during a connector scan.`,
      event_date: demoTimestampDaysAgo(networkProfile.firstSeenDaysAgo),
    },
    {
      id: `${id}-evt-network-matched`,
      device_id: id,
      event_type: "device_matched",
      title: "Matched to this vault device",
      description:
        "Connector discovery results were linked to this vault record.",
      event_date: demoTimestampDaysAgo(
        Math.max(networkProfile.firstSeenDaysAgo - 1, 1)
      ),
    },
  ];

  if (id === "demo-canon-printer") {
    networkEvents.push({
      id: `${id}-evt-not-recent`,
      device_id: id,
      event_type: "device_not_recently_detected",
      title: "Not recently detected",
      description: `Last seen ${formatDemoRelativeTime(
        demoTimestampMinutesAgo(networkProfile.lastSeenMinutesAgo)
      )}.`,
      event_date: demoTimestampMinutesAgo(networkProfile.lastSeenMinutesAgo),
    });
  }

  if (id === "demo-macbook") {
    networkEvents.push({
      id: `${id}-evt-ip-changed`,
      device_id: id,
      event_type: "ip_changed",
      title: "IP address changed",
      description: "192.168.1.18 → 192.168.1.14",
      event_date: demoTimestampDaysAgo(12),
    });
  }

  return [...baseEvents, ...networkEvents].sort(
    (left, right) =>
      new Date(right.event_date).getTime() -
      new Date(left.event_date).getTime()
  );
}

export const morganTimelineEvents: DemoTimelineEvent[] = [];
