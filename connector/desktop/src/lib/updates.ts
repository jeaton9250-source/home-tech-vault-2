import { APP_VERSION, getApiBaseUrl } from "./config";

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

export type ConnectorUpdateCheckResult = {
  status: "current" | "update_available" | "unknown";
  installedVersion: string;
  latestVersion: string | null;
  message: string;
  downloadUrl: string | null;
};

function compareVersions(installed: string, latest: string) {
  const left = installed.split(".").map((part) => Number.parseInt(part, 10));
  const right = latest.split(".").map((part) => Number.parseInt(part, 10));
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    const a = left[index] ?? 0;
    const b = right[index] ?? 0;

    if (a > b) {
      return 1;
    }

    if (a < b) {
      return -1;
    }
  }

  return 0;
}

export async function fetchConnectorReleaseManifest(): Promise<ConnectorReleaseManifest | null> {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}/api/connector/releases`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as ConnectorReleaseManifest;
  } catch {
    return null;
  }
}

export function resolveReleaseAsset(
  manifest: ConnectorReleaseManifest,
  platform: "macos" | "windows"
) {
  const preferred =
    platform === "windows"
      ? manifest.assets.find(
          (asset) =>
            asset.platform === "windows" &&
            asset.architecture === "x64"
        )
      : manifest.assets.find(
          (asset) =>
            asset.platform === "macos" &&
            (asset.architecture === "arm64" ||
              asset.architecture === "universal")
        );

  return preferred ?? manifest.assets.find((asset) => asset.platform === platform) ?? null;
}

export async function checkConnectorForUpdates(
  platform: "macos" | "windows"
): Promise<ConnectorUpdateCheckResult> {
  const manifest = await fetchConnectorReleaseManifest();

  if (!manifest) {
    return {
      status: "unknown",
      installedVersion: APP_VERSION,
      latestVersion: null,
      message: "Unable to check for updates right now.",
      downloadUrl: null,
    };
  }

  const asset = resolveReleaseAsset(manifest, platform);
  const comparison = compareVersions(APP_VERSION, manifest.version);

  if (comparison >= 0) {
    return {
      status: "current",
      installedVersion: APP_VERSION,
      latestVersion: manifest.version,
      message: "You are on the latest connector version.",
      downloadUrl: asset?.downloadUrl ?? null,
    };
  }

  return {
    status: "update_available",
    installedVersion: APP_VERSION,
    latestVersion: manifest.version,
    message: manifest.privateTestingOnly
      ? `Version ${manifest.version} is available for private testing only.`
      : `Version ${manifest.version} is available.`,
    downloadUrl: asset?.downloadUrl ?? null,
  };
}

export function openOfficialConnectorDownloadPage() {
  const url = `${getApiBaseUrl()}/network/connect`;
  window.open(url, "_blank", "noopener,noreferrer");
}
