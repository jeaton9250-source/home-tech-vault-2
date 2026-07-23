import { CONNECTOR_HEARTBEAT_MIN_INTERVAL_MS } from "@/lib/connector/constants";

const lastHeartbeatByConnector = new Map<
  string,
  number
>();

export function checkConnectorHeartbeatRateLimit(
  connectorId: string
): boolean {
  const now = Date.now();
  const lastSeen =
    lastHeartbeatByConnector.get(
      connectorId
    ) ?? 0;

  if (
    now - lastSeen <
    CONNECTOR_HEARTBEAT_MIN_INTERVAL_MS
  ) {
    return false;
  }

  lastHeartbeatByConnector.set(
    connectorId,
    now
  );

  return true;
}

export function resetConnectorHeartbeatRateLimitForTests() {
  lastHeartbeatByConnector.clear();
}
