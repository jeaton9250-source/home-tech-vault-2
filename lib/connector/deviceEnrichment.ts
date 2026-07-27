import {
  manufacturerIsMoreSpecific,
  mergeDiscoverySources,
  normalizeMacAddress,
} from "@/lib/connector/network";
import { cleanDiscoveredHostname } from "@/lib/connector/deviceIdentification";

import type {
  DiscoveryNetworkFields,
  VaultDeviceForMatching,
} from "@/lib/connector/discoveryTypes";

/**
 * Build a selective network enrichment update for an existing vault device.
 * Preserves user-entered identity and purchase metadata.
 */
export function buildDeviceNetworkEnrichmentUpdate(
  existing: VaultDeviceForMatching,
  discovery: DiscoveryNetworkFields,
  options?: {
    existingDiscoverySource?: string | null;
    existingDiscoverySources?: string[];
    /** When false, skips columns that require the 2B.2 migration. */
    extendedNetworkFields?: boolean;
    networkUpdatedAt?: string;
  }
): Record<string, unknown> {
  const update: Record<string, unknown> = {};

  if (
    discovery.ipAddress &&
    discovery.ipAddress !== existing.ipAddress
  ) {
    update.ip_address = discovery.ipAddress;
  }

  const discoveredMac = normalizeMacAddress(
    discovery.macAddress
  );
  const existingMac = normalizeMacAddress(
    existing.macAddress
  );

  if (discoveredMac) {
    if (
      !existingMac ||
      existingMac === discoveredMac
    ) {
      if (discoveredMac !== existingMac) {
        update.mac_address = discoveredMac;
      }
    }
  }

  if (
    options?.extendedNetworkFields !== false &&
    discovery.hostname &&
    discovery.hostname !== existing.hostname
  ) {
    update.hostname = discovery.hostname;
  }

  if (discovery.manufacturer) {
    const shouldSetManufacturer =
      !existing.manufacturer?.trim() ||
      manufacturerIsMoreSpecific(
        existing.manufacturer,
        discovery.manufacturer
      );

    if (shouldSetManufacturer) {
      update.manufacturer =
        discovery.manufacturer.trim();

      if (!existing.brand?.trim()) {
        update.brand =
          discovery.manufacturer.trim();
      }
    }
  }

  if (
    discovery.model &&
    !existing.modelNumber?.trim()
  ) {
    update.model_number =
      discovery.model.trim();
  }

  update.online = discovery.online;
  update.last_seen_at = discovery.lastSeenAt;

  if (options?.extendedNetworkFields !== false) {
    update.connector_id = discovery.connectorId;
    update.network_fingerprint =
      discovery.networkFingerprint;

    if (
      !existing.firstSeenAt &&
      discovery.firstSeenAt
    ) {
      update.first_seen_at = discovery.firstSeenAt;
    }
  }

  const mergedSources = mergeDiscoverySources(
    [
      ...(options?.existingDiscoverySources ??
        []),
      ...(options?.existingDiscoverySource
        ? [
            options.existingDiscoverySource,
          ]
        : []),
    ],
    discovery.discoverySource
  );

  if (mergedSources.length > 0) {
    update.discovery_source =
      mergedSources.join(", ");
  } else if (discovery.discoverySource) {
    update.discovery_source =
      discovery.discoverySource;
  }

  if (Object.keys(update).length > 0) {
    update.network_updated_at =
      options?.networkUpdatedAt ?? discovery.lastSeenAt;
  }

  return update;
}

export function buildNewDeviceImportPayload(input: {
  discovery: DiscoveryNetworkFields;
  deviceName: string;
  category: string;
  householdId: string;
  userId: string;
}): Record<string, unknown> {
  const {
    discovery,
    deviceName,
    category,
    householdId,
    userId,
  } = input;

  return {
    household_id: householdId,
    user_id: userId,
    device_name: deviceName,
    category,
    brand: discovery.manufacturer,
    manufacturer: discovery.manufacturer,
    model_number: discovery.model,
    ip_address: discovery.ipAddress,
    mac_address: normalizeMacAddress(
      discovery.macAddress
    ) || null,
    hostname: discovery.hostname,
    online: discovery.online,
    last_seen_at: discovery.lastSeenAt,
    first_seen_at: discovery.firstSeenAt,
    discovery_source:
      discovery.discoverySource,
    connector_id: discovery.connectorId,
    network_fingerprint:
      discovery.networkFingerprint,
    location: "Network",
    notes:
      "Discovered by the Home Tech Vault Connector. Review this record and add its correct room, purchase details, warranty information, photos, and documents.",
  };
}

