/**
 * MAC address helpers for Device Intelligence v3.
 * Private/randomized MACs must not drive manufacturer certainty.
 */

export function normalizeMacAddress(
  value: unknown
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const compact = value
    .trim()
    .toLowerCase()
    .replace(/[^0-9a-f]/g, "");

  if (
    compact.length !== 12 ||
    !/^[0-9a-f]{12}$/.test(compact)
  ) {
    return null;
  }

  return compact.match(/.{2}/g)!.join(":");
}

export function isBroadcastMac(mac: string): boolean {
  return mac === "ff:ff:ff:ff:ff:ff";
}

export function isMulticastMac(mac: string): boolean {
  const firstOctet = Number.parseInt(mac.split(":")[0]!, 16);

  return (
    Number.isFinite(firstOctet) &&
    (firstOctet & 0b1) !== 0
  );
}

/**
 * IEEE locally administered bit (bit 1 of the first octet).
 * Private/randomized MACs set this bit and must not use OUI vendor lookup.
 */
export function isLocallyAdministeredMac(mac: string): boolean {
  const firstOctet = Number.parseInt(mac.split(":")[0]!, 16);

  return (
    Number.isFinite(firstOctet) &&
    (firstOctet & 0b10) !== 0
  );
}

export function isEmptyOrInvalidMac(
  value: unknown
): boolean {
  return normalizeMacAddress(value) === null;
}

export function getOuiPrefix(mac: string): string | null {
  const normalized = normalizeMacAddress(mac);

  if (!normalized) {
    return null;
  }

  return normalized.replace(/:/g, "").slice(0, 6);
}

/**
 * Stable MAC suitable for identity / OUI lookup.
 * Broadcast, multicast, and locally administered MACs are unsuitable.
 */
export function isStableMacForIdentity(mac: string): boolean {
  const normalized = normalizeMacAddress(mac);

  if (!normalized) {
    return false;
  }

  if (isBroadcastMac(normalized)) {
    return false;
  }

  if (isMulticastMac(normalized)) {
    return false;
  }

  if (isLocallyAdministeredMac(normalized)) {
    return false;
  }

  return true;
}

export function maskMacAddress(mac: string | null): string | null {
  const normalized = normalizeMacAddress(mac);

  if (!normalized) {
    return null;
  }

  const parts = normalized.split(":");
  return `${parts[0]}:${parts[1]}:${parts[2]}:••:••:••`;
}
