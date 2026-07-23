const GENERIC_HOSTNAME_PREFIXES = [
  "network device",
  "unknown",
  "localhost",
];

/**
 * Normalize a MAC address to lowercase colon-separated pairs.
 */
export function normalizeMacAddress(
  value: string | null | undefined
): string {
  if (!value?.trim()) {
    return "";
  }

  const hex = value
    .replace(/[^0-9a-fA-F]/g, "")
    .toLowerCase();

  if (hex.length !== 12) {
    return "";
  }

  return hex.match(/.{1,2}/g)!.join(":");
}

/**
 * Normalize hostname / device name for comparison.
 */
export function normalizeHostname(
  value: string | null | undefined
): string {
  if (!value?.trim()) {
    return "";
  }

  return value
   .trim()
    .toLowerCase()
    .replace(/\.local$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeManufacturer(
  value: string | null | undefined
): string {
  if (!value?.trim()) {
    return "";
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeModel(
  value: string | null | undefined
): string {
  if (!value?.trim()) {
    return "";
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeSerialNumber(
  value: string | null | undefined
): string {
  if (!value?.trim()) {
    return "";
  }

  return value.trim().toUpperCase();
}

export function normalizeCategory(
  value: string | null | undefined
): string {
  if (!value?.trim()) {
    return "";
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function isGenericHostname(
  value: string | null | undefined
): boolean {
  const normalized = normalizeHostname(value);

  if (!normalized) {
    return true;
  }

  return GENERIC_HOSTNAME_PREFIXES.some(
    (prefix) =>
      normalized === prefix ||
      normalized.startsWith(`${prefix}-`)
  );
}

/**
 * Build a stable local fingerprint for connector discovery payloads.
 * Never rely on IP alone.
 */
export function computeStableFingerprint(input: {
  macAddress?: string | null;
  hostname?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  serialNumber?: string | null;
}): string {
  const mac = normalizeMacAddress(
    input.macAddress
  );

  if (mac) {
    return `mac:${mac}`;
  }

  const serial = normalizeSerialNumber(
    input.serialNumber
  );

  if (serial) {
    return `serial:${serial}`;
  }

  const hostname = normalizeHostname(
    input.hostname
  );
  const manufacturer = normalizeManufacturer(
    input.manufacturer
  );
  const model = normalizeModel(input.model);

  const parts = [
    hostname && !isGenericHostname(hostname)
      ? `host:${hostname}`
      : "",
    manufacturer ? `mfg:${manufacturer}` : "",
    model ? `model:${model}` : "",
  ].filter(Boolean);

  if (parts.length === 0) {
    throw new Error(
      "Unable to compute a stable fingerprint without MAC, serial, or identifying metadata."
    );
  }

  return parts.join("|");
}

export function vaultDeviceFingerprint(
  device: {
    macAddress?: string | null;
    networkFingerprint?: string | null;
    serialNumber?: string | null;
  }
): string {
  if (device.networkFingerprint?.trim()) {
    return device.networkFingerprint.trim();
  }

  const mac = normalizeMacAddress(
    device.macAddress
  );

  if (mac) {
    return `mac:${mac}`;
  }

  const serial = normalizeSerialNumber(
    device.serialNumber
  );

  if (serial) {
    return `serial:${serial}`;
  }

  return "";
}

export function hostnamesLikelyMatch(
  first: string | null | undefined,
  second: string | null | undefined
): boolean {
  const normalizedFirst =
    normalizeHostname(first);
  const normalizedSecond =
    normalizeHostname(second);

  if (
    !normalizedFirst ||
    !normalizedSecond ||
    isGenericHostname(normalizedFirst) ||
    isGenericHostname(normalizedSecond)
  ) {
    return false;
  }

  if (normalizedFirst === normalizedSecond) {
    return true;
  }

  return (
    normalizedFirst.includes(
      normalizedSecond
    ) ||
    normalizedSecond.includes(
      normalizedFirst
    )
  );
}

export function manufacturerIsMoreSpecific(
  existing: string | null | undefined,
  incoming: string | null | undefined
): boolean {
  const normalizedExisting =
    normalizeManufacturer(existing);
  const normalizedIncoming =
    normalizeManufacturer(incoming);

  if (!normalizedIncoming) {
    return false;
  }

  if (!normalizedExisting) {
    return true;
  }

  if (
    normalizedIncoming === normalizedExisting
  ) {
    return false;
  }

  return (
    normalizedIncoming.includes(
      normalizedExisting
    ) &&
    normalizedIncoming.length >
      normalizedExisting.length
  );
}

export function mergeDiscoverySources(
  existing: string[] | null | undefined,
  incoming: string | null | undefined
): string[] {
  const set = new Set(
    (existing ?? []).map((value) =>
      value.trim()
    ).filter(Boolean)
  );

  if (incoming?.trim()) {
    set.add(incoming.trim());
  }

  return [...set];
}
