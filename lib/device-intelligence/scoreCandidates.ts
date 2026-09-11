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

function normalizedEvidenceValue(
  value: string | null | undefined
): string {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function observedManufacturerMatches(
  manufacturer: string | null,
  aliases: string[]
): boolean {
  if (!manufacturer?.trim()) {
    return false;
  }

  const normalized =
    normalizeVendorName(manufacturer);

  if (!normalized) {
    return false;
  }

  return aliases.includes(normalized);
}

function isGenericDiscoveredModel(
  model: string | null
): boolean {
  const normalized =
    model?.trim().toLowerCase() ?? "";

  return [
    "network printer",
    "google cast device",
    "airplay device",
    "homekit accessory",
    "unknown",
    "unknown device",
  ].includes(normalized);
}

function observedModelMatches(
  model: string | null,
  entry: DeviceCatalogEntry
): boolean {
  if (
    !model?.trim() ||
    isGenericDiscoveredModel(model)
  ) {
    return false;
  }

  const observed =
    normalizedEvidenceValue(model);

  if (!observed) {
    return false;
  }

  const candidates = [
    entry.family,
    entry.suggestedName,
  ]
    .filter(
      (value): value is string =>
        Boolean(value?.trim())
    )
    .map(normalizedEvidenceValue)
    .filter(Boolean);

  return candidates.some(
    (candidate) =>
      candidate === observed ||
      candidate.includes(observed) ||
      observed.includes(candidate)
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
  ]
    .map((name) => normalizeVendorName(name))
    .filter(
      (name): name is string =>
        Boolean(name)
    );

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

  /*
   * Device-reported manufacturer/model metadata can be much
   * stronger than MAC/OUI evidence.
   *
   * Avoid double-counting manufacturer when it is merely the
   * same OUI vendor we already scored.
   */
  const observedManufacturer =
    observation.manufacturer?.trim()
      ? normalizeVendorName(
          observation.manufacturer
        )
      : null;

  const manufacturerIsSameAsOui =
    Boolean(
      observedManufacturer &&
      vendor &&
      observedManufacturer === vendor
    );

  if (
    observedManufacturer &&
    !manufacturerIsSameAsOui &&
    observedManufacturerMatches(
      observation.manufacturer,
      aliases
    )
  ) {
    const item = evidence({
      type: "upnp_manufacturer",
      label:
        `Device reports manufacturer ${observation.manufacturer}`,
      value: observation.manufacturer,
      weight:
        EVIDENCE_WEIGHTS.upnpManufacturer,
      reliability: "strong",
    });

    evidenceList.push(item);
    rawScore += item.weight;
  } else if (
    observedManufacturer &&
    !manufacturerIsSameAsOui &&
    entry.manufacturer !== "Unknown" &&
    !aliases.includes(
      observedManufacturer
    )
  ) {
    conflicts.push(
      evidence({
        type: "upnp_manufacturer",
        label:
          `Device reports ${observation.manufacturer}, not ${entry.manufacturer}`,
        value:
          observation.manufacturer,
        weight:
          EVIDENCE_WEIGHTS.upnpManufacturer,
        reliability: "strong",
        matched: false,
      })
    );
  }

  if (
    observedModelMatches(
      observation.model,
      entry
    )
  ) {
    const item = evidence({
      type: "upnp_model",
      label:
        `Device-reported model matches ${entry.family}`,
      value: observation.model,
      weight:
        EVIDENCE_WEIGHTS.upnpExactModel,
      reliability: "strong",
    });

    evidenceList.push(item);
    rawScore += item.weight;
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

  /*
   * Positive evidence should not simply overpower contradictory
   * evidence.
   *
   * Conflict evidence already has meaningful weights, so use
   * those same weights as an explainable penalty rather than
   * introducing an unrelated hidden number.
   *
   * Example:
   *
   *   Chromecast hostname       +40
   *   Google Cast service       +31
   *   reports Samsung           -45
   *                              ---
   *   adjusted score             26
   *
   * That remains a suggestion instead of becoming a confident
   * Google-device match.
   */
  const conflictPenalty = Math.min(
    70,
    conflicts.reduce(
      (total, item) =>
        total + Math.max(0, item.weight),
      0
    )
  );

  const adjustedRawScore = Math.max(
    0,
    rawScore - conflictPenalty
  );

  const score =
    normalizeScoreTo100(adjustedRawScore);

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
