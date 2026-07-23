import {
  hostnamesLikelyMatch,
  normalizeCategory,
  normalizeHostname,
  normalizeMacAddress,
  normalizeManufacturer,
  normalizeModel,
  normalizeSerialNumber,
  vaultDeviceFingerprint,
} from "@/lib/connector/network";

import type {
  DeviceMatchResult,
  DiscoveredForMatching,
  MatchConfidence,
  VaultDeviceForMatching,
} from "@/lib/connector/discoveryTypes";

function scopedVaultDevices(
  discovered: DiscoveredForMatching,
  vaultDevices: VaultDeviceForMatching[]
): VaultDeviceForMatching[] {
  return vaultDevices.filter(
    (device) =>
      device.householdId === discovered.householdId
  );
}

function findVaultDeviceById(
  vaultDevices: VaultDeviceForMatching[],
  deviceId: string | null
): VaultDeviceForMatching | null {
  if (!deviceId) {
    return null;
  }

  return (
    vaultDevices.find(
      (device) => device.id === deviceId
    ) ?? null
  );
}

function matchedResult(
  matchedDeviceId: string,
  matchConfidence: MatchConfidence,
  matchReason: string
): DeviceMatchResult {
  return {
    matchStatus: "matched",
    matchConfidence,
    matchReason,
    matchedDeviceId,
  };
}

function possibleResult(
  candidateDeviceIds: string[],
  matchConfidence: MatchConfidence,
  matchReason: string,
  matchedDeviceId?: string | null
): DeviceMatchResult {
  return {
    matchStatus: "possible_match",
    matchConfidence,
    matchReason,
    matchedDeviceId:
      matchedDeviceId ??
      candidateDeviceIds[0] ??
      null,
    candidateDeviceIds,
  };
}

function manufacturerModelMatches(
  discovered: DiscoveredForMatching,
  vaultDevices: VaultDeviceForMatching[]
): VaultDeviceForMatching[] {
  const manufacturer = normalizeManufacturer(
    discovered.manufacturer
  );
  const model = normalizeModel(discovered.model);

  if (!manufacturer || !model) {
    return [];
  }

  return vaultDevices.filter((device) => {
    return (
      normalizeManufacturer(device.manufacturer) ===
        manufacturer &&
      normalizeModel(device.modelNumber) === model
    );
  });
}

function manufacturerHostnameMatches(
  discovered: DiscoveredForMatching,
  vaultDevices: VaultDeviceForMatching[]
): VaultDeviceForMatching[] {
  const manufacturer = normalizeManufacturer(
    discovered.manufacturer
  );
  const hostname = normalizeHostname(
    discovered.hostname
  );

  if (!manufacturer || !hostname) {
    return [];
  }

  return vaultDevices.filter((device) => {
    if (
      normalizeManufacturer(device.manufacturer) !==
      manufacturer
    ) {
      return false;
    }

    return (
      normalizeHostname(device.hostname) === hostname ||
      normalizeHostname(device.deviceName) === hostname ||
      hostnamesLikelyMatch(
        discovered.hostname,
        device.hostname ?? device.deviceName
      )
    );
  });
}

function manufacturerCategoryMatches(
  discovered: DiscoveredForMatching,
  vaultDevices: VaultDeviceForMatching[]
): VaultDeviceForMatching[] {
  const manufacturer = normalizeManufacturer(
    discovered.manufacturer
  );
  const category = normalizeCategory(
    discovered.deviceType
  );

  if (!manufacturer || !category) {
    return [];
  }

  return vaultDevices.filter(
    (device) =>
      normalizeManufacturer(device.manufacturer) ===
        manufacturer &&
      normalizeCategory(device.category) === category
  );
}

function vendorIdentifierMatches(
  discovered: DiscoveredForMatching,
  vaultDevices: VaultDeviceForMatching[]
): VaultDeviceForMatching[] {
  const vendorId = normalizeSerialNumber(
    discovered.serialNumber
  );

  if (!vendorId || vendorId.length < 8) {
    return [];
  }

  return vaultDevices.filter(
    (device) =>
      normalizeSerialNumber(device.serialNumber) ===
      vendorId
  );
}

/**
 * Phase 2B.2 confidence-based matching engine.
 */
