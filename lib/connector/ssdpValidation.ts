import { isPrivateIpAddress } from "@/lib/connector/privateNetwork";

export const SSDP_FETCH_TIMEOUT_MS = 2500;
export const SSDP_MAX_RESPONSE_BYTES = 32_768;

export type ValidatedSsdpDescription = {
  url: string;
  host: string;
};

export class SsdpValidationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

/**
 * Validate an SSDP description URL before any local-network fetch.
 * Rejects public hosts, malformed URLs, and non-http(s) schemes.
 */
export function validateSsdpDescriptionUrl(
  rawUrl: string | null | undefined
): ValidatedSsdpDescription {
  if (!rawUrl?.trim()) {
    throw new SsdpValidationError(
      "missing_url",
      "SSDP description URL is missing."
    );
  }

  let parsed: URL;

  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new SsdpValidationError(
      "malformed_url",
      "SSDP description URL is malformed."
    );
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new SsdpValidationError(
      "invalid_scheme",
      "SSDP description URL must use http or https."
    );
  }

  const hostname = parsed.hostname.trim();

  if (!hostname) {
    throw new SsdpValidationError(
      "missing_host",
      "SSDP description URL is missing a host."
    );
  }

  if (!isPrivateIpAddress(hostname)) {
    throw new SsdpValidationError(
      "public_host",
      "SSDP description URL must point to a private local address."
    );
  }

  return {
    url: parsed.toString(),
    host: hostname,
  };
}

export function sanitizeSsdpMetadata(
  value: string | null | undefined
): string | null {
  if (!value?.trim()) {
    return null;
  }

  const trimmed = value.trim().slice(0, 512);

  return trimmed
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<\?[\s\S]*?\?>/g, "")
    .trim();
}

export function parseSsdpHeaders(
  payload: string
): Record<string, string> {
  const headers: Record<string, string> = {};

  for (const line of payload.split(/\r?\n/)) {
    const separator = line.indexOf(":");

    if (separator <= 0) {
      continue;
    }

    const key = line.slice(0, separator).trim().toUpperCase();
    const value = sanitizeSsdpMetadata(
      line.slice(separator + 1)
    );

    if (key && value) {
      headers[key] = value;
    }
  }

  return headers;
}

export function isMalformedSsdpPayload(
  payload: string | null | undefined
): boolean {
  if (!payload?.trim()) {
    return true;
  }

  const normalized = payload.trim();

  if (normalized.length > SSDP_MAX_RESPONSE_BYTES) {
    return true;
  }

  if (!/^(NOTIFY|M-SEARCH|HTTP\/1\.[01])/i.test(normalized)) {
    return true;
  }

  return false;
}

export function redirectTargetIsPrivate(
  locationHeader: string | null | undefined
): boolean {
  if (!locationHeader?.trim()) {
    return false;
  }

  try {
    validateSsdpDescriptionUrl(locationHeader);
    return true;
  } catch {
    return false;
  }
}

export function extractSsdpDeviceType(
  headers: Record<string, string>
): string | null {
  const st =
    headers.ST ??
    headers.NT ??
    headers.USN ??
    null;

  return sanitizeSsdpMetadata(st);
}

export function extractSsdpDescriptionUrl(
  headers: Record<string, string>
): string | null {
  const location = headers.LOCATION;

  if (!location) {
    return null;
  }

  try {
    return validateSsdpDescriptionUrl(location).url;
  } catch {
    return null;
  }
}
