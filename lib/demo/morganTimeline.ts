import type { DemoTimelineEvent } from "@/lib/demo/types";
import type { DemoDevice } from "@/lib/demo/types";

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

  return [
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
}

export const morganTimelineEvents: DemoTimelineEvent[] = [];
