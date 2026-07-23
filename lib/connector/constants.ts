export const CONNECTOR_MACOS_APP_VERSION = "0.1.0";
export const CONNECTOR_WINDOWS_APP_VERSION = "0.1.0";

export const CONNECTOR_SUPPORTED_PLATFORMS = [
  "macos",
  "windows",
] as const;

export type ConnectorPlatform =
  (typeof CONNECTOR_SUPPORTED_PLATFORMS)[number];

export const CONNECTOR_HEARTBEAT_MIN_INTERVAL_MS =
  30_000;

/** Desktop automatic heartbeat interval (Phase 2A). */
export const CONNECTOR_HEARTBEAT_INTERVAL_MS =
  5 * 60 * 1000;

export const CONNECTOR_FIELD_LIMITS = {
  appVersion: 32,
  deviceName: 120,
  connectorName: 120,
} as const;
