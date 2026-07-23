import type { ConnectorInstallationStatus } from "@/lib/connector/types";

export const CONNECTOR_ONLINE_THRESHOLD_MS =
  10 * 60 * 1000;

export const CONNECTOR_OFFLINE_THRESHOLD_MS =
  60 * 60 * 1000;

export type ConnectorPresence =
  | "online"
  | "recently_seen"
  | "offline"
  | "revoked"
  | "pending";

export function deriveConnectorPresence(
  status: ConnectorInstallationStatus,
  lastSeenAt: string | null,
  now = Date.now()
): ConnectorPresence {
  if (status === "revoked") {
    return "revoked";
  }

  if (status === "pending") {
    return "pending";
  }

  if (!lastSeenAt) {
    return "offline";
  }

  const lastSeenMs = new Date(
    lastSeenAt
  ).getTime();

  if (!Number.isFinite(lastSeenMs)) {
    return "offline";
  }

  const elapsed = now - lastSeenMs;

  if (elapsed < 0) {
    return "offline";
  }

  if (elapsed <= CONNECTOR_ONLINE_THRESHOLD_MS) {
    return "online";
  }

  if (elapsed <= CONNECTOR_OFFLINE_THRESHOLD_MS) {
    return "recently_seen";
  }

  return "offline";
}

export function connectorPresenceLabel(
  presence: ConnectorPresence
): string {
  switch (presence) {
    case "online":
      return "Online";
    case "recently_seen":
      return "Recently seen";
    case "offline":
      return "Offline";
    case "revoked":
      return "Revoked";
    case "pending":
      return "Pending";
  }
}

export function connectorPresenceDescription(
  presence: ConnectorPresence
): string {
  switch (presence) {
    case "online":
      return "Heartbeat received within the last 10 minutes.";
    case "recently_seen":
      return "Heartbeat received within the last hour.";
    case "offline":
      return "No recent heartbeat from this connector.";
    case "revoked":
      return "Access was revoked for this connector.";
    case "pending":
      return "Waiting for the connector to complete pairing.";
  }
}
