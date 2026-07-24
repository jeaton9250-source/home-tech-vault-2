import "server-only";

import {
  buildDeviceNetworkEnrichmentUpdate,
} from "@/lib/connector/deviceEnrichment";
import {
  recordDeviceMatchedNetworkEvent,
  recordVaultDeviceNetworkSyncEvents,
  type VaultDeviceNetworkSnapshot,
} from "@/lib/connector/deviceNetworkSync";
import {
  matchDiscoveredDevice,
  rowToDiscoveredForMatching,
  rowToVaultDeviceForMatching,
  shouldAutoLinkMatch,
} from "@/lib/connector/matching";
import {
  buildIdentificationForParsedDevice,
  identificationFieldsFromResult,
  shouldPersistDiscoveredDevice,
} from "@/lib/connector/discoveryIdentification";
import {
  identificationFromConfirmedVaultDevice,
  identifyDiscoveredDevice,
  type IdentificationResult,
} from "@/lib/connector/deviceIdentification";
import type { ParsedDiscoveryDevice } from "@/lib/connector/discoveryValidation";
import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  DeviceMatchResult,
  DiscoveredDeviceRow,
  DiscoveredDeviceSummary,
  DiscoverySyncResponse,
} from "@/lib/connector/discoveryTypes";
import {
  mergeDiscoverySources,
  mergeStringArrays,
} from "@/lib/connector/network";

type SyncDiscoveredDevicesInput = {
  admin: SupabaseClient;
  connectorId: string;
  householdId: string;
  scannedAt: string;
  devices: ParsedDiscoveryDevice[];
};

const VAULT_DEVICE_SELECT =
  "id, household_id, device_name, brand, manufacturer, model_number, serial_number, mac_address, network_fingerprint, category, ip_address, hostname, first_seen_at, discovery_source, online, last_seen_at, network_updated_at, connector_id";

/** Foundation schema only — safe before 2B.2 device enrichment migration. */
const VAULT_DEVICE_SELECT_FOUNDATION =
  "id, household_id, device_name, brand, manufacturer, model_number, serial_number, mac_address, category, ip_address, discovery_source, location, online";

/** Foundation schema only — safe before 2B.2 discovered_devices match columns. */
const DISCOVERED_DEVICE_SELECT_FOUNDATION =
  "id, household_id, connector_id, local_fingerprint, hostname, manufacturer, model, serial_number, ip_address, mac_address, device_type, friendly_name, mdns_services, ssdp_device_type, ssdp_description_url, likely_category, likely_brand, identification_confidence, identification_reasons, identification_display_name, online, discovery_sources, first_seen_at, last_seen_at, imported_device_id, match_confirmed_at, ignored_at, created_at, updated_at";

function toDiscoveryNetworkFields(
  device: ParsedDiscoveryDevice,
  connectorId: string
) {
  return {
    ipAddress: device.ipAddress,
    macAddress: device.macAddress,
    hostname: device.hostname,
    manufacturer: device.manufacturer,
    model: device.model,
    online: device.online,
    firstSeenAt: device.firstSeenAt,
    lastSeenAt: device.lastSeenAt,
    discoverySource: device.discoverySources[0] ?? "Connector Scan",
    connectorId,
    networkFingerprint:
      device.localFingerprint,
  };
}

async function loadVaultDeviceRows(
  admin: SupabaseClient,
  householdId: string
) {
  const { data, error } = await admin
    .from("devices")
    .select(VAULT_DEVICE_SELECT)
    .eq("household_id", householdId);

  if (error) {
    throw error;
  }

  return data ?? [];
}