export function matchDiscoveredDevice(
  discovered: DiscoveredForMatching,
  vaultDevices: VaultDeviceForMatching[]
): DeviceMatchResult {
  if (discovered.ignoredAt) {
    return {
      matchStatus: "ignored",
      matchConfidence: null,
      matchReason: "Ignored by household member",
      matchedDeviceId: null,
    };
  }

  const householdDevices = scopedVaultDevices(
    discovered,
    vaultDevices
  );

  // 1. Previously confirmed relationship
  if (discovered.importedDeviceId) {
    const linkedDevice = findVaultDeviceById(
      householdDevices,
      discovered.importedDeviceId
    );

    if (linkedDevice) {
      return matchedResult(
        linkedDevice.id,
        "exact",
        discovered.matchConfirmedAt
          ? "Matched by previous confirmation"
          : "Matched by existing discovered-device link"
      );
    }
  }

  // 2. Exact MAC address
  const discoveredMac = normalizeMacAddress(
    discovered.macAddress
  );

  if (discoveredMac) {
    const macMatches = householdDevices.filter(
      (device) =>
        normalizeMacAddress(device.macAddress) ===
        discoveredMac
    );

    if (macMatches.length === 1) {
      return matchedResult(
        macMatches[0]!.id,
        "exact",
        "Matched by MAC address"
      );
    }

    if (macMatches.length > 1) {
      return possibleResult(
        macMatches.map((device) => device.id),
        "high",
        "Possible duplicate — multiple vault devices share this MAC address",
        macMatches[0]!.id
      );
    }
  }

  // 3. Stable network fingerprint
  const discoveredFingerprint =
    discovered.localFingerprint.trim();

  if (discoveredFingerprint) {
    const fingerprintMatches = householdDevices.filter(
      (device) => {
        const vaultFingerprint = vaultDeviceFingerprint({
          macAddress: device.macAddress,
          networkFingerprint: device.networkFingerprint,
          serialNumber: device.serialNumber,
        });

        return vaultFingerprint === discoveredFingerprint;
      }
    );

    if (fingerprintMatches.length === 1) {
      return matchedResult(
        fingerprintMatches[0]!.id,
        "exact",
        "Matched by stable network fingerprint"
      );
    }

    if (fingerprintMatches.length > 1) {
      return possibleResult(
        fingerprintMatches.map((device) => device.id),
        "high",
        "Possible duplicate — multiple vault devices share this fingerprint",
        fingerprintMatches[0]!.id
      );
    }
  }

  // 4. Vendor identifier (when available)
  const vendorMatches = vendorIdentifierMatches(
    discovered,
    householdDevices
  );

  if (vendorMatches.length === 1) {
    return matchedResult(
      vendorMatches[0]!.id,
      "exact",
      "Matched by vendor identifier"
    );
  }

  if (vendorMatches.length > 1) {
    return possibleResult(
      vendorMatches.map((device) => device.id),
      "high",
      "Possible duplicate — multiple vault devices share this vendor identifier",
      vendorMatches[0]!.id
    );
  }

  // 5. Serial number
  const discoveredSerial = normalizeSerialNumber(
    discovered.serialNumber
  );

  if (discoveredSerial) {
    const serialMatches = householdDevices.filter(
      (device) =>
        normalizeSerialNumber(device.serialNumber) ===
        discoveredSerial
    );

    if (serialMatches.length === 1) {
      return matchedResult(
        serialMatches[0]!.id,
        "exact",
        "Matched by serial number"
      );
    }

    if (serialMatches.length > 1) {
      return possibleResult(
        serialMatches.map((device) => device.id),
        "high",
        "Possible duplicate — multiple vault devices share this serial number",
        serialMatches[0]!.id
      );
    }
  }

  // 6. Manufacturer + model — review required
  const manufacturerModelCandidates =
    manufacturerModelMatches(
      discovered,
      householdDevices
    );

  if (manufacturerModelCandidates.length === 1) {
    return possibleResult(
      manufacturerModelCandidates.map(
        (device) => device.id
      ),
      "high",
      "Matched by manufacturer and model",
      manufacturerModelCandidates[0]!.id
    );
  }

  if (manufacturerModelCandidates.length > 1) {
    return possibleResult(
      manufacturerModelCandidates.map(
        (device) => device.id
      ),
      "medium",
      "Possible duplicate — multiple vault devices match manufacturer and model",
      manufacturerModelCandidates[0]!.id
    );
  }

  // 7. Manufacturer + normalized hostname — review required
  const manufacturerHostnameCandidates =
    manufacturerHostnameMatches(
      discovered,
      householdDevices
    );

  if (manufacturerHostnameCandidates.length === 1) {
    return possibleResult(
      manufacturerHostnameCandidates.map(
        (device) => device.id
      ),
      "medium",
      "Matched by manufacturer and hostname",
      manufacturerHostnameCandidates[0]!.id
    );
  }

  if (manufacturerHostnameCandidates.length > 1) {
    return possibleResult(
      manufacturerHostnameCandidates.map(
        (device) => device.id
      ),
      "low",
      "Possible duplicate — multiple vault devices match manufacturer and hostname",
      manufacturerHostnameCandidates[0]!.id
    );
  }

  // 8. Manufacturer + category — review required
  const manufacturerCategoryCandidates =
    manufacturerCategoryMatches(
      discovered,
      householdDevices
    );

  if (manufacturerCategoryCandidates.length === 1) {
    return possibleResult(
      manufacturerCategoryCandidates.map(
        (device) => device.id
      ),
      "medium",
      "Matched by manufacturer and category",
      manufacturerCategoryCandidates[0]!.id
    );
  }

  if (manufacturerCategoryCandidates.length > 1) {
    return possibleResult(
      manufacturerCategoryCandidates.map(
        (device) => device.id
      ),
      "low",
      "Possible duplicate — multiple vault devices match manufacturer and category",
      manufacturerCategoryCandidates[0]!.id
    );
  }

  // 9. New device — review required for import
  return {
    matchStatus: "new",
    matchConfidence: null,
    matchReason: null,
    matchedDeviceId: null,
  };
}

