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
      device.householdId ===
      discovered.householdId
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

function strongMultiFieldMatches(
  discovered: DiscoveredForMatching,
  vaultDevices: VaultDeviceForMatching[]
): VaultDeviceForMatching[] {
  const manufacturer =
    normalizeManufacturer(
      discovered.manufacturer
    );
  const model = normalizeModel(
    discovered.model
  );
  const hostname = normalizeHostname(
    discovered.hostname
  );
  const category = normalizeCategory(
    discovered.deviceType
  );

  if (
    !manufacturer ||
    !model ||
    !hostname ||
    !category
  ) {
    return [];
  }

  return vaultDevices.filter((device) => {
    return (
      normalizeManufacturer(
        device.manufacturer
      ) === manufacturer &&
      normalizeModel(
        device.modelNumber
      ) === model &&
      normalizeHostname(
        device.hostname ??
          device.deviceName
      ) === hostname &&
      normalizeCategory(device.category) ===
        category
    );
  });
}

function manufacturerModelMatches(
  discovered: DiscoveredForMatching,
  vaultDevices: VaultDeviceForMatching[]
): VaultDeviceForMatching[] {
  const manufacturer =
    normalizeManufacturer(
      discovered.manufacturer
    );
  const model = normalizeModel(
    discovered.model
  );

  if (!manufacturer || !model) {
    return [];
  }

  return vaultDevices.filter((device) => {
    return (
      normalizeManufacturer(
        device.manufacturer
      ) === manufacturer &&
      normalizeModel(
        device.modelNumber
      ) === model
    );
  });
}

function hostnameCandidateMatches(
  discovered: DiscoveredForMatching,
  vaultDevices: VaultDeviceForMatching[]
): VaultDeviceForMatching[] {
  return vaultDevices.filter((device) =>
    hostnamesLikelyMatch(
      discovered.hostname,
      device.hostname ?? device.deviceName
    )
  );
}

/**
 * Match a discovered device to household vault devices using the Phase 2B.1 priority order.
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

  const householdDevices =
    scopedVaultDevices(
      discovered,
      vaultDevices
    );

  if (discovered.importedDeviceId) {
    const linkedDevice = findVaultDeviceById(
      householdDevices,
      discovered.importedDeviceId
    );

    if (linkedDevice) {
      if (discovered.matchConfirmedAt) {
        return matchedResult(
          linkedDevice.id,
          "exact",
          "Previously confirmed by household admin"
        );
      }

      return matchedResult(
        linkedDevice.id,
        "exact",
        "Existing discovered-device link"
      );
    }
  }

  const discoveredMac = normalizeMacAddress(
    discovered.macAddress
  );

  if (discoveredMac) {
    const macMatches = householdDevices.filter(
      (device) =>
        normalizeMacAddress(
          device.macAddress
        ) === discoveredMac
    );

    if (macMatches.length === 1) {
      return matchedResult(
        macMatches[0]!.id,
        "exact",
        "Exact MAC address match"
      );
    }

    if (macMatches.length > 1) {
      return possibleResult(
        macMatches.map((device) => device.id),
        "high",
        "Multiple vault devices share this MAC address",
        macMatches[0]!.id
      );
    }
  }

  const discoveredFingerprint =
    discovered.localFingerprint.trim();

  if (discoveredFingerprint) {
    const fingerprintMatches =
      householdDevices.filter((device) => {
        const vaultFingerprint =
          vaultDeviceFingerprint({
            macAddress: device.macAddress,
            networkFingerprint:
              device.networkFingerprint,
            serialNumber:
              device.serialNumber,
          });

        return (
          vaultFingerprint ===
          discoveredFingerprint
        );
      });

    if (fingerprintMatches.length === 1) {
      return matchedResult(
        fingerprintMatches[0]!.id,
        "exact",
        "Exact stable network fingerprint match"
      );
    }

    if (fingerprintMatches.length > 1) {
      return possibleResult(
        fingerprintMatches.map(
          (device) => device.id
        ),
        "high",
        "Multiple vault devices share this network fingerprint",
        fingerprintMatches[0]!.id
      );
    }
  }

  const discoveredSerial =
    normalizeSerialNumber(
      discovered.serialNumber
    );

  if (discoveredSerial) {
    const serialMatches =
      householdDevices.filter(
        (device) =>
          normalizeSerialNumber(
            device.serialNumber
          ) === discoveredSerial
      );

    if (serialMatches.length === 1) {
      return matchedResult(
        serialMatches[0]!.id,
        "high",
        "Exact supported serial or vendor identifier match"
      );
    }

    if (serialMatches.length > 1) {
      return possibleResult(
        serialMatches.map(
          (device) => device.id
        ),
        "high",
        "Multiple vault devices share this serial number",
        serialMatches[0]!.id
      );
    }
  }

  const strongMatches =
    strongMultiFieldMatches(
      discovered,
      householdDevices
    );

  if (strongMatches.length === 1) {
    return matchedResult(
      strongMatches[0]!.id,
      "high",
      "Manufacturer and model match"
    );
  }

  if (strongMatches.length > 1) {
    return possibleResult(
      strongMatches.map(
        (device) => device.id
      ),
      "high",
      "Multiple vault devices match manufacturer, model, hostname, and category",
      strongMatches[0]!.id
    );
  }

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
      "Manufacturer and model match",
      manufacturerModelCandidates[0]!.id
    );
  }

  if (manufacturerModelCandidates.length > 1) {
    return possibleResult(
      manufacturerModelCandidates.map(
        (device) => device.id
      ),
      "medium",
      "Multiple vault devices match manufacturer and model",
      manufacturerModelCandidates[0]!.id
    );
  }

  const hostnameCandidates =
    hostnameCandidateMatches(
      discovered,
      householdDevices
    );

  if (hostnameCandidates.length === 1) {
    return possibleResult(
      hostnameCandidates.map(
        (device) => device.id
      ),
      "medium",
      "Possible hostname match",
      hostnameCandidates[0]!.id
    );
  }

  if (hostnameCandidates.length > 1) {
    return possibleResult(
      hostnameCandidates.map(
        (device) => device.id
      ),
      "low",
      "Multiple vault devices have a similar hostname",
      hostnameCandidates[0]!.id
    );
  }

  return {
    matchStatus: "unmatched",
    matchConfidence: null,
    matchReason: null,
    matchedDeviceId: null,
  };
}

export function shouldAutoLinkMatch(
  result: DeviceMatchResult
): boolean {
  if (result.matchStatus !== "matched") {
    return false;
  }

  return (
    result.matchConfidence === "exact" ||
    result.matchConfidence === "high"
  );
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
    result.matchStatus ===
      "possible_match" &&
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
    model: string | null;
    serial_number: string | null;
    ip_address: string | null;
    mac_address: string | null;
    device_type: string | null;
    imported_device_id: string | null;
    match_confirmed_at: string | null;
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
    model: row.model,
    serialNumber: row.serial_number,
    ipAddress:
      row.ip_address === null
        ? null
        : String(row.ip_address),
    macAddress: row.mac_address,
    deviceType: row.device_type,
    importedDeviceId: row.imported_device_id,
    matchConfirmedAt: row.match_confirmed_at,
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
    network_fingerprint: string | null;
    category: string | null;
    ip_address?: string | null;
    hostname?: string | null;
    first_seen_at?: string | null;
    discovery_source?: string | null;
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
    networkFingerprint:
      row.network_fingerprint,
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
