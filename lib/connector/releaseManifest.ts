import {
  CONNECTOR_MACOS_APP_VERSION,
  CONNECTOR_WINDOWS_APP_VERSION,
} from "@/lib/connector/constants";
import {
  getConnectorMacosDownloadUrl,
  getConnectorWindowsDownloadUrl,
} from "@/lib/connector/release";

export type ConnectorReleaseAsset = {
  platform: "macos" | "windows";
  architecture: "x64" | "arm64" | "universal";
  downloadUrl: string;
  checksum?: string | null;
};

export type ConnectorReleaseManifest = {
  version: string;
  publishedAt: string;
  releaseNotes: string;
  privateTestingOnly: boolean;
  assets: ConnectorReleaseAsset[];
};

export function buildConnectorReleaseManifest(): ConnectorReleaseManifest {
  const macosDownloadUrl = getConnectorMacosDownloadUrl();
  const windowsDownloadUrl = getConnectorWindowsDownloadUrl();
  const version = CONNECTOR_MACOS_APP_VERSION;

  const assets: ConnectorReleaseAsset[] = [];

  if (macosDownloadUrl) {
    assets.push({
      platform: "macos",
      architecture: "arm64",
      downloadUrl: macosDownloadUrl,
    });
  }

  if (windowsDownloadUrl) {
    assets.push({
      platform: "windows",
      architecture: "x64",
      downloadUrl: windowsDownloadUrl,
    });
  }

  return {
    version,
    publishedAt: new Date().toISOString(),
    releaseNotes:
      "Connector pairing, heartbeat, manual scanning, discovery sync, and monitoring improvements.",
    privateTestingOnly: true,
    assets,
  };
}

export function getLatestConnectorVersionForPlatform(
  platform: "macos" | "windows"
) {
  return platform === "windows"
    ? CONNECTOR_WINDOWS_APP_VERSION
    : CONNECTOR_MACOS_APP_VERSION;
}
