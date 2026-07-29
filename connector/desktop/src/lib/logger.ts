type LogEvent =
  | "app_started"
  | "pairing_started"
  | "pairing_succeeded"
  | "heartbeat_succeeded"
  | "network_request_failed"
  | "token_missing"
  | "connector_revoked"
  | "discovery_scan_started"
  | "discovery_scan_completed"
  | "discovery_sync_succeeded"
  | "home_assistant_entity_sync_succeeded"
  | "home_assistant_command_succeeded"
  | "home_assistant_command_failed";

export function logConnectorEvent(
  event: LogEvent,
  detail?: Record<
    string,
    string | number | boolean | null
  >
) {
  if (detail) {
    console.info(`[htv-connector] ${event}`, detail);
    return;
  }

  console.info(`[htv-connector] ${event}`);
}