function toNetworkSnapshot(row: {
  id: string;
  online?: boolean | null;
  last_seen_at?: string | null;
  first_seen_at?: string | null;
  ip_address?: string | null;
  hostname?: string | null;
  manufacturer?: string | null;
  network_updated_at?: string | null;
}): VaultDeviceNetworkSnapshot {
  return {
    id: row.id,
    online: row.online,
    last_seen_at: row.last_seen_at,
    first_seen_at: row.first_seen_at,
    ip_address:
      row.ip_address === null || row.ip_address === undefined
        ? null
        : String(row.ip_address),
    hostname: row.hostname,
    manufacturer: row.manufacturer,
    network_updated_at: row.network_updated_at,
  };
}

async function enrichVaultDevice(
  admin: SupabaseClient,
  deviceId: string,
  householdId: string,
  update: Record<string, unknown>
) {
  if (Object.keys(update).length === 0) {
    return;
  }

  const { error } = await admin
    .from("devices")
    .update({
      ...update,
      updated_at: new Date().toISOString(),
    })
    .eq("id", deviceId)
    .eq("household_id", householdId);

  if (error) {
    throw error;
  }
}

export async function syncDiscoveredDevicesWithMatching(
  input: SyncDiscoveredDevicesInput
): Promise<DiscoverySyncResponse> {
  const {
    admin,
    connectorId,
    householdId,
    scannedAt,
    devices,
  } = input;

  const vaultDeviceRows = await loadVaultDeviceRows(
    admin,
    householdId
  );
  const vaultDevices = vaultDeviceRows.map(
    rowToVaultDeviceForMatching
  );

  const { data: connectorRow, error: connectorError } =
    await admin
      .from("connector_installations")
      .select("created_by_user_id")
      .eq("id", connectorId)
      .eq("household_id", householdId)
      .maybeSingle();

  if (connectorError) {
    throw connectorError;
  }

  const actorUserId =
    connectorRow?.created_by_user_id ?? null;

  let upserted = 0;
  let autoMatched = 0;
  let enriched = 0;
  let possibleMatches = 0;
  let ignored = 0;
  let newDevices = 0;

  for (const device of devices) {
    if (!shouldPersistDiscoveredDevice(device)) {
      ignored += 1;
      continue;
    }

    const existingResult = await admin
      .from("discovered_devices")
      .select(
        "id, imported_device_id, ignored_at, first_seen_at, discovery_sources, mdns_services, match_confirmed_at"
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
    const isIgnored = Boolean(
      existingResult.data?.ignored_at
    );
    const mergedSources =
      mergeDiscoverySources(
        existingResult.data?.discovery_sources,
        device.discoverySources
      );
    const mergedMdnsServices = mergeStringArrays(
      existingResult.data?.mdns_services,
      device.mdnsServices
    );

    const confirmedVaultDevice =
      preservedImportedDeviceId
        ? vaultDevices.find(
            (candidate) =>
              candidate.id ===
              preservedImportedDeviceId
          ) ?? null
        : null;

    const identification =
      preservedImportedDeviceId &&
      confirmedVaultDevice
        ? identificationFromConfirmedVaultDevice({
            deviceName:
              confirmedVaultDevice.deviceName,
            brand: confirmedVaultDevice.brand,
            manufacturer:
              confirmedVaultDevice.manufacturer,
            modelNumber:
              confirmedVaultDevice.modelNumber,
            category:
              confirmedVaultDevice.category,
          })
        : buildIdentificationForParsedDevice(
            device
          );

    const upsertPayload: Record<string, unknown> = {
      household_id: householdId,
      connector_id: connectorId,
      local_fingerprint: device.localFingerprint,
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
      imported_device_id: preservedImportedDeviceId,
    };

    const { data: upsertedRow, error: upsertError } =
      await admin
        .from("discovered_devices")
        .upsert(upsertPayload, {
          onConflict:
            "connector_id,local_fingerprint",
        })
        .select("*")
        .single();

    if (upsertError) {
      throw upsertError;
    }

    upserted += 1;

    const discoveredRow =
      upsertedRow as DiscoveredDeviceRow;

    if (isIgnored) {
      ignored += 1;
      continue;
    }

    const discoveredForMatching =
      rowToDiscoveredForMatching(
        discoveredRow
      );

    const match = matchDiscoveredDevice(
      discoveredForMatching,
      vaultDevices
    );

    let targetDeviceId =
      discoveredRow.imported_device_id ??
      (match.matchStatus === "matched"
        ? match.matchedDeviceId
        : null);

    if (
      !discoveredRow.imported_device_id &&
      shouldAutoLinkMatch(match) &&
      targetDeviceId
    ) {
      const { error: linkError } = await admin
        .from("discovered_devices")
        .update({
          imported_device_id:
            targetDeviceId,
          updated_at: scannedAt,
        })
        .eq("id", discoveredRow.id)
        .eq("household_id", householdId);

      if (linkError) {
        throw linkError;
      }

      autoMatched += 1;
    }

    if (match.matchStatus === "ignored") {
      ignored += 1;
      continue;
    }

    /*
     * Always enrich a linked vault device when this scan observes it.
     * Do not skip enrichment for possible_match/new when imported_device_id
     * already points at a saved device — that left Devices cards stale while
     * Network showed a fresh discovered_devices.last_seen_at.
     */
    if (targetDeviceId) {
      const vaultDevice = vaultDevices.find(
        (candidate) =>
          candidate.id === targetDeviceId
      );

      const vaultDeviceRow = vaultDeviceRows.find(
        (candidate) => candidate.id === targetDeviceId
      );

      if (vaultDevice && vaultDeviceRow) {
        const previousSnapshot =
          toNetworkSnapshot(vaultDeviceRow);

        const update =
          buildDeviceNetworkEnrichmentUpdate(
            vaultDevice,
            toDiscoveryNetworkFields(
              device,
              connectorId
            ),
            {
              existingDiscoverySource:
                vaultDevice.discoverySource ?? null,
              existingDiscoverySources:
                mergedSources,
              networkUpdatedAt: scannedAt,
            }
          );

        await enrichVaultDevice(
          admin,
          vaultDevice.id,
          householdId,
          update
        );

        if (Object.keys(update).length > 0) {
          const nextSnapshot = toNetworkSnapshot({
            ...vaultDeviceRow,
            online:
              typeof update.online === "boolean"
                ? update.online
                : vaultDeviceRow.online,
            last_seen_at:
              typeof update.last_seen_at === "string"
                ? update.last_seen_at
                : vaultDeviceRow.last_seen_at,
            first_seen_at:
              typeof update.first_seen_at === "string"
                ? update.first_seen_at
                : vaultDeviceRow.first_seen_at,
            ip_address:
              typeof update.ip_address === "string"
                ? update.ip_address
                : vaultDeviceRow.ip_address,
            hostname:
              typeof update.hostname === "string"
                ? update.hostname
                : vaultDeviceRow.hostname,
            manufacturer:
              typeof update.manufacturer === "string"
                ? update.manufacturer
                : vaultDeviceRow.manufacturer,
            network_updated_at:
              typeof update.network_updated_at ===
              "string"
                ? update.network_updated_at
                : scannedAt,
          });

          await recordVaultDeviceNetworkSyncEvents({
            admin,
            householdId,
            connectorId,
            discoveredDeviceId: discoveredRow.id,
            deviceId: vaultDevice.id,
            previous: previousSnapshot,
            next: nextSnapshot,
            scannedAt,
            actorUserId,
          });
        }

        enriched += 1;

        Object.assign(vaultDevice, {
          ipAddress:
            device.ipAddress ??
            vaultDevice.ipAddress,
          macAddress:
            device.macAddress ??
            vaultDevice.macAddress,
          hostname:
            device.hostname ??
            vaultDevice.hostname,
          manufacturer:
            device.manufacturer ??
            vaultDevice.manufacturer,
          networkFingerprint:
            device.localFingerprint,
          firstSeenAt:
            vaultDevice.firstSeenAt ??
            preservedFirstSeenAt,
        });

        Object.assign(vaultDeviceRow, {
          online:
            typeof update.online === "boolean"
              ? update.online
              : vaultDeviceRow.online,
          last_seen_at:
            typeof update.last_seen_at === "string"
              ? update.last_seen_at
              : vaultDeviceRow.last_seen_at,
          ip_address:
            typeof update.ip_address === "string"
              ? update.ip_address
              : vaultDeviceRow.ip_address,
          hostname:
            typeof update.hostname === "string"
              ? update.hostname
              : vaultDeviceRow.hostname,
          manufacturer:
            typeof update.manufacturer === "string"
              ? update.manufacturer
              : vaultDeviceRow.manufacturer,
          network_updated_at: scannedAt,
        });
      }

      continue;
    }

    if (match.matchStatus === "possible_match") {
      possibleMatches += 1;
      continue;
    }

    if (match.matchStatus === "new") {
      newDevices += 1;
      continue;
    }
  }

  await markAbsentLinkedDevicesOffline({
    admin,
    connectorId,
    householdId,
    scannedAt,
    scannedFingerprints: new Set(
      devices.map((device) => device.localFingerprint)
    ),
    vaultDeviceRows,
    actorUserId,
  });

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
    autoMatched,
    enriched,
    possibleMatches,
    ignored,
    newDevices,
  };
}

