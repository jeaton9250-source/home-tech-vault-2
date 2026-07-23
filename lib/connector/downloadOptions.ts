import {
  CONNECTOR_MACOS_APP_VERSION,
  CONNECTOR_WINDOWS_APP_VERSION,
} from "@/lib/connector/constants";
import {
  CONNECTOR_DOWNLOAD_UNAVAILABLE_MESSAGE,
  getConnectorMacosDownloadUrl,
  getConnectorWindowsDownloadUrl,
} from "@/lib/connector/release";

export type ConnectorDownloadPlatformId = "macos" | "windows";

export type ConnectorDownloadOption = {
  platformId: ConnectorDownloadPlatformId;
  label: string;
  version: string;
  downloadUrl: string | null;
  available: boolean;
  unavailableMessage: string;
  versionLabel: string;
  buttonLabel: string;
};

export type ConnectorDownloadOptionsMap = Record<
  ConnectorDownloadPlatformId,
  ConnectorDownloadOption
>;

export const CONNECTOR_WINDOWS_UNAVAILABLE_MESSAGE =
  "Windows version coming soon";

export type BrowserPlatformHint = "macos" | "windows" | "other";

export function formatConnectorVersionLabel(
  platformLabel: string,
  version: string
): string {
  return `Home Tech Vault Connector ${version} for ${platformLabel}`;
}

function buildPlatformOption(input: {
  platformId: ConnectorDownloadPlatformId;
  label: string;
  version: string;
  downloadUrl: string | null;
  unavailableMessage: string;
}): ConnectorDownloadOption {
  const available = Boolean(input.downloadUrl);

  return {
    platformId: input.platformId,
    label: input.label,
    version: input.version,
    downloadUrl: input.downloadUrl,
    available,
    unavailableMessage: input.unavailableMessage,
    versionLabel: formatConnectorVersionLabel(input.label, input.version),
    buttonLabel: `Download for ${input.label}`,
  };
}

/**
 * Shared server-side resolver for connector download availability.
 * Reads NEXT_PUBLIC_* env vars at request/build time on the server.
 */
export function buildConnectorDownloadOptions(): ConnectorDownloadOptionsMap {
  const macosDownloadUrl = getConnectorMacosDownloadUrl();
  const windowsDownloadUrl = getConnectorWindowsDownloadUrl();

  return {
    macos: buildPlatformOption({
      platformId: "macos",
      label: "macOS",
      version: CONNECTOR_MACOS_APP_VERSION,
      downloadUrl: macosDownloadUrl,
      unavailableMessage: CONNECTOR_DOWNLOAD_UNAVAILABLE_MESSAGE,
    }),
    windows: buildPlatformOption({
      platformId: "windows",
      label: "Windows",
      version: CONNECTOR_WINDOWS_APP_VERSION,
      downloadUrl: windowsDownloadUrl,
      unavailableMessage: CONNECTOR_WINDOWS_UNAVAILABLE_MESSAGE,
    }),
  };
}

/** @deprecated Prefer buildConnectorDownloadOptions() or useConnectorDownloadOptions(). */
export function getConnectorDownloadOptions(): ConnectorDownloadOptionsMap {
  return buildConnectorDownloadOptions();
}

export function detectBrowserPlatformHint(): BrowserPlatformHint {
  if (typeof navigator === "undefined") {
    return "other";
  }

  const platform = navigator.platform.toLowerCase();
  const userAgent = navigator.userAgent.toLowerCase();

  if (platform.includes("win") || userAgent.includes("windows")) {
    return "windows";
  }

  if (platform.includes("mac") || userAgent.includes("mac os")) {
    return "macos";
  }

  return "other";
}

export function orderConnectorDownloadPlatforms(
  browserPlatform: BrowserPlatformHint
): ConnectorDownloadPlatformId[] {
  return browserPlatform === "windows"
    ? ["windows", "macos"]
    : ["macos", "windows"];
}
