import { CONNECTOR_MACOS_APP_VERSION } from "@/lib/connector/constants";

/**
 * Public macOS connector download URL.
 * Set only when a real release artifact exists (GitHub Release or hosted asset).
 */
export function getConnectorMacosDownloadUrl(): string | null {
  const value =
    process.env.NEXT_PUBLIC_CONNECTOR_MACOS_DOWNLOAD_URL?.trim();

  return value || null;
}

/**
 * Public Windows connector download URL.
 * Set only when a signed or private-testing installer exists.
 */
export function getConnectorWindowsDownloadUrl(): string | null {
  const value =
    process.env.NEXT_PUBLIC_CONNECTOR_WINDOWS_DOWNLOAD_URL?.trim();

  return value || null;
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

export function getConnectorDownloadUnavailableMessage() {
  return "Download coming soon.";
}