/**
 * Linked vault devices that were not observed in this connector scan should
 * flip offline while preserving their last_seen_at timestamp.
 */
async function markAbsentLinkedDevicesOffline(input: {
  admin: SupabaseClient;
  connectorId: string;
  householdId: string;
  scannedAt: string;
  scannedFingerprints: Set<string>;
  vaultDeviceRows: Array<Record<string, unknown>>;
  actorUserId: string | null;
}) {
  const {
    admin,
    connectorId,
    householdId,
    scannedAt,
    scannedFingerprints,
    vaultDeviceRows,
    actorUserId,
  } = input;

  const { data: linkedRows, error } = await admin
    .from("discovered_devices")
    .select(
      "id, local_fingerprint, imported_device_id, last_seen_at, online"
    )
    .eq("connector_id", connectorId)
    .eq("household_id", householdId)
    .not("imported_device_id", "is", null)
    .is("ignored_at", null);

  if (error) {
    throw error;
  }

  for (const row of linkedRows ?? []) {
    const fingerprint =
      typeof row.local_fingerprint === "string"
        ? row.local_fingerprint
        : "";

    if (
      !fingerprint ||
      scannedFingerprints.has(fingerprint)
    ) {
      continue;
    }

    const vaultDeviceId =
      typeof row.imported_device_id === "string"
        ? row.imported_device_id
        : null;

    if (!vaultDeviceId) {
      continue;
    }

    if (row.online !== false) {
      const { error: discoveredOfflineError } =
        await admin
          .from("discovered_devices")
          .update({
            online: false,
            updated_at: scannedAt,
          })
          .eq("id", row.id)
          .eq("household_id", householdId);

      if (discoveredOfflineError) {
        throw discoveredOfflineError;
      }
    }

    const vaultDeviceRow = vaultDeviceRows.find(
      (candidate) => candidate.id === vaultDeviceId
    );

    if (!vaultDeviceRow) {
      continue;
    }

    if (vaultDeviceRow.online === false) {
      continue;
    }

    const previousSnapshot = toNetworkSnapshot({
      id: vaultDeviceId,
      online:
        typeof vaultDeviceRow.online === "boolean"
          ? vaultDeviceRow.online
          : null,
      last_seen_at:
        typeof vaultDeviceRow.last_seen_at === "string"
          ? vaultDeviceRow.last_seen_at
          : null,
      first_seen_at:
        typeof vaultDeviceRow.first_seen_at === "string"
          ? vaultDeviceRow.first_seen_at
          : null,
      ip_address:
        vaultDeviceRow.ip_address === null ||
        vaultDeviceRow.ip_address === undefined
          ? null
          : String(vaultDeviceRow.ip_address),
      hostname:
        typeof vaultDeviceRow.hostname === "string"
          ? vaultDeviceRow.hostname
          : null,
      manufacturer:
        typeof vaultDeviceRow.manufacturer === "string"
          ? vaultDeviceRow.manufacturer
          : null,
      network_updated_at:
        typeof vaultDeviceRow.network_updated_at ===
        "string"
          ? vaultDeviceRow.network_updated_at
          : null,
    });

    await enrichVaultDevice(
      admin,
      vaultDeviceId,
      householdId,
      {
        online: false,
        network_updated_at: scannedAt,
      }
    );

    vaultDeviceRow.online = false;
    vaultDeviceRow.network_updated_at = scannedAt;

    await recordVaultDeviceNetworkSyncEvents({
      admin,
      householdId,
      connectorId,
      discoveredDeviceId: row.id,
      deviceId: vaultDeviceId,
      previous: previousSnapshot,
      next: {
        ...previousSnapshot,
        online: false,
        network_updated_at: scannedAt,
      },
      scannedAt,
      actorUserId,
    });
  }
}

