import {
  DEVICE_SIGNATURES,
  isChipsetVendor,
  type DeviceCategory,
  type DeviceSignature,
} from "@/lib/connector/deviceSignatures";
import {
  isGenericHostname,
  normalizeHostname,
  normalizeManufacturer,
} from "@/lib/connector/network";

export type IdentificationConfidence =
  | "exact"
  | "high"
  | "medium"
  | "low"
  | "unknown";

export type DiscoveryObservation = {
  ipAddress?: string | null;
  macAddress?: string | null;
  hostname?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  friendlyName?: string | null;
  discoverySources?: string[];
  mdnsServices?: string[];
  ssdpDeviceType?: string | null;
  ssdpDescriptionUrl?: string | null;
  stableFingerprint?: string | null;
  firstSeenAt?: string | null;
  lastSeenAt?: string | null;
};

export type IdentificationResult = {
  likelyCategory: DeviceCategory | null;
  likelyBrand: string | null;
  friendlyName: string | null;
  model: string | null;
  identificationConfidence: IdentificationConfidence;
  identificationReasons: string[];
  displayName: string;
};

type SignatureMatch = {
  signature: DeviceSignature;
  reason: string;
};

function haystack(input: DiscoveryObservation): string {
  return [
    input.hostname,
    input.manufacturer,
    input.model,
    input.friendlyName,
    input.ssdpDeviceType,
    ...(input.mdnsServices ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchesPattern(
  value: string | null | undefined,
  patterns: RegExp[] | undefined
): boolean {
  if (!patterns?.length || !value?.trim()) {
    return false;
  }

  return patterns.some((pattern) => pattern.test(value));
}

function matchesAnyPattern(
  values: string[],
  patterns: RegExp[] | undefined
): boolean {
  if (!patterns?.length) {
    return false;
  }

  return values.some((value) =>
    matchesPattern(value, patterns)
  );
}

function evaluateSignature(
  observation: DiscoveryObservation,
  signature: DeviceSignature
): SignatureMatch | null {
  const manufacturer = observation.manufacturer ?? "";
  const hostname = observation.hostname ?? "";
  const model = observation.model ?? "";
  const ssdp = observation.ssdpDeviceType ?? "";
  const mdns = observation.mdnsServices ?? [];

  const matched =
    matchesPattern(manufacturer, signature.manufacturerPatterns) ||
    matchesPattern(hostname, signature.hostnamePatterns) ||
    matchesPattern(model, signature.modelPatterns) ||
    matchesPattern(ssdp, signature.ssdpDeviceTypePatterns) ||
    matchesAnyPattern(mdns, signature.mdnsServicePatterns);

  if (!matched) {
    return null;
  }

  return {
    signature,
    reason: signature.reasonTemplate,
  };
}

function scoreToConfidence(
  score: number,
  independentSignals: number,
  hasChipsetOnly: boolean
): IdentificationConfidence {
  if (score <= 0 || independentSignals === 0) {
    return "unknown";
  }

  if (hasChipsetOnly && independentSignals === 1) {
    return "low";
  }

  if (independentSignals >= 3 || score >= 8) {
    return "high";
  }

  if (independentSignals >= 2 || score >= 5) {
    return "medium";
  }

  if (score >= 2) {
    return "low";
  }

  return "unknown";
}

function pickPrimaryMatch(
  matches: SignatureMatch[]
): SignatureMatch | null {
  if (matches.length === 0) {
    return null;
  }

  return [...matches].sort(
    (first, second) =>
      second.signature.weight - first.signature.weight
  )[0]!;
}

function buildDisplayName(
  brand: string | null,
  category: DeviceCategory | null,
  friendlyName: string | null,
  hostname: string | null
): string {
  if (friendlyName?.trim()) {
    return friendlyName.trim();
  }

  if (brand && brand !== "Unknown" && category && category !== "Unknown") {
    return `Likely ${brand} ${category}`;
  }

  if (category && category !== "Unknown") {
    return `Likely ${category}`;
  }

  if (hostname && !isGenericHostname(hostname)) {
    return hostname;
  }

  return "Unknown Smart Home Device";
}

/**
 * Heuristic identification from passive discovery observations.
 * Does not claim perfect product-level identification.
 */
export function identifyDiscoveredDevice(
  observation: DiscoveryObservation
): IdentificationResult {
  const matches = DEVICE_SIGNATURES.flatMap((signature) => {
    const match = evaluateSignature(
      observation,
      signature
    );
    return match ? [match] : [];
  });

  const primary = pickPrimaryMatch(matches);
  const reasons = [
    ...new Set(matches.map((match) => match.reason)),
  ];

  let score = matches.reduce(
    (total, match) =>
      total + match.signature.weight,
    0
  );

  const independentSignals = countIndependentSignals(
    observation,
    matches
  );

  const chipsetOnlyMatch =
    matches.length === 1 &&
    matches[0]?.signature.chipsetOnly === true;

  if (isChipsetVendor(observation.manufacturer) && independentSignals <= 1) {
    score = Math.min(score, 2);
  }

  const identificationConfidence = scoreToConfidence(
    score,
    independentSignals,
    chipsetOnlyMatch || isChipsetVendor(observation.manufacturer)
  );

  const likelyCategory =
    primary?.signature.category ??
    guessCategoryFromHaystack(haystack(observation));

  const likelyBrand =
    primary?.signature.brand &&
    primary.signature.brand !== "Unknown"
      ? primary.signature.brand
      : manufacturerBrand(observation.manufacturer);

  const friendlyName =
    observation.friendlyName?.trim() ||
    (hostnameLabel(observation.hostname) &&
    identificationConfidence !== "unknown"
      ? buildDisplayName(
          likelyBrand,
          likelyCategory,
          null,
          observation.hostname ?? null
        )
      : null);

  const displayName = buildDisplayName(
    likelyBrand,
    likelyCategory,
    friendlyName,
    observation.hostname ?? null
  );

  if (reasons.length === 0) {
    if (observation.manufacturer) {
      reasons.push(
        `Manufacturer is ${observation.manufacturer}`
      );
    } else if (observation.hostname) {
      reasons.push(
        `Hostname is ${observation.hostname}`
      );
    } else {
      reasons.push("Insufficient evidence for identification");
    }
  }

  if (
    identificationConfidence === "unknown" &&
    !reasons.includes("Insufficient evidence for identification")
  ) {
    reasons.push("Needs identification");
  }

  return {
    likelyCategory,
    likelyBrand,
    friendlyName,
    model: observation.model?.trim() || null,
    identificationConfidence,
    identificationReasons: reasons,
    displayName,
  };
}

export function identificationFromConfirmedVaultDevice(input: {
  deviceName: string | null;
  brand: string | null;
  manufacturer: string | null;
  modelNumber: string | null;
  category: string | null;
}): IdentificationResult {
  const displayName =
    input.deviceName?.trim() ||
    input.modelNumber?.trim() ||
    input.manufacturer?.trim() ||
    "Confirmed device";

  return {
    likelyCategory: (input.category as DeviceCategory) || null,
    likelyBrand:
      input.brand?.trim() ||
      input.manufacturer?.trim() ||
      null,
    friendlyName: input.deviceName?.trim() || null,
    model: input.modelNumber?.trim() || null,
    identificationConfidence: "exact",
    identificationReasons: [
      "Previously confirmed by household member",
      "Stable fingerprint relationship preserved",
    ],
    displayName,
  };
}

export function resolveDiscoveredIdentification(input: {
  observation: DiscoveryObservation;
  importedDeviceId?: string | null;
  matchConfirmedAt?: string | null;
  confirmedVaultDevice?: {
    deviceName: string | null;
    brand: string | null;
    manufacturer: string | null;
    modelNumber: string | null;
    category: string | null;
  } | null;
  stored?: Partial<IdentificationResult> | null;
}): IdentificationResult {
  if (
    input.importedDeviceId &&
    input.matchConfirmedAt &&
    input.confirmedVaultDevice
  ) {
    return identificationFromConfirmedVaultDevice(
      input.confirmedVaultDevice
    );
  }

  if (
    input.importedDeviceId &&
    input.confirmedVaultDevice
  ) {
    return identificationFromConfirmedVaultDevice(
      input.confirmedVaultDevice
    );
  }

  if (
    input.stored?.identificationConfidence &&
    input.stored.displayName
  ) {
    return {
      likelyCategory:
        (input.stored.likelyCategory as DeviceCategory) ??
        null,
      likelyBrand: input.stored.likelyBrand ?? null,
      friendlyName: input.stored.friendlyName ?? null,
      model: input.stored.model ?? null,
      identificationConfidence:
        input.stored.identificationConfidence,
      identificationReasons:
        input.stored.identificationReasons ?? [],
      displayName: input.stored.displayName,
    };
  }

  return identifyDiscoveredDevice(input.observation);
}

export function needsIdentificationReview(
  confidence: IdentificationConfidence | null | undefined
): boolean {
  return (
    confidence === "unknown" ||
    confidence === "medium"
  );
}

export function formatIdentificationConfidenceLabel(
  confidence: IdentificationConfidence | null | undefined
): string {
  switch (confidence) {
    case "exact":
      return "Exact identity";
    case "high":
      return "High confidence";
    case "medium":
      return "Possible match";
    case "low":
      return "Low-confidence suggestion";
    default:
      return "Unknown device";
  }
}

function countIndependentSignals(
  observation: DiscoveryObservation,
  matches: SignatureMatch[]
): number {
  const signalKinds = new Set<string>();

  if (normalizeManufacturer(observation.manufacturer)) {
    signalKinds.add("manufacturer");
  }

  if (
    observation.hostname &&
    !isGenericHostname(observation.hostname)
  ) {
    signalKinds.add("hostname");
  }

  if ((observation.mdnsServices?.length ?? 0) > 0) {
    signalKinds.add("mdns");
  }

  if (observation.ssdpDeviceType?.trim()) {
    signalKinds.add("ssdp");
  }

  if (observation.model?.trim()) {
    signalKinds.add("model");
  }

  if (matches.length > 0 && signalKinds.size === 0) {
    signalKinds.add("signature");
  }

  return signalKinds.size;
}

function manufacturerBrand(
  manufacturer: string | null | undefined
): string | null {
  if (!manufacturer?.trim()) {
    return null;
  }

  return manufacturer.trim();
}

function hostnameLabel(
  hostname: string | null | undefined
): boolean {
  return Boolean(
    hostname?.trim() &&
      !isGenericHostname(hostname)
  );
}

function guessCategoryFromHaystack(
  value: string
): DeviceCategory | null {
  if (!value.trim()) {
    return null;
  }

  if (/router|gateway|mesh|unifi|eero|orbi/.test(value)) {
    return "Router / Mesh System";
  }

  if (/printer|ipp|deskjet|laserjet/.test(value)) {
    return "Printer";
  }

  if (/iphone|ipad|android|pixel|galaxy/.test(value)) {
    return "Phone / Tablet";
  }

  if (/macbook|imac|desktop|laptop|surface/.test(value)) {
    return "Computer";
  }

  if (/roku|chromecast|firetv|appletv|shield/.test(value)) {
    return "Streaming Device";
  }

  if (/echo|homepod|sonos|speaker|alexa|nest/.test(value)) {
    return "Smart Speaker";
  }

  if (/ring|doorbell|camera|arlo|wyze/.test(value)) {
    return /doorbell|ring/.test(value) ? "Doorbell" : "Camera";
  }

  if (/apex|neptune|hydros|ghl|reef|aquarium|doser|radion/.test(value)) {
    if (/light|radion|reef-light/.test(value)) {
      return "Aquarium Lighting";
    }
    if (/pump|vectra|mp\d+/.test(value)) {
      return "Aquarium Pump";
    }
    if (/feeder/.test(value)) {
      return "Aquarium Feeder";
    }
    if (/monitor|trident|seneye/.test(value)) {
      return "Aquarium Monitor";
    }
    return "Aquarium Controller";
  }

  return null;
}

export function classifyMdnsService(
  serviceType: string
): { category: DeviceCategory; reason: string } | null {
  const observation: DiscoveryObservation = {
    mdnsServices: [serviceType],
  };
  const result = identifyDiscoveredDevice(observation);

  if (!result.likelyCategory) {
    return null;
  }

  return {
    category: result.likelyCategory,
    reason:
      result.identificationReasons[0] ??
      "mDNS service classification",
  };
}

export function classifySsdpDeviceType(
  deviceType: string
): { category: DeviceCategory; reason: string } | null {
  const observation: DiscoveryObservation = {
    ssdpDeviceType: deviceType,
  };
  const result = identifyDiscoveredDevice(observation);

  if (!result.likelyCategory) {
    return null;
  }

  return {
    category: result.likelyCategory,
    reason:
      result.identificationReasons[0] ??
      "SSDP device type classification",
  };
}

export function classifyMacManufacturer(
  manufacturer: string
): { category: DeviceCategory; confidence: IdentificationConfidence; reason: string } | null {
  const observation: DiscoveryObservation = {
    manufacturer,
  };
  const result = identifyDiscoveredDevice(observation);

  if (!result.likelyCategory) {
    return null;
  }

  return {
    category: result.likelyCategory,
    confidence: result.identificationConfidence,
    reason:
      result.identificationReasons[0] ??
      "Manufacturer classification",
  };
}
