import "server-only";

import {
  buildDeviceNetworkEnrichmentUpdate,
} from "@/lib/connector/deviceEnrichment";
import {
  matchDiscoveredDevice,
  rowToDiscoveredForMatching,
  rowToVaultDeviceForMatching,
  shouldAutoLinkMatch,
} from "@/lib/connector/matching";
import {
  mergeDiscoverySources,
} from "@/lib/connector/network";

import type {
  DeviceMatchResult,
  DiscoveredDeviceRow,
  DiscoveredDeviceSummary,
  DiscoverySyncResponse,
} from "@/lib/connector/discoveryTypes";
import type { ParsedDiscoveryDevice } from "@/lib/connector/discoveryValidation";
import type { SupabaseClient } from "@supabase/supabase-js";

type SyncDiscoveredDevicesInput = {
  admin: SupabaseClient;
  connectorId: string;
  householdId: string;
  scannedAt: string;
  devices: ParsedDiscoveryDevice[];
};

const VAULT_DEVICE_SELECT =
  "id, household_id, device_name, brand, manufacturer, model_number, serial_number, mac_address, network_fingerprint, category, ip_address, hostname, first_seen_at, discovery_source";

/** Foundation schema only — safe before 2B.2 device enrichment migration. */
const VAULT_DEVICE_SELECT_FOUNDATION =
  "id, household_id, device_name, brand, manufacturer, model_number, serial_number, mac_address, category, ip_address, discovery_source";

/** Foundation schema only — safe before 2B.2 discovered_devices match columns. */
const DISCOVERED_DEVICE_SELECT_FOUNDATION =
  "id, household_id, connector_id, local_fingerprint, hostname, manufacturer, ip_address, mac_address, device_type, online, discovery_sources, first_seen_at, last_seen_at, imported_device_id, ignored_at, created_at, updated_at";

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
    discoverySource: device.discoverySource,
    connectorId,
    networkFingerprint:
      device.localFingerprint,
  };
}

async function loadVaultDevices(
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

  return (data ?? []).map(
    rowToVaultDeviceForMatching
  );
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

  const vaultDevices = await loadVaultDevices(
    admin,
    householdId
  );

  let upserted = 0;
  let autoMatched = 0;
  let enriched = 0;
  let possibleMatches = 0;
  let ignored = 0;
  let unmatched = 0;

  for (const device of devices) {
    const existingResult = await admin
      .from("discovered_devices")
      .select(
        "id, imported_device_id, ignored_at, first_seen_at, discovery_sources"
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
        device.discoverySource
      );

    const upsertPayload = {
      household_id: householdId,
      connector_id: connectorId,
      local_fingerprint:
        device.localFingerprint,
      hostname: device.hostname,
      manufacturer: device.manufacturer,
      model: device.model,
      serial_number: device.serialNumber,
      ip_address: device.ipAddress,
      mac_address: device.macAddress,
      device_type: device.deviceType,
      online: device.online,
      discovery_sources: mergedSources,
      first_seen_at: preservedFirstSeenAt,
      last_seen_at: device.lastSeenAt,
      updated_at: scannedAt,
      imported_device_id:
        preservedImportedDeviceId,
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
      discoveredRow.imported_device_id;

    if (
      !targetDeviceId &&
      shouldAutoLinkMatch(match)
    ) {
      targetDeviceId =
        match.matchedDeviceId;

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

    if (match.matchStatus === "possible_match") {
      possibleMatches += 1;
      continue;
    }

    if (match.matchStatus === "unmatched") {
      unmatched += 1;
      continue;
    }

    if (!targetDeviceId) {
      continue;
    }

    const vaultDevice = vaultDevices.find(
      (candidate) =>
        candidate.id === targetDeviceId
    );

    if (!vaultDevice) {
      continue;
    }

    const update = buildDeviceNetworkEnrichmentUpdate(
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
      }
    );

    await enrichVaultDevice(
      admin,
      vaultDevice.id,
      householdId,
      update
    );

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
    autoMatched,
    enriched,
    possibleMatches,
    ignored,
    unmatched,
  };
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
  } | null
): DiscoveredDeviceSummary {
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
  ).map(rowToVaultDeviceForMatching);

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
    }
  );

  await enrichVaultDevice(
    admin,
    vaultDeviceId,
    householdId,
    update
  );
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