export function summarizeDiscoveredDevice(
  row: DiscoveredDeviceRow,
  match: DeviceMatchResult,
  matchedDevice?: {
    id: string;
    device_name: string | null;
    category: string | null;
    manufacturer: string | null;
    model_number: string | null;
    location?: string | null;
  } | null
): DiscoveredDeviceSummary {
  const identification =
    row.imported_device_id && matchedDevice
      ? identificationFromConfirmedVaultDevice({
          deviceName: matchedDevice.device_name,
          brand: null,
          manufacturer: matchedDevice.manufacturer,
          modelNumber: matchedDevice.model_number,
          category: matchedDevice.category,
        })
      : row.identification_confidence &&
          row.identification_display_name
        ? {
            likelyCategory:
              (row.likely_category as IdentificationResult["likelyCategory"]) ??
              null,
            likelyBrand: row.likely_brand,
            friendlyName: row.friendly_name,
            model: row.model,
            identificationConfidence:
              row.identification_confidence,
            identificationReasons:
              row.identification_reasons ?? [],
            displayName: row.identification_display_name,
          }
        : identifyDiscoveredDevice({
            ipAddress:
              row.ip_address === null
                ? null
                : String(row.ip_address),
            macAddress: row.mac_address,
            hostname: row.hostname,
            manufacturer: row.manufacturer,
            model: row.model,
            friendlyName: row.friendly_name,
            discoverySources: row.discovery_sources,
            mdnsServices: row.mdns_services ?? [],
            ssdpDeviceType: row.ssdp_device_type,
            ssdpDescriptionUrl: row.ssdp_description_url,
            stableFingerprint: row.local_fingerprint,
          });

  return {
    id: row.id,
    connectorId: row.connector_id,
    localFingerprint: row.local_fingerprint,
    hostname: row.hostname,
    manufacturer: row.manufacturer,
    model: row.model,
    serialNumber: row.serial_number,
    ipAddress:
      row.ip_address === null
        ? null
        : String(row.ip_address),
    macAddress: row.mac_address,
    deviceType: row.device_type,
    friendlyName: row.friendly_name,
    mdnsServices: row.mdns_services ?? [],
    ssdpDeviceType: row.ssdp_device_type,
    ssdpDescriptionUrl: row.ssdp_description_url,
    likelyCategory:
      identification.likelyCategory ?? row.likely_category,
    likelyBrand:
      identification.likelyBrand ?? row.likely_brand,
    identificationConfidence:
      identification.identificationConfidence ??
      row.identification_confidence,
    identificationReasons:
      identification.identificationReasons.length > 0
        ? identification.identificationReasons
        : row.identification_reasons ?? [],
    identificationDisplayName:
      identification.displayName ??
      row.identification_display_name,
    online: row.online,
    discoverySources: row.discovery_sources,
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
    importedDeviceId: row.imported_device_id,
    matchConfirmedAt: row.match_confirmed_at,
    ignoredAt: row.ignored_at,
    matchStatus: match.matchStatus,
    matchConfidence: match.matchConfidence,
    matchReason: match.matchReason,
    matchedDeviceId: match.matchedDeviceId,
    candidateDeviceIds:
      match.candidateDeviceIds,
    matchedDevice: matchedDevice
      ? {
          id: matchedDevice.id,
          deviceName:
            matchedDevice.device_name,
          category: matchedDevice.category,
          manufacturer:
            matchedDevice.manufacturer,
          modelNumber:
            matchedDevice.model_number,
          location: matchedDevice.location ?? null,
        }
      : null,
  };
}

