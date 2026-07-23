import "server-only";

import {
  buildIdentificationForParsedDevice,
  identificationFieldsFromResult,
} from "@/lib/connector/discoveryIdentification";
import {
  mergeDiscoverySources,
  mergeStringArrays,
} from "@/lib/connector/network";

import type {
  DiscoverySyncResponse,
} from "@/lib/connector/discoveryTypes";
import type { ParsedDiscoveryDevice } from "@/lib/connector/discoveryValidation";
import type { SupabaseClient } from "@supabase/supabase-js";

type UpsertDiscoveredDevicesInput = {
  admin: SupabaseClient;
  connectorId: string;
  householdId: string;
  scannedAt: string;
  devices: ParsedDiscoveryDevice[];
};

/**
 * Phase 2B.1 — upsert discovered device observations.
 * When a discovery row is already linked to a vault device, also refresh that
 * device's online / last_seen_at fields so Devices cards stay current even
 * when runMatching is false.
 */
export async function upsertDiscoveredDevices(
  input: UpsertDiscoveredDevicesInput
): Promise<DiscoverySyncResponse> {
  const {
    admin,
    connectorId,
    householdId,
    scannedAt,
    devices,
  } = input;

  let upserted = 0;
  let enriched = 0;

  for (const device of devices) {
    const existingResult = await admin
      .from("discovered_devices")
      .select(
        "id, imported_device_id, ignored_at, first_seen_at, discovery_sources, mdns_services"
      )
      .eq("connector_id", connectorId)
      .eq(
        "local_fingerprint",
        device.localFingerprint
      )
      .maybeSingle();

    if (existingResult.error) {
      throw existingResult.error;
    }

    const preservedFirstSeenAt =
      existingResult.data?.first_seen_at ??
      device.firstSeenAt;
    const preservedImportedDeviceId =
      existingResult.data?.imported_device_id ??
      null;
    const mergedSources =
      mergeDiscoverySources(
        existingResult.data?.discovery_sources,
        device.discoverySources
      );
    const mergedMdnsServices = mergeStringArrays(
      existingResult.data?.mdns_services,
      device.mdnsServices
    );
    const identification =
      buildIdentificationForParsedDevice(device);

    const { error: upsertError } = await admin
      .from("discovered_devices")
      .upsert(
        {
          household_id: householdId,
          connector_id: connectorId,
          local_fingerprint:
            device.localFingerprint,
          hostname: device.hostname,
          manufacturer: device.manufacturer,
          model: device.model ?? identification.model,
          ip_address: device.ipAddress,
          mac_address: device.macAddress,
          device_type:
            device.deviceType ??
            identification.likelyCategory,
          friendly_name:
            device.friendlyName ??
            identification.friendlyName,
          mdns_services: mergedMdnsServices,
          ssdp_device_type: device.ssdpDeviceType,
          ssdp_description_url: device.ssdpDescriptionUrl,
          ...identificationFieldsFromResult(
            identification
          ),
          online: device.online,
          discovery_sources: mergedSources,
          first_seen_at: preservedFirstSeenAt,
          last_seen_at: device.lastSeenAt,
          updated_at: scannedAt,
          imported_device_id:
            preservedImportedDeviceId,
        },
        {
          onConflict:
            "connector_id,local_fingerprint",
        }
      );

    if (upsertError) {
      throw upsertError;
    }

    upserted += 1;

    if (
      preservedImportedDeviceId &&
      !existingResult.data?.ignored_at
    ) {
      const { error: vaultUpdateError } = await admin
        .from("devices")
        .update({
          online: device.online,
          last_seen_at: device.lastSeenAt,
          network_updated_at: scannedAt,
          updated_at: scannedAt,
        })
        .eq("id", preservedImportedDeviceId)
        .eq("household_id", householdId);

      if (vaultUpdateError) {
        throw vaultUpdateError;
      }

      enriched += 1;
    }
  }

  const { error: connectorUpdateError } =
    await admin
      .from("connector_installations")
      .update({
        last_scan_at: scannedAt,
        updated_at: scannedAt,
      })
      .eq("id", connectorId)
      .eq("household_id", householdId);

  if (connectorUpdateError) {
    throw connectorUpdateError;
  }

  return {
    ok: true,
    connectorId,
    householdId,
    scannedAt,
    received: devices.length,
    upserted,
    autoMatched: 0,
    enriched,
    possibleMatches: 0,
    ignored: 0,
    newDevices: devices.length,
  };
}
