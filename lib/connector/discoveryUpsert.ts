import "server-only";

import {
  identifyDeviceWithAi,
  mergeAiDeviceSuggestion,
} from "@/lib/ai/deviceIdentification";
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
import { findExistingDiscoveredDeviceForUpsert } from "@/lib/connector/discoveryLookup";

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

const DISCOVERED_DEVICE_PRESERVE_SELECT =
  "id, connector_id, local_fingerprint, first_seen_at, imported_device_id, ignored_at, discovery_sources, mdns_services, manufacturer, model, friendly_name, device_type, likely_category, identification_display_name, recognition_status, recognition_accepted_name, recognition_accepted_manufacturer, recognition_accepted_model, recognition_accepted_category, recognition_accepted_device_type_key";

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

  const {
    data: connectorRow,
    error: connectorError,
  } = await admin
    .from("connector_installations")
    .select("created_by_user_id")
    .eq("id", connectorId)
    .eq("household_id", householdId)
    .maybeSingle();

  if (connectorError) {
    throw connectorError;
  }

  const actorUserId =
    connectorRow?.created_by_user_id ??
    null;

  let upserted = 0;
  let enriched = 0;

  let skippedArtifacts = 0;

  for (const device of devices) {
    if (!shouldPersistDiscoveredDevice(device)) {
      skippedArtifacts += 1;
      continue;
    }

    const existingRow = await findExistingDiscoveredDeviceForUpsert({
      admin,
      connectorId,
      householdId,
      device,
      selectClause: DISCOVERED_DEVICE_PRESERVE_SELECT,
    });

    const preservedFirstSeenAt =
      existingRow?.first_seen_at ??
      device.firstSeenAt;
    const preservedImportedDeviceId =
      existingRow?.imported_device_id ??
      null;
    const preservedLocalFingerprint =
      existingRow?.local_fingerprint ??
      device.localFingerprint;
    const mergedSources =
      mergeDiscoverySources(
        existingRow?.discovery_sources,
        device.discoverySources
      );
    const mergedMdnsServices = mergeStringArrays(
      existingRow?.mdns_services,
      device.mdnsServices
    );
    const deterministicIdentification =
      buildIdentificationForParsedDevice(
        device
      );

    const recognitionStatus =
      resolveRecognitionStatus(
        existingRow
          ?.recognition_status
      );

    const aiIdentification =
      await identifyDeviceWithAi({
        admin,
        householdId,
        connectorId,
        actorUserId,
        device,
        deterministic:
          deterministicIdentification,
        recognitionStatus,
        importedDeviceId:
          preservedImportedDeviceId,
      });

    const identification =
      mergeAiDeviceSuggestion(
        deterministicIdentification,
        aiIdentification
      );

    const manufacturer =
      recognitionStatus === "accepted"
        ? existingRow
            ?.recognition_accepted_manufacturer ??
          existingRow?.manufacturer ??
          device.manufacturer ??
          identification.likelyBrand
        : device.manufacturer ??
          identification.likelyBrand;

    const model =
      recognitionStatus === "accepted"
        ? existingRow
            ?.recognition_accepted_model ??
          existingRow?.model ??
          device.model ??
          identification.model
        : device.model ??
          identification.model;

    const friendlyName =
      recognitionStatus === "accepted"
        ? existingRow
            ?.recognition_accepted_name ??
          existingRow?.friendly_name ??
          device.friendlyName ??
          identification.friendlyName
        : device.friendlyName ??
          identification.friendlyName;

    const likelyCategory =
      recognitionStatus === "accepted"
        ? existingRow
            ?.recognition_accepted_category ??
          existingRow
            ?.likely_category ??
          identification.likelyCategory
        : identification.likelyCategory;

    const deviceType =
      recognitionStatus === "accepted"
        ? existingRow
            ?.recognition_accepted_device_type_key ??
          iconKeyForCategory(
            likelyCategory
          ) ??
          existingRow?.device_type ??
          device.deviceType ??
          likelyCategory
        : device.deviceType ??
          iconKeyForCategory(
            likelyCategory
          ) ??
          likelyCategory;

    const identificationDisplayName =
      recognitionStatus === "accepted"
        ? existingRow
            ?.recognition_accepted_name ??
          existingRow
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
            preservedLocalFingerprint,
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
      !existingRow?.ignored_at
    ) {
      const { error: vaultUpdateError } = await admin
  .from("devices")
  .update({
    online: device.online,
    last_seen_at: device.lastSeenAt,
    network_updated_at: scannedAt,
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