export async function loadDiscoveryReviewRows(
  admin: SupabaseClient,
  householdId: string
): Promise<DiscoveredDeviceSummary[]> {
  const [
    discoveredResult,
    vaultDevicesResult,
  ] = await Promise.all([
    admin
      .from("discovered_devices")
      .select(DISCOVERED_DEVICE_SELECT_FOUNDATION)
      .eq("household_id", householdId)
      .order("last_seen_at", {
        ascending: false,
      }),
    admin
      .from("devices")
      .select(VAULT_DEVICE_SELECT_FOUNDATION)
      .eq("household_id", householdId),
  ]);

  if (discoveredResult.error) {
    throw discoveredResult.error;
  }

  if (vaultDevicesResult.error) {
    throw vaultDevicesResult.error;
  }

  const vaultDevices = (
    vaultDevicesResult.data ?? []
  ).map((row) =>
    rowToVaultDeviceForMatching({
      ...row,
      network_fingerprint: null,
    })
  );

  const vaultDeviceById = new Map(
    (vaultDevicesResult.data ?? []).map(
      (row) => [row.id, row]
    )
  );

  return (
    (discoveredResult.data ??
      []) as DiscoveredDeviceRow[]
  ).map((row) => {
    const match = matchDiscoveredDevice(
      rowToDiscoveredForMatching({
        ...row,
        model: row.model ?? null,
        serial_number: row.serial_number ?? null,
        match_confirmed_at:
          row.match_confirmed_at ?? null,
      }),
      vaultDevices
    );

    const matchedDevice = match.matchedDeviceId
      ? vaultDeviceById.get(
          match.matchedDeviceId
        ) ?? null
      : null;

    return summarizeDiscoveredDevice(
      row,
      match,
      matchedDevice
    );
  });
}

