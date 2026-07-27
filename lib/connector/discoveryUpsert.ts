import "server-only";

import {
  buildIdentificationForParsedDevice,
  identificationFieldsFromResult,
  shouldPersistDiscoveredDevice,
} from "@/lib/connector/discoveryIdentification";
import {
  mergeDiscoverySources,
  mergeStringArrays,
} from "@/lib/connector/network";
import { iconKeyForCategory } from "@/lib/connector/recognitionSuggestion";

import type {
  DiscoverySyncResponse,
  RecognitionStatus,
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

function resolveRecognitionStatus(
  value: string | null | undefined
): RecognitionStatus {
  if (value === "accepted" || value === "dismissed") {
    return value;
  }

  return "pending";
}

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

  let skippedArtifacts = 0;

  for (const device of devices) {
    if (!shouldPersistDiscoveredDevice(device)) {
      skippedArtifacts += 1;
      continue;
    }

    const existingResult = await admin
      .from("discovered_devices")
      .select(
        "id, imported_device_id, ignored_at, first_seen_at, discovery_sources, mdns_services, manufacturer, model, friendly_name, device_type, likely_category, identification_display_name, recognition_status, recognition_accepted_name, recognition_accepted_manufacturer, recognition_accepted_model, recognition_accepted_category, recognition_accepted_device_type_key"
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

    const recognitionStatus =
      resolveRecognitionStatus(
        existingResult.data
          ?.recognition_status
      );

    const manufacturer =
      recognitionStatus === "accepted"
        ? existingResult.data
            ?.recognition_accepted_manufacturer ??
          existingResult.data?.manufacturer ??
          device.manufacturer
        : device.manufacturer;
    const model =
      recognitionStatus === "accepted"
        ? existingResult.data
            ?.recognition_accepted_model ??
          existingResult.data?.model ??
          device.model ??
          identification.model
        : device.model ??
          identification.model;
    const friendlyName =
      recognitionStatus === "accepted"
        ? existingResult.data
            ?.recognition_accepted_name ??
          existingResult.data?.friendly_name ??
          device.friendlyName ??
          identification.friendlyName
        : device.friendlyName ??
          identification.friendlyName;
    const likelyCategory =
      recognitionStatus === "accepted"
        ? existingResult.data
            ?.recognition_accepted_category ??
          existingResult.data
            ?.likely_category ??
          identification.likelyCategory
        : identification.likelyCategory;
    const deviceType =
      recognitionStatus === "accepted"
        ? existingResult.data
            ?.recognition_accepted_device_type_key ??
          iconKeyForCategory(
            likelyCategory
          ) ??
          existingResult.data?.device_type ??
          device.deviceType ??
          likelyCategory
        : device.deviceType ??
          likelyCategory;
    const identificationDisplayName =
      recognitionStatus === "accepted"
        ? existingResult.data
            ?.recognition_accepted_name ??
          existingResult.data
            ?.identification_display_name ??
          identification.displayName
        : identification.displayName;

    const { error: upsertError } = await admin
      .from("discovered_devices")
      .upsert(
        {
          household_id: householdId,
          connector_id: connectorId,
          local_fingerprint:
            device.localFingerprint,
          hostname: device.hostname,
          manufacturer,
          model,
          ip_address: device.ipAddress,
          mac_address: device.macAddress,
          device_type: deviceType,
          friendly_name: friendlyName,
          mdns_services: mergedMdnsServices,
          ssdp_device_type: device.ssdpDeviceType,
          ssdp_description_url: device.ssdpDescriptionUrl,
          ...identificationFieldsFromResult(
            identification
          ),
          likely_category: likelyCategory,
          identification_display_name:
            identificationDisplayName,
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
    ignored: skippedArtifacts,
    newDevices: devices.length - skippedArtifacts,
  };
}
