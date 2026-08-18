import { createDeviceEvent } from "@/lib/deviceEvents";

import type {
  RecordActivityInput,
  VaultActivityType,
} from "@/lib/activity/types";

import { getActivityTypeLabel } from "@/lib/activity/icons";

const DEVICE_EVENT_TYPES = new Set<VaultActivityType>([
  "device.added",
  "device.edited",
  "document.uploaded",
  "receipt.uploaded",
  "warranty.added",
  "maintenance.scheduled",
  "maintenance.completed",
  "photo.uploaded",
]);

function mapActivityToDeviceEventType(
  activityType: VaultActivityType
): string {
  switch (activityType) {
    case "device.added":
      return "Added";

    case "device.edited":
      return "Update";

    case "device.deleted":
      return "Deleted";

    case "document.uploaded":
    case "receipt.uploaded":
      return "Document";

    case "warranty.added":
    case "warranty.expiring":
      return "Warranty";

    case "maintenance.scheduled":
    case "maintenance.completed":
      return "Maintenance";

    case "photo.uploaded":
      return "Photo";

    default:
      return getActivityTypeLabel(
        activityType
      );
  }
}

/**
 * Persist device-scoped activity to `device_events` when a device id is present.
 * Household-only events are not stored until a dedicated activity table exists.
 */
export async function recordActivity(
  input: RecordActivityInput
): Promise<void> {
  if (
    !input.deviceId ||
    !DEVICE_EVENT_TYPES.has(
      input.activityType
    )
  ) {
    return;
  }

  await createDeviceEvent({
    deviceId: input.deviceId,
    userId: input.userId,
    eventType: mapActivityToDeviceEventType(
      input.activityType
    ),
    title: input.title,
    description: input.description,
    eventDate:
      input.occurredAt ||
      new Date().toISOString(),
  });
}
