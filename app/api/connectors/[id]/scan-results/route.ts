import {
  DiscoveryValidationError,
  parseDiscoverySyncPayload,
  type DiscoverySyncRequestBody,
} from "@/lib/connector/discoveryValidation";
import { syncDiscoveredDevicesWithMatching } from "@/lib/connector/discoverySync";
import {
  connectorSessionResponse,
  requireConnectorSession,
} from "@/lib/connector/requireConnectorSession";
import { createAdminClient } from "@/lib/supabase/admin";
import { createTrustedHouseholdNotification } from "@/lib/notifications/events";
import {
  iosError,
  iosInternalError,
  iosJson,
} from "@/lib/ios-api/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IosScanResultsBody = {
  scan_id?: string;
  completed_at?: string;
  devices?: Array<{
    stable_discovery_key?: string;
    name?: string | null;
    hostname?: string | null;
    manufacturer?: string | null;
    model?: string | null;
    category?: string | null;
    ip_address?: string | null;
    mac_address?: string | null;
    discovery_source?: string | null;
    online?: boolean;
    first_seen_at?: string | null;
    last_seen_at?: string | null;
  }>;
};

function toDiscoveryPayload(
  body: IosScanResultsBody
): DiscoverySyncRequestBody {
  return {
    scannedAt: body.completed_at,
    runMatching: true,
    devices: (body.devices ?? []).map((device) => ({
      localFingerprint: device.stable_discovery_key,
      friendlyName: device.name ?? undefined,
      hostname: device.hostname ?? undefined,
      manufacturer: device.manufacturer ?? undefined,
      model: device.model ?? undefined,
      deviceType: device.category ?? undefined,
      ipAddress: device.ip_address ?? undefined,
      macAddress: device.mac_address ?? undefined,
      discoverySource: device.discovery_source ?? undefined,
      firstSeenAt: device.first_seen_at ?? undefined,
      lastSeenAt: device.last_seen_at ?? undefined,
      online: device.online,
    })),
  };
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await requireConnectorSession(request);

    if (session.connectorId !== id) {
      return iosError(
        "CONNECTOR_NOT_FOUND",
        "Connector not found.",
        404
      );
    }

    const body = (await request.json()) as IosScanResultsBody;
    const admin = createAdminClient();
    const fingerprints = (body.devices ?? [])
      .map((device) => device.stable_discovery_key?.trim())
      .filter((value): value is string => Boolean(value));
    const existingFingerprints = new Set<string>();

    if (fingerprints.length > 0) {
      const { data: existing, error } = await admin
        .from("discovered_devices")
        .select("local_fingerprint")
        .eq("connector_id", session.connectorId)
        .in("local_fingerprint", fingerprints);

      if (error) {
        throw error;
      }

      for (const row of existing ?? []) {
        existingFingerprints.add(String(row.local_fingerprint));
      }
    }

    const nowIso = new Date().toISOString();
    const payload = parseDiscoverySyncPayload(
      toDiscoveryPayload(body),
      nowIso
    );
    const result = await syncDiscoveredDevicesWithMatching({
      admin,
      connectorId: session.connectorId,
      householdId: session.householdId,
      scannedAt: payload.scannedAt,
      devices: payload.devices,
    });

    for (const device of payload.devices) {
      if (!existingFingerprints.has(device.localFingerprint)) {
        await createTrustedHouseholdNotification({
          admin,
          householdId: session.householdId,
          type: "new_device_discovered",
          title: "New Device Discovered",
          body: `${
            device.friendlyName ?? device.hostname ?? "A device"
          } was found on your network.`,
          entityType: "discovered_device",
          entityId: null,
          eventKey: `new_device_discovered:${session.connectorId}:${device.localFingerprint}`,
        });
      }
    }

    return iosJson({
      ok: true,
      scan: {
        scan_id: body.scan_id ?? result.scannedAt,
        processed: result.received,
        created: result.newDevices,
        updated: Math.max(result.upserted - result.newDevices, 0),
        online: payload.devices.filter((device) => device.online).length,
        offline: payload.devices.filter((device) => !device.online).length,
      },
    });
  } catch (error) {
    if (error instanceof DiscoveryValidationError) {
      return iosError("VALIDATION_FAILED", error.message, 422);
    }

    const sessionResponse = connectorSessionResponse(error);
    if (sessionResponse) {
      return iosError(
        "CONNECTOR_REVOKED",
        "Connector authorization is no longer valid.",
        410
      );
    }

    return iosInternalError("connector scan results", error);
  }
}
