import { loadDiscoveryReviewRows } from "@/lib/connector/discoverySync";
import { requireIosHouseholdContext } from "@/lib/ios-api/auth";
import {
  iosErrorResponse,
  iosInternalError,
  iosJson,
} from "@/lib/ios-api/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUS = new Set([
  "all",
  "online",
  "offline",
  "new",
  "imported",
  "not_imported",
]);
const VALID_SORT = new Set([
  "name",
  "device_type",
  "last_seen",
  "first_seen",
  "status",
]);

function offsetFromCursor(cursor: string | null) {
  if (!cursor) {
    return 0;
  }

  const parsed = Number.parseInt(
    Buffer.from(cursor, "base64url").toString("utf8"),
    10
  );
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function cursorFromOffset(offset: number) {
  return Buffer.from(String(offset), "utf8").toString("base64url");
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const context = await requireIosHouseholdContext(
      request,
      url.searchParams.get("household_id"),
      { requirePaid: true }
    );

    const status = url.searchParams.get("status") ?? "all";
    const sort = url.searchParams.get("sort") ?? "last_seen";
    const search =
      url.searchParams.get("search")?.trim().toLowerCase() ?? "";
    const connectorId =
      url.searchParams.get("connector_id")?.trim() ?? null;
    const limit = Math.min(
      Math.max(Number(url.searchParams.get("limit") ?? 50), 1),
      100
    );
    const offset = offsetFromCursor(url.searchParams.get("cursor"));

    if (!VALID_STATUS.has(status) || !VALID_SORT.has(sort)) {
      return iosJson({
        devices: [],
        next_cursor: null,
        access: {
          can_view: true,
          can_import: context.access.can_import_devices,
        },
      });
    }

    let rows = await loadDiscoveryReviewRows(
      context.admin,
      context.householdId
    );

    if (connectorId) {
      rows = rows.filter((row) => row.connectorId === connectorId);
    }

    rows = rows.filter((row) => {
      if (status === "online") return row.online;
      if (status === "offline") return !row.online;
      if (status === "new") {
        return !row.importedDeviceId && row.matchStatus === "new";
      }
      if (status === "imported") return Boolean(row.importedDeviceId);
      if (status === "not_imported") return !row.importedDeviceId;
      return true;
    });

    if (search) {
      rows = rows.filter((row) =>
        [
          row.friendlyName,
          row.hostname,
          row.manufacturer,
          row.model,
          row.deviceType,
          row.likelyCategory,
          row.likelyBrand,
          row.ipAddress,
          row.macAddress,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search))
      );
    }

    rows = rows.sort((left, right) => {
      if (sort === "name") {
        return (left.friendlyName ?? left.hostname ?? "").localeCompare(
          right.friendlyName ?? right.hostname ?? ""
        );
      }
      if (sort === "device_type") {
        return (left.deviceType ?? left.likelyCategory ?? "").localeCompare(
          right.deviceType ?? right.likelyCategory ?? ""
        );
      }
      if (sort === "first_seen") {
        return Date.parse(right.firstSeenAt) - Date.parse(left.firstSeenAt);
      }
      if (sort === "status") {
        return Number(right.online) - Number(left.online);
      }
      return Date.parse(right.lastSeenAt) - Date.parse(left.lastSeenAt);
    });

    const page = rows.slice(offset, offset + limit);
    const connectorIds = [...new Set(page.map((row) => row.connectorId))];
    const connectorNames = new Map<string, string>();

    if (connectorIds.length > 0) {
      const { data: connectors, error } = await context.admin
        .from("connector_installations")
        .select("id, name")
        .eq("household_id", context.householdId)
        .in("id", connectorIds);

      if (error) {
        throw error;
      }

      for (const connector of connectors ?? []) {
        connectorNames.set(String(connector.id), String(connector.name));
      }
    }

    return iosJson({
      devices: page.map((row) => ({
        id: row.id,
        household_id: context.householdId,
        connector_installation_id: row.connectorId,
        stable_discovery_key: row.localFingerprint,
        name:
          row.friendlyName ??
          row.identificationDisplayName ??
          row.hostname,
        hostname: row.hostname,
        manufacturer: row.manufacturer ?? row.likelyBrand,
        model: row.model,
        category: row.deviceType ?? row.likelyCategory,
        ip_address: row.ipAddress,
        mac_address: row.macAddress,
        discovery_source: row.discoverySources[0] ?? null,
        first_seen_at: row.firstSeenAt,
        last_seen_at: row.lastSeenAt,
        online: row.online,
        is_new: !row.importedDeviceId,
        imported_device_id: row.importedDeviceId,
        source_connector: {
          id: row.connectorId,
          name: connectorNames.get(row.connectorId) ?? "Smart Connector",
        },
      })),
      next_cursor:
        offset + limit < rows.length ? cursorFromOffset(offset + limit) : null,
      access: {
        can_view: context.access.can_view,
        can_import: context.access.can_import_devices,
      },
    });
  } catch (error) {
    return (
      iosErrorResponse(error) ??
      iosInternalError("list discovered devices", error)
    );
  }
}
