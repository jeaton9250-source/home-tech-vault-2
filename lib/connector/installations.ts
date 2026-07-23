import type {
  ConnectorInstallationRow,
  ConnectorInstallationSummary,
} from "@/lib/connector/types";

export function toConnectorInstallationSummary(
  row: ConnectorInstallationRow
): ConnectorInstallationSummary {
  return {
    id: row.id,
    householdId: row.household_id,
    name: row.name,
    platform: row.platform,
    appVersion: row.app_version,
    status: row.status,
    lastSeenAt: row.last_seen_at,
    lastScanAt: row.last_scan_at,
    revokedAt: row.revoked_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const CONNECTOR_INSTALLATION_COLUMNS =
  "id, household_id, created_by_user_id, name, platform, app_version, status, last_seen_at, last_scan_at, revoked_at, created_at, updated_at";
