import { CONNECTOR_MACOS_APP_VERSION } from "@/lib/connector/constants";

export const CONNECTOR_DOWNLOAD_UNAVAILABLE_MESSAGE =
  "Download coming soon.";

export type ResolveConnectorDownloadUrlOptions = {
  requireHttps?: boolean;
  allowLocalhost?: boolean;
};

function isLocalhostHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();

  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "[::1]" ||
    host.endsWith(".localhost")
  );
}

/**
 * Validates and normalizes a public connector download URL from env config.
 * Returns null when the value is missing, malformed, or disallowed in production.
 */
export function resolvePublicConnectorDownloadUrl(
  rawValue: string | undefined | null,
  options: ResolveConnectorDownloadUrlOptions = {}
): string | null {
  const trimmed = rawValue?.trim();

  if (!trimmed) {
    return null;
  }

  let parsed: URL;

  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return null;
  }

  const isProduction = process.env.NODE_ENV === "production";
  const requireHttps = options.requireHttps ?? isProduction;
  const allowLocalhost = options.allowLocalhost ?? !isProduction;

  if (requireHttps && parsed.protocol !== "https:") {
    return null;
  }

  if (!allowLocalhost && isLocalhostHostname(parsed.hostname)) {
    return null;
  }

  return parsed.toString();
}

/**
 * Public macOS connector download URL.
 * Set only when a real release artifact exists (GitHub Release or hosted asset).
 */
export function getConnectorMacosDownloadUrl(): string | null {
  return resolvePublicConnectorDownloadUrl(
    process.env.NEXT_PUBLIC_CONNECTOR_MACOS_DOWNLOAD_URL
  );
}

/**
 * Public Windows connector download URL.
 * Set only when a signed or private-testing installer exists.
 */
export function getConnectorWindowsDownloadUrl(): string | null {
  return resolvePublicConnectorDownloadUrl(
    process.env.NEXT_PUBLIC_CONNECTOR_WINDOWS_DOWNLOAD_URL
  );
}

export function getConnectorMacosReleaseLabel() {
  return {
    version: CONNECTOR_MACOS_APP_VERSION,
    platform: "macOS",
    status: getConnectorMacosDownloadUrl()
      ? ("available" as const)
      : ("preparing" as const),
  };
}

/** @deprecated Use CONNECTOR_DOWNLOAD_UNAVAILABLE_MESSAGE */
export function getConnectorDownloadUnavailableMessage() {
  return CONNECTOR_DOWNLOAD_UNAVAILABLE_MESSAGE;
}