export function suggestImportedDeviceName(
  discovery: Pick<
    DiscoveryNetworkFields,
    "hostname" | "manufacturer" | "ipAddress"
  >
): string {
  const cleanedHostname = cleanDiscoveredHostname(
    discovery.hostname
  );

  if (cleanedHostname) {
    return cleanedHostname;
  }

  const hostname = discovery.hostname?.trim();

  if (hostname) {
    return hostname;
  }

  if (discovery.manufacturer?.trim()) {
    return discovery.manufacturer.trim();
  }

  if (discovery.ipAddress) {
    return `Network Device ${discovery.ipAddress}`;
  }

  return "Network Device";
}

export function resolveImportedDeviceName(input: {
  recognitionStatus?: string | null;
  recognitionAcceptedName?: string | null;
  friendlyName?: string | null;
  identificationDisplayName?: string | null;
  hostname?: string | null;
  manufacturer?: string | null;
  category?: string | null;
  existingDeviceName?: string | null;
  allowRename?: boolean;
}): string {
  const {
    recognitionStatus,
    recognitionAcceptedName,
    friendlyName,
    identificationDisplayName,
    hostname,
    manufacturer,
    category,
    existingDeviceName,
    allowRename,
  } = input;

  const preservedExistingName =
    existingDeviceName?.trim() || null;

  if (preservedExistingName && !allowRename) {
    return preservedExistingName;
  }

  const acceptedName =
    recognitionStatus === "accepted"
      ? recognitionAcceptedName?.trim() || null
      : null;
  const acceptedFriendlyName =
    recognitionStatus === "accepted"
      ? friendlyName?.trim() || null
      : null;
  const confirmedFriendlyName =
    friendlyName?.trim() || null;
  const displayName =
    identificationDisplayName?.trim() || null;
  const cleanedHostname =
    cleanDiscoveredHostname(hostname);
  const manufacturerCategoryFallback = [
    manufacturer?.trim() || null,
    category?.trim() || null,
  ]
    .filter((value) => Boolean(value))
    .join(" ")
    .trim();

  return (
    acceptedName ??
    acceptedFriendlyName ??
    confirmedFriendlyName ??
    displayName ??
    cleanedHostname ??
    (manufacturerCategoryFallback || null) ??
    "Unknown device"
  );
}

export function guessDiscoveryCategory(
  hostname: string | null | undefined,
  manufacturer: string | null | undefined,
  deviceType: string | null | undefined
): string {
  if (deviceType?.trim()) {
    return deviceType.trim();
  }

  const haystack = `${hostname ?? ""} ${manufacturer ?? ""}`
    .toLowerCase()
    .trim();

  if (
    haystack.includes("iphone") ||
    haystack.includes("ipad") ||
    haystack.includes("android") ||
    haystack.includes("pixel")
  ) {
    return "Mobile";
  }

  if (
    haystack.includes("macbook") ||
    haystack.includes("imac") ||
    haystack.includes("laptop") ||
    haystack.includes("desktop")
  ) {
    return "Computer";
  }

  if (
    haystack.includes("tv") ||
    haystack.includes("roku") ||
    haystack.includes("apple-tv")
  ) {
    return "TV & Streaming";
  }

  if (
    haystack.includes("router") ||
    haystack.includes("gateway") ||
    haystack.includes("eero") ||
    haystack.includes("unifi")
  ) {
    return "Networking";
  }

  if (
    haystack.includes("nest") ||
    haystack.includes("echo") ||
    haystack.includes("homepod") ||
    haystack.includes("speaker")
  ) {
    return "Smart Home";
  }

  return "Other";
}
