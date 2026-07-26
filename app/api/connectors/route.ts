import { requireIosHouseholdContext } from "@/lib/ios-api/auth";
import { mapConnectorStatus } from "@/lib/ios-api/connectors";
import { iosErrorResponse, iosInternalError, iosJson } from "@/lib/ios-api/errors";

import type { ConnectorInstallationRow } from "@/lib/connector/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONNECTOR_SELECT =
  "id, household_id, created_by_user_id, name, platform, app_version, status, token_hash, last_seen_at, last_scan_at, revoked_at, created_at, updated_at";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const context = await requireIosHouseholdContext(
      request,
      url.searchParams.get("household_id"),
      { requirePaid: true }
    );

    const { data, error } = await context.admin
      .from("connector_installations")
      .select(CONNECTOR_SELECT)
      .eq("household_id", context.householdId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as ConnectorInstallationRow[];
    const connectorIds = rows.map((row) => row.id);
    const counts = new Map<string, { total: number; online: number; fresh: number }>();

    if (connectorIds.length > 0) {
      const { data: discovered, error: discoveredError } = await context.admin
        .from("discovered_devices")
        .select("connector_id, online, imported_device_id, created_at")
        .eq("household_id", context.householdId)
        .in("connector_id", connectorIds);

      if (discoveredError) {
        throw discoveredError;
      }

      for (const row of discovered ?? []) {
        const connectorId = String(row.connector_id);
        const current = counts.get(connectorId) ?? { total: 0, online: 0, fresh: 0 };
        current.total += 1;
        if (row.online === true) {
          current.online += 1;
        }
        if (!row.imported_device_id) {
          current.fresh += 1;
        }
        counts.set(connectorId, current);
      }
    }

    return iosJson({
      connectors: rows.map((row) => {
        const rowCounts = counts.get(row.id) ?? { total: 0, online: 0, fresh: 0 };

        return {
          id: row.id,
          household_id: row.household_id,
          name: row.name,
          platform: row.platform,
          app_version: row.app_version,
          status: mapConnectorStatus(row),
          paired_at: row.created_at,
          last_seen_at: row.last_seen_at,
          last_scan_at: row.last_scan_at,
          revoked_at: row.revoked_at,
          discovered_device_count: rowCounts.total,
          online_device_count: rowCounts.online,
          new_device_count: rowCounts.fresh,
          health_warnings: [],
        };
      }),
      access: context.access,
    });
  } catch (error) {
    return iosErrorResponse(error) ?? iosInternalError("list connectors", error);
  }
}
