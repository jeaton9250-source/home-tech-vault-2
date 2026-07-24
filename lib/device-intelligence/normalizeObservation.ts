import { analyzeHostname } from "@/lib/device-intelligence/hostnameRules";
import {
  isLocallyAdministeredMac,
  isBroadcastMac,
  isMulticastMac,
  normalizeMacAddress,
} from "@/lib/device-intelligence/macAddress";
import { lookupMacVendorSync } from "@/lib/device-intelligence/vendorLookup";
import { normalizeVendorName } from "@/lib/device-intelligence/vendorAliases";
import type {
  NormalizedObservation,
  RawDiscoveryObservation,
} from "@/lib/device-intelligence/types";

export function normalizeObservation(
  raw: RawDiscoveryObservation
): NormalizedObservation {
  const macAddress = normalizeMacAddress(raw.macAddress);
  const isPrivateMac = macAddress
    ? isLocallyAdministeredMac(macAddress)
    : false;
  const vendorResult = macAddress
    ? lookupMacVendorSync(macAddress)
    : null;

  const hostnameAnalysis = analyzeHostname(raw.hostname);
  const manufacturerFromPayload = normalizeVendorName(
    raw.manufacturer
  );

  // Never trust OUI vendor for private MACs
  const macVendor =
    isPrivateMac || !vendorResult?.vendor
      ? null
      : vendorResult.vendor;

  return {
    observationId:
      raw.observationId?.trim() ||
      raw.localFingerprint?.trim() ||
      `obs-${macAddress ?? raw.ipAddress ?? "unknown"}`,
    ipAddress: raw.ipAddress?.trim() || null,
    macAddress,
    isPrivateMac,
    isBroadcastMac: macAddress
      ? isBroadcastMac(macAddress)
      : false,
    isMulticastMac: macAddress
      ? isMulticastMac(macAddress)
      : false,
    macVendor,
    macVendorConfidence: isPrivateMac
      ? "none"
      : vendorResult?.confidence ?? "none",
    hostnameOriginal: raw.hostname?.trim() || null,
    hostnameNormalized: hostnameAnalysis.normalized,
    manufacturer:
      manufacturerFromPayload ||
      (isPrivateMac ? null : macVendor),
    model: raw.model?.trim() || null,
    friendlyName: raw.friendlyName?.trim() || null,
    mdnsServices: (raw.mdnsServices ?? []).filter(Boolean),
    ssdpDeviceType: raw.ssdpDeviceType?.trim() || null,
    ssdpDescriptionUrl:
      raw.ssdpDescriptionUrl?.trim() || null,
    discoverySources: (raw.discoverySources ?? []).filter(
      Boolean
    ),
    localFingerprint: raw.localFingerprint?.trim() || null,
    firstSeenAt: raw.firstSeenAt ?? null,
    lastSeenAt: raw.lastSeenAt ?? null,
    online: raw.online ?? true,
  };
}
