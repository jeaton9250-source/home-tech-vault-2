import type { DeviceCatalogEntry } from "@/lib/device-intelligence/catalog";
import { DEVICE_CATALOG } from "@/lib/device-intelligence/catalog";
import { analyzeHostname } from "@/lib/device-intelligence/hostnameRules";
import type { NormalizedObservation } from "@/lib/device-intelligence/types";
import {
  EVIDENCE_WEIGHTS,
  type DeviceCandidate,
  type DiscoveryEvidence,
} from "@/lib/device-intelligence/types";
import {
  classifyConfidence,
  normalizeScoreTo100,
} from "@/lib/device-intelligence/classifyConfidence";
import { normalizeVendorName } from "@/lib/device-intelligence/vendorAliases";

function evidence(
  partial: Omit<DiscoveryEvidence, "matched"> & {
    matched?: boolean;
  }
): DiscoveryEvidence {
  return {
    matched: partial.matched ?? true,
    ...partial,
  };
}

function serviceMatches(
  observed: string[],
  catalogServices: string[] | undefined
): string[] {
  if (!catalogServices?.length) {
    return [];
  }

  return catalogServices.filter((service) =>
    observed.some((entry) =>
      entry.toLowerCase().includes(
        service.replace(/\._tcp$/i, "").toLowerCase()
      ) ||
      entry.toLowerCase().includes(service.toLowerCase())
    )
  );
}

function scoreCatalogEntry(
  observation: NormalizedObservation,
  entry: DeviceCatalogEntry
): DeviceCandidate | null {
  const evidenceList: DiscoveryEvidence[] = [];
  const conflicts: DiscoveryEvidence[] = [];
  let rawScore = 0;

  const vendor = observation.macVendor
    ? normalizeVendorName(observation.macVendor)
    : null;
  const aliases = [
    entry.manufacturer,
    ...(entry.vendorAliases ?? []),
  ].map((name) => normalizeVendorName(name));

  if (
    vendor &&
    aliases.includes(vendor) &&
    !observation.isPrivateMac &&
    observation.macVendorConfidence !== "none"
  ) {
    const item = evidence({
      type: "mac_vendor",
      label: `MAC vendor suggests ${vendor}`,
      value: vendor,
      weight: EVIDENCE_WEIGHTS.macVendor,
      reliability: "moderate",
    });
    evidenceList.push(item);
    rawScore += item.weight;
  } else if (
    vendor &&
    !aliases.includes(vendor) &&
    entry.manufacturer !== "Unknown" &&
    !observation.isPrivateMac
  ) {
    conflicts.push(
      evidence({
        type: "mac_vendor",
        label: `MAC vendor is ${vendor}, not ${entry.manufacturer}`,
        value: vendor,
        weight: EVIDENCE_WEIGHTS.macVendor,
        reliability: "moderate",
        matched: false,
      })
    );
  }

  if (observation.isPrivateMac) {
    evidenceList.push(
      evidence({
        type: "private_mac",
        label:
          "This device is using a private network address, so its manufacturer cannot be confirmed from the MAC address.",
        weight: 0,
        reliability: "weak",
        matched: true,
      })
    );
  }

  const hostname = analyzeHostname(
    observation.hostnameOriginal
  );

  if (
    entry.hostnamePatterns?.some((pattern) =>
      pattern.test(observation.hostnameNormalized ?? "")
    )
  ) {
    const weight =
      hostname.specificity === "product" ||
      hostname.specificity === "family"
        ? EVIDENCE_WEIGHTS.exactHostnameProductPattern
        : EVIDENCE_WEIGHTS.genericHostname;
    const item = evidence({
      type: "hostname",
      label:
        hostname.evidenceLabel ??
        `Hostname matches ${entry.family}`,
      value: observation.hostnameOriginal,
      weight,
      reliability:
        hostname.specificity === "generic"
          ? "weak"
          : "moderate",
    });
    evidenceList.push(item);
    rawScore += item.weight;
  }

  const matchedServices = serviceMatches(
    observation.mdnsServices,
    entry.mdnsServices
  );

  if (matchedServices.length > 0) {
    const item = evidence({
      type: "mdns_service",
      label: `mDNS services: ${matchedServices.join(", ")}`,
      value: matchedServices.join(", "),
      weight:
        matchedServices.length >= 2
          ? EVIDENCE_WEIGHTS.mdnsServiceCombination
          : Math.round(
              EVIDENCE_WEIGHTS.mdnsServiceCombination * 0.7
            ),
      reliability: "strong",
    });
    evidenceList.push(item);
    rawScore += item.weight;
  }

  if (
    observation.ssdpDeviceType &&
    entry.ssdpDeviceTypes?.some((pattern) =>
      pattern.test(observation.ssdpDeviceType!)
    )
  ) {
    const item = evidence({
      type: "ssdp_device_type",
      label: `SSDP device type matches ${entry.family}`,
      value: observation.ssdpDeviceType,
      weight: EVIDENCE_WEIGHTS.ssdpExactDeviceType,
      reliability: "strong",
    });
    evidenceList.push(item);
    rawScore += item.weight;
  }

  if (
    observation.friendlyName &&
    entry.friendlyNamePatterns?.some((pattern) =>
      pattern.test(observation.friendlyName!)
    )
  ) {
    const item = evidence({
      type: "upnp_friendly_name",
      label: "Friendly name matches catalog pattern",
      value: observation.friendlyName,
      weight: 30,
      reliability: "moderate",
    });
    evidenceList.push(item);
    rawScore += item.weight;
  }

  const meaningful = evidenceList.filter(
    (item) =>
      item.matched &&
      item.type !== "private_mac" &&
      item.weight > 0
  );

  if (meaningful.length === 0) {
    return null;
  }

  const onlyVendor =
    meaningful.length === 1 &&
    meaningful[0]?.type === "mac_vendor";

  if (onlyVendor) {
    rawScore = Math.min(rawScore, 30);
  }

  const score = normalizeScoreTo100(rawScore);
  const confidence = classifyConfidence(
    score,
    evidenceList,
    conflicts
  );

  return {
    catalogId: entry.id,
    manufacturer:
      entry.manufacturer === "Unknown"
        ? vendor
        : entry.manufacturer,
    family: entry.family,
    suggestedName: entry.suggestedName,
    category: entry.category,
    score,
    confidence: onlyVendor
      ? confidence === "unknown"
        ? "unknown"
        : "low"
      : confidence,
    evidence: evidenceList,
    conflictingEvidence: conflicts,
  };
}

export function scoreCandidates(
  observation: NormalizedObservation
): DeviceCandidate[] {
  const scored = DEVICE_CATALOG.map((entry) =>
    scoreCatalogEntry(observation, entry)
  ).filter((candidate): candidate is DeviceCandidate =>
    Boolean(candidate)
  );

  scored.sort((left, right) => right.score - left.score);

  return scored;
}