export async function confirmDiscoveredDeviceMatch(input: {
  admin: SupabaseClient;
  householdId: string;
  discoveredDeviceId: string;
  vaultDeviceId: string;
  userId: string;
  nowIso: string;
}) {
  const {
    admin,
    householdId,
    discoveredDeviceId,
    vaultDeviceId,
    userId,
    nowIso,
  } = input;

  const { data: discoveredRow, error: discoveredError } =
    await admin
      .from("discovered_devices")
      .select("*")
      .eq("id", discoveredDeviceId)
      .eq("household_id", householdId)
      .maybeSingle();

  if (discoveredError) {
    throw discoveredError;
  }

  if (!discoveredRow) {
    throw new Error(
      "Discovered device not found."
    );
  }

  const { data: vaultRow, error: vaultError } =
    await admin
      .from("devices")
      .select(VAULT_DEVICE_SELECT)
      .eq("id", vaultDeviceId)
      .eq("household_id", householdId)
      .maybeSingle();

  if (vaultError) {
    throw vaultError;
  }

  if (!vaultRow) {
    throw new Error(
      "Vault device not found in this household."
    );
  }

  const { error: linkError } = await admin
    .from("discovered_devices")
    .update({
      imported_device_id: vaultDeviceId,
      match_confirmed_at: nowIso,
      match_confirmed_by: userId,
      ignored_at: null,
      updated_at: nowIso,
    })
    .eq("id", discoveredDeviceId)
    .eq("household_id", householdId);

  if (linkError) {
    throw linkError;
  }

  const vaultDevice =
    rowToVaultDeviceForMatching(vaultRow);

  const previousSnapshot = toNetworkSnapshot(vaultRow);

  const update = buildDeviceNetworkEnrichmentUpdate(
    vaultDevice,
    {
      ipAddress:
        discoveredRow.ip_address === null
          ? null
          : String(discoveredRow.ip_address),
      macAddress: discoveredRow.mac_address,
      hostname: discoveredRow.hostname,
      manufacturer:
        discoveredRow.manufacturer,
      model: discoveredRow.model,
      online: discoveredRow.online,
      firstSeenAt: discoveredRow.first_seen_at,
      lastSeenAt: discoveredRow.last_seen_at,
      discoverySource:
        discoveredRow.discovery_sources?.[0] ??
        "Connector Scan",
      connectorId: discoveredRow.connector_id,
      networkFingerprint:
        discoveredRow.local_fingerprint,
    },
    {
      existingDiscoverySources:
        discoveredRow.discovery_sources,
      networkUpdatedAt: nowIso,
    }
  );

  await enrichVaultDevice(
    admin,
    vaultDeviceId,
    householdId,
    update
  );

  if (Object.keys(update).length > 0) {
    const nextSnapshot = toNetworkSnapshot({
      ...vaultRow,
      online:
        typeof update.online === "boolean"
          ? update.online
          : vaultRow.online,
      last_seen_at:
        typeof update.last_seen_at === "string"
          ? update.last_seen_at
          : vaultRow.last_seen_at,
      first_seen_at:
        typeof update.first_seen_at === "string"
          ? update.first_seen_at
          : vaultRow.first_seen_at,
      ip_address:
        typeof update.ip_address === "string"
          ? update.ip_address
          : vaultRow.ip_address,
      hostname:
        typeof update.hostname === "string"
          ? update.hostname
          : vaultRow.hostname,
      manufacturer:
        typeof update.manufacturer === "string"
          ? update.manufacturer
          : vaultRow.manufacturer,
      network_updated_at:
        typeof update.network_updated_at === "string"
          ? update.network_updated_at
          : nowIso,
    });

    await recordVaultDeviceNetworkSyncEvents({
      admin,
      householdId,
      connectorId: discoveredRow.connector_id,
      discoveredDeviceId,
      deviceId: vaultDeviceId,
      previous: previousSnapshot,
      next: nextSnapshot,
      scannedAt: nowIso,
      actorUserId: userId,
    });
  }

  await recordDeviceMatchedNetworkEvent({
    admin,
    householdId,
    connectorId: discoveredRow.connector_id,
    discoveredDeviceId,
    deviceId: vaultDeviceId,
    matchedAt: nowIso,
    actorUserId: userId,
  });
}

export async function ignoreDiscoveredDevice(input: {
  admin: SupabaseClient;
  householdId: string;
  discoveredDeviceId: string;
  nowIso: string;
}) {
  const { error } = await input.admin
    .from("discovered_devices")
    .update({
      ignored_at: input.nowIso,
      updated_at: input.nowIso,
    })
    .eq("id", input.discoveredDeviceId)
    .eq("household_id", input.householdId);

  if (error) {
    throw error;
  }
}

export async function clearDiscoveredDeviceLink(input: {
  admin: SupabaseClient;
  householdId: string;
  discoveredDeviceId: string;
  nowIso: string;
}) {
  const { error } = await input.admin
    .from("discovered_devices")
    .update({
      imported_device_id: null,
      match_confirmed_at: null,
      match_confirmed_by: null,
      updated_at: input.nowIso,
    })
    .eq("id", input.discoveredDeviceId)
    .eq("household_id", input.householdId);

  if (error) {
    throw error;
  }
}
