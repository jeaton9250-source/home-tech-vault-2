import {
  identifyDiscoveredDevice,
  resolveDiscoveredIdentification,
  type IdentificationResult,
} from "@/lib/connector/deviceIdentification";

import type { ParsedDiscoveryDevice } from "@/lib/connector/discoveryValidation";

export function buildIdentificationForParsedDevice(
  device: ParsedDiscoveryDevice
): IdentificationResult {
  return identifyDiscoveredDevice({
    ipAddress: device.ipAddress,
    macAddress: device.macAddress,
    hostname: device.hostname,
    manufacturer: device.manufacturer,
    model: device.model,
    friendlyName: device.friendlyName,
    discoverySources: device.discoverySources,
    mdnsServices: device.mdnsServices,
    ssdpDeviceType: device.ssdpDeviceType,
    ssdpDescriptionUrl: device.ssdpDescriptionUrl,
    stableFingerprint: device.localFingerprint,
    firstSeenAt: device.firstSeenAt,
    lastSeenAt: device.lastSeenAt,
  });
}

export function identificationFieldsFromResult(
  result: IdentificationResult
): {
  likely_category: string | null;
  likely_brand: string | null;
  identification_confidence: string;
  identification_reasons: string[];
  identification_display_name: string;
} {
  return {
    likely_category: result.likelyCategory,
    likely_brand: result.likelyBrand,
    identification_confidence: result.identificationConfidence,
    identification_reasons: result.identificationReasons,
    identification_display_name: result.displayName,
  };
}

export function resolveIdentificationForStoredRow(input: {
  device: ParsedDiscoveryDevice;
  importedDeviceId?: string | null;
  matchConfirmedAt?: string | null;
  confirmedVaultDevice?: {
    deviceName: string | null;
    brand: string | null;
    manufacturer: string | null;
    modelNumber: string | null;
    category: string | null;
  } | null;
  stored?: {
    likely_category?: string | null;
    likely_brand?: string | null;
    friendly_name?: string | null;
    identification_confidence?: string | null;
    identification_reasons?: string[] | null;
    identification_display_name?: string | null;
    model?: string | null;
  } | null;
}): IdentificationResult {
  return resolveDiscoveredIdentification({
    observation: {
      ipAddress: input.device.ipAddress,
      macAddress: input.device.macAddress,
      hostname: input.device.hostname,
      manufacturer: input.device.manufacturer,
      model: input.device.model,
      friendlyName: input.device.friendlyName,
      discoverySources: input.device.discoverySources,
      mdnsServices: input.device.mdnsServices,
      ssdpDeviceType: input.device.ssdpDeviceType,
      ssdpDescriptionUrl: input.device.ssdpDescriptionUrl,
      stableFingerprint: input.device.localFingerprint,
    },
    importedDeviceId: input.importedDeviceId,
    matchConfirmedAt: input.matchConfirmedAt,
    confirmedVaultDevice: input.confirmedVaultDevice,
    stored: input.stored
      ? {
          likelyCategory:
            (input.stored.likely_category as IdentificationResult["likelyCategory"]) ??
            null,
          likelyBrand: input.stored.likely_brand ?? null,
          friendlyName: input.stored.friendly_name ?? null,
          model: input.stored.model ?? null,
          identificationConfidence:
            input.stored.identification_confidence as IdentificationResult["identificationConfidence"],
          identificationReasons:
            input.stored.identification_reasons ?? [],
          displayName:
            input.stored.identification_display_name ?? "",
        }
      : null,
  });
}
