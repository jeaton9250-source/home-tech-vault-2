import { requireIosHouseholdContext } from "@/lib/ios-api/auth";
import {
  IosApiError,
  iosErrorResponse,
  iosInternalError,
  iosJson,
} from "@/lib/ios-api/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ImportBody = {
  household_id?: string;
  device?: {
    device_name?: string;
    brand?: string | null;
    manufacturer?: string | null;
    model_number?: string | null;
    category?: string | null;
    location?: string | null;
    ip_address?: string | null;
    mac_address?: string | null;
    discovery_source?: string | null;
    notes?: string | null;
  };
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as ImportBody;
    const access = await requireIosHouseholdContext(request, body.household_id, {
      requirePaid: true,
      requireMutator: true,
    });

    const { data: discovered, error: discoveredError } = await access.admin
      .from("discovered_devices")
      .select("id, household_id, imported_device_id, friendly_name, hostname, manufacturer, model, device_type, ip_address, mac_address, discovery_sources, connector_id, local_fingerprint")
      .eq("id", id)
      .eq("household_id", access.householdId)
      .maybeSingle();

    if (discoveredError) {
      throw discoveredError;
    }

    if (!discovered) {
      throw new IosApiError(
        "DISCOVERED_DEVICE_NOT_FOUND",
        "Discovered device not found.",
        404
      );
    }

    if (discovered.imported_device_id) {
      throw new IosApiError(
        "DEVICE_ALREADY_IMPORTED",
        "This discovered device has already been imported.",
        409,
        { device_id: discovered.imported_device_id }
      );
    }

    const deviceName = body.device?.device_name?.trim() || discovered.friendly_name || discovered.hostname;
    if (!deviceName) {
      throw new IosApiError("VALIDATION_FAILED", "device.device_name is required.", 422);
    }

    const nowIso = new Date().toISOString();
    const { data: inserted, error: insertError } = await access.admin
      .from("devices")
      .insert({
        household_id: access.householdId,
        user_id: access.userId,
        device_name: deviceName,
        brand: body.device?.brand ?? discovered.manufacturer ?? null,
        manufacturer: body.device?.manufacturer ?? discovered.manufacturer ?? null,
        model_number: body.device?.model_number ?? discovered.model ?? null,
        category: body.device?.category ?? discovered.device_type ?? null,
        location: body.device?.location ?? null,
        ip_address: body.device?.ip_address ?? discovered.ip_address ?? null,
        mac_address: body.device?.mac_address ?? discovered.mac_address ?? null,
        discovery_source: body.device?.discovery_source ?? "smart_connector",
        notes: body.device?.notes ?? null,
        hostname: discovered.hostname ?? null,
        connector_id: discovered.connector_id ?? null,
        network_fingerprint: discovered.local_fingerprint ?? null,
        online: true,
        first_seen_at: nowIso,
        last_seen_at: nowIso,
        network_updated_at: nowIso,
      })
      .select("id, device_name, household_id")
      .single();

    if (insertError) {
      throw insertError;
    }

    const { error: linkError } = await access.admin
      .from("discovered_devices")
      .update({
        imported_device_id: inserted.id,
        match_confirmed_at: nowIso,
        match_confirmed_by: access.userId,
        updated_at: nowIso,
      })
      .eq("id", id)
      .eq("household_id", access.householdId)
      .is("imported_device_id", null);

    if (linkError) {
      throw linkError;
    }

    return iosJson(
      {
        device: {
          id: inserted.id,
          device_name: inserted.device_name,
          household_id: inserted.household_id,
        },
        discovered_device: {
          id,
          imported_device_id: inserted.id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return iosErrorResponse(error) ?? iosInternalError("import discovered device", error);
  }
}
