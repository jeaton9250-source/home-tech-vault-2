import { deriveDeviceNetworkPresence } from "@/lib/devices/devicePresence";
import {
  getWarrantyStatus,
  type WarrantyStatus,
} from "@/lib/home-health/warranty";

export type AdminDeviceOnlineStatus =
  | "online"
  | "offline"
  | "unknown";

export type AdminDevicePresenceInput = {
  online?: boolean | null;
  lastSeenAt?: string | null;
  firstSeenAt?: string | null;
  networkUpdatedAt?: string | null;
};

export function getAdminDeviceOnlineStatus(
  input: AdminDevicePresenceInput
): AdminDeviceOnlineStatus {
  const hasObservation = Boolean(
    input.lastSeenAt?.trim() ||
      input.networkUpdatedAt?.trim() ||
      input.firstSeenAt?.trim()
  );

  if (!hasObservation) {
    return "unknown";
  }

  const state = deriveDeviceNetworkPresence({
    online: input.online,
    lastSeenAt: input.lastSeenAt,
    firstSeenAt: input.firstSeenAt,
    networkUpdatedAt: input.networkUpdatedAt,
  });

  if (state === "online") {
    return "online";
  }

  if (state === "unknown") {
    return "unknown";
  }

  return "offline";
}

export function getAdminDeviceOnlineLabel(
  status: AdminDeviceOnlineStatus
) {
  switch (status) {
    case "online":
      return "Online";
    case "offline":
      return "Offline";
    default:
      return "Unknown";
  }
}

export function getAdminWarrantyLabel(
  status: WarrantyStatus
) {
  switch (status) {
    case "active":
      return "Active";
    case "expiring":
      return "Expiring Soon";
    case "expired":
      return "Expired";
    default:
      return "Missing";
  }
}

export function getAdminWarrantyBadgeTone(
  status: WarrantyStatus
): "success" | "warning" | "danger" | "neutral" {
  switch (status) {
    case "active":
      return "success";
    case "expiring":
      return "warning";
    case "expired":
      return "danger";
    default:
      return "neutral";
  }
}

export function getAdminOnlineBadgeTone(
  status: AdminDeviceOnlineStatus
): "success" | "warning" | "neutral" {
  switch (status) {
    case "online":
      return "success";
    case "offline":
      return "warning";
    default:
      return "neutral";
  }
}

export {
  getWarrantyStatus,
  type WarrantyStatus,
};