/** Auto-link and enrich only for exact matches or confirmed links. */
export function shouldAutoLinkMatch(
  result: DeviceMatchResult
): boolean {
  if (result.matchStatus !== "matched") {
    return false;
  }

  return result.matchConfidence === "exact";
}

export function isDuplicateImportCandidate(
  result: DeviceMatchResult
): boolean {
  if (result.matchStatus === "ignored") {
    return false;
  }

  if (result.matchStatus === "matched") {
    return true;
  }

  return (
    result.matchStatus === "possible_match" &&
    (result.matchConfidence === "exact" ||
      result.matchConfidence === "high")
  );
}

export function rowToDiscoveredForMatching(
  row: {
    id: string;
    household_id: string;
    local_fingerprint: string;
    hostname: string | null;
    manufacturer: string | null;
    model?: string | null;
    serial_number?: string | null;
    ip_address: string | null;
    mac_address: string | null;
    device_type: string | null;
    imported_device_id: string | null;
    match_confirmed_at?: string | null;
    ignored_at: string | null;
    first_seen_at?: string;
    last_seen_at?: string;
    online?: boolean;
    discovery_sources?: string[];
  }
): DiscoveredForMatching {
  return {
    id: row.id,
    householdId: row.household_id,
    localFingerprint: row.local_fingerprint,
    hostname: row.hostname,
    manufacturer: row.manufacturer,
    model: row.model ?? null,
    serialNumber: row.serial_number ?? null,
    ipAddress:
      row.ip_address === null
        ? null
        : String(row.ip_address),
    macAddress: row.mac_address,
    deviceType: row.device_type,
    importedDeviceId: row.imported_device_id,
    matchConfirmedAt: row.match_confirmed_at ?? null,
    ignoredAt: row.ignored_at,
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
    online: row.online,
    discoverySources: row.discovery_sources,
  };
}

export function rowToVaultDeviceForMatching(
  row: {
    id: string;
    household_id: string;
    device_name: string | null;
    brand: string | null;
    manufacturer: string | null;
    model_number: string | null;
    serial_number: string | null;
    mac_address: string | null;
    network_fingerprint?: string | null;
    category: string | null;
    ip_address?: string | null;
    hostname?: string | null;
    first_seen_at?: string | null;
    discovery_source?: string | null;
    location?: string | null;
  }
): VaultDeviceForMatching {
  return {
    id: row.id,
    householdId: row.household_id,
    deviceName: row.device_name,
    brand: row.brand,
    manufacturer: row.manufacturer,
    modelNumber: row.model_number,
    serialNumber: row.serial_number,
    macAddress: row.mac_address,
    networkFingerprint: row.network_fingerprint ?? null,
    category: row.category,
    ipAddress:
      row.ip_address === null ||
      row.ip_address === undefined
        ? null
        : String(row.ip_address),
    hostname: row.hostname ?? null,
    firstSeenAt: row.first_seen_at ?? null,
    discoverySource: row.discovery_source ?? null,
  };
}
