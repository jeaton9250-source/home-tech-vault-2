import {
  getConnectorMacosDownloadUrl,
  getConnectorWindowsDownloadUrl,
} from "@/lib/connector/release";
import {
  CONNECTOR_MACOS_APP_VERSION,
  CONNECTOR_WINDOWS_APP_VERSION,
} from "@/lib/connector/constants";

export type BrowserPlatformHint = "macos" | "windows" | "other";

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

export function getConnectorDownloadOptions() {
  const macosDownloadUrl = getConnectorMacosDownloadUrl();
  const windowsDownloadUrl = getConnectorWindowsDownloadUrl();

  return {
    macos: {
      label: "macOS",
      version: CONNECTOR_MACOS_APP_VERSION,
      downloadUrl: macosDownloadUrl,
      unavailableMessage: macosDownloadUrl
        ? null
        : "Download coming soon.",
    },
    windows: {
      label: "Windows",
      version: CONNECTOR_WINDOWS_APP_VERSION,
      downloadUrl: windowsDownloadUrl,
      unavailableMessage: windowsDownloadUrl
        ? null
        : "Windows version coming soon",
    },
  };
}
