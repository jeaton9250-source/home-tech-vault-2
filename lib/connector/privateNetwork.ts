/**
 * RFC1918 and link-local private ranges allowed for connector discovery sync.
 */
export function isPrivateIpAddress(
  value: string | null | undefined
): boolean {
  if (!value?.trim()) {
    return false;
  }

  const parts = value
    .trim()
    .split(".")
    .map((part) => Number.parseInt(part, 10));

  if (parts.length !== 4) {
    return false;
  }

  if (parts.some((part) => !Number.isFinite(part) || part < 0 || part > 255)) {
    return false;
  }

  const [a, b] = parts;

  if (a === 10) {
    return true;
  }

  if (a === 172 && b >= 16 && b <= 31) {
    return true;
  }

  if (a === 192 && b === 168) {
    return true;
  }

  if (a === 169 && b === 254) {
    return true;
  }

  return false;
}

export function assertPrivateIpAddress(
  value: string | null | undefined,
  fieldLabel: string
): string | null {
  if (!value) {
    return null;
  }

  if (!isPrivateIpAddress(value)) {
    throw new Error(
      `${fieldLabel} must be a private local network address.`
    );
  }

  return value.trim();
}
