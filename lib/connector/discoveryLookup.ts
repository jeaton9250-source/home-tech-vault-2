import "server-only";

import { pickExistingDiscoveredCandidate } from "@/lib/connector/discoveryIdentity";
import type { ParsedDiscoveryDevice } from "@/lib/connector/discoveryValidation";
import type { SupabaseClient } from "@supabase/supabase-js";

type LookupRow = {
  id: string;
  connector_id: string;
  local_fingerprint: string;
  first_seen_at?: string | null;
  discovery_sources?: string[] | null;
  mdns_services?: string[] | null;
  ignored_at?: string | null;
  hostname: string | null;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  mac_address: string | null;
  imported_device_id: string | null;
  likely_category?: string | null;
  device_type?: string | null;
  friendly_name?: string | null;
  identification_display_name?: string | null;
  recognition_status?: string | null;
  recognition_reviewed_at?: string | null;
  recognition_accepted_name?: string | null;
  recognition_accepted_manufacturer?: string | null;
  recognition_accepted_model?: string | null;
  recognition_accepted_category?: string | null;
  recognition_accepted_device_type_key?: string | null;
  match_confirmed_at?: string | null;
  last_seen_at?: string | null;
};

function uniqueById(rows: LookupRow[]): LookupRow[] {
  const byId = new Map<string, LookupRow>();

  for (const row of rows) {
    if (!byId.has(row.id)) {
      byId.set(row.id, row);
    }
  }

  return [...byId.values()];
}

export async function findExistingDiscoveredDeviceForUpsert(input: {
  admin: SupabaseClient;
  connectorId: string;
  householdId: string;
  device: ParsedDiscoveryDevice;
  selectClause: string;
}): Promise<LookupRow | null> {
  const { admin, connectorId, householdId, device, selectClause } = input;

  const direct = await admin
    .from("discovered_devices")
    .select(selectClause)
    .eq("connector_id", connectorId)
    .eq("household_id", householdId)
    .eq("local_fingerprint", device.localFingerprint)
    .maybeSingle();

  if (direct.error) {
    throw direct.error;
  }

  if (direct.data) {
    return direct.data as unknown as LookupRow;
  }

  const candidates: LookupRow[] = [];

  if (device.macAddress) {
    const macResult = await admin
      .from("discovered_devices")
      .select(selectClause)
      .eq("connector_id", connectorId)
      .eq("household_id", householdId)
      .eq("mac_address", device.macAddress)
      .limit(20);

    if (macResult.error) {
      throw macResult.error;
    }

    candidates.push(...((macResult.data ?? []) as unknown as LookupRow[]));
  }

  if (device.serialNumber) {
    const serialResult = await admin
      .from("discovered_devices")
      .select(selectClause)
      .eq("connector_id", connectorId)
      .eq("household_id", householdId)
      .eq("serial_number", device.serialNumber)
      .limit(20);

    if (serialResult.error) {
      throw serialResult.error;
    }

    candidates.push(...((serialResult.data ?? []) as unknown as LookupRow[]));
  }

  if (device.hostname && device.manufacturer) {
    const hostManufacturerResult = await admin
      .from("discovered_devices")
      .select(selectClause)
      .eq("connector_id", connectorId)
      .eq("household_id", householdId)
      .ilike("hostname", device.hostname)
      .ilike("manufacturer", device.manufacturer)
      .limit(20);

    if (hostManufacturerResult.error) {
      throw hostManufacturerResult.error;
    }

    candidates.push(...((hostManufacturerResult.data ?? []) as unknown as LookupRow[]));
  }

  if (device.hostname && device.manufacturer && device.model) {
    const hostManufacturerModelResult = await admin
      .from("discovered_devices")
      .select(selectClause)
      .eq("connector_id", connectorId)
      .eq("household_id", householdId)
      .ilike("hostname", device.hostname)
      .ilike("manufacturer", device.manufacturer)
      .ilike("model", device.model)
      .limit(20);

    if (hostManufacturerModelResult.error) {
      throw hostManufacturerModelResult.error;
    }

    candidates.push(...((hostManufacturerModelResult.data ?? []) as unknown as LookupRow[]));
  }

  const resolved = pickExistingDiscoveredCandidate({
    incoming: {
      connectorId,
      localFingerprint: device.localFingerprint,
      hostname: device.hostname,
      manufacturer: device.manufacturer,
      model: device.model,
      serialNumber: device.serialNumber,
      macAddress: device.macAddress,
      importedDeviceId: null,
    },
    candidates: uniqueById(candidates),
  });

  return resolved;
}
