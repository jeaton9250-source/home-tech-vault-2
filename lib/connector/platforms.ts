import {
  buildConnectorDownloadOptions,
  CONNECTOR_WINDOWS_UNAVAILABLE_MESSAGE,
} from "@/lib/connector/downloadOptions";
import { CONNECTOR_DOWNLOAD_UNAVAILABLE_MESSAGE } from "@/lib/connector/release";

export type ConnectorPlatformId =
  | "macos"
  | "windows"
  | "linux";

export type ConnectorPlatformAvailability =
  | "available"
  | "coming_soon"
  | "unavailable";

export type ConnectorPlatformDefinition = {
  id: ConnectorPlatformId;
  label: string;
  shortLabel: string;
  availability: ConnectorPlatformAvailability;
  downloadUrl: string | null;
  version: string | null;
  description: string;
  unavailableMessage?: string | null;
  versionLabel?: string | null;
};

const PLATFORM_DEFINITIONS: Record<
  ConnectorPlatformId,
  Omit<
    ConnectorPlatformDefinition,
    | "downloadUrl"
    | "version"
    | "availability"
    | "unavailableMessage"
    | "versionLabel"
  >
> = {
  macos: {
    id: "macos",
    label: "macOS",
    shortLabel: "Mac",
    description:
      "Install on a Mac that stays on your home network.",
  },
  windows: {
    id: "windows",
    label: "Windows",
    shortLabel: "PC",
    description:
      "Install on a Windows PC that stays on your home network.",
  },
  linux: {
    id: "linux",
    label: "Linux",
    shortLabel: "Linux",
    description:
      "Linux connector support is planned for a future release.",
  },
};

export function getConnectorPlatforms(): ConnectorPlatformDefinition[] {
  const downloads = buildConnectorDownloadOptions();

  return (
    Object.keys(PLATFORM_DEFINITIONS) as ConnectorPlatformId[]
  ).map((id) => {
    const base = PLATFORM_DEFINITIONS[id];

    if (id === "macos") {
      const macos = downloads.macos;

      return {
        ...base,
        availability: macos.available ? "available" : "unavailable",
        downloadUrl: macos.downloadUrl,
        version: macos.version,
        unavailableMessage: macos.available
          ? null
          : CONNECTOR_DOWNLOAD_UNAVAILABLE_MESSAGE,
        versionLabel: macos.versionLabel,
      };
    }

    if (id === "windows") {
      const windows = downloads.windows;

      return {
        ...base,
        availability: windows.available ? "available" : "coming_soon",
        downloadUrl: windows.downloadUrl,
        version: windows.version,
        unavailableMessage: windows.available
          ? null
          : CONNECTOR_WINDOWS_UNAVAILABLE_MESSAGE,
        versionLabel: windows.versionLabel,
      };
    }

    return {
      ...base,
      availability: "coming_soon",
      downloadUrl: null,
      version: null,
      unavailableMessage: "Coming Soon",
      versionLabel: null,
    };
  });
}

export function getPrimaryConnectorPlatform(): ConnectorPlatformDefinition {
  return getConnectorPlatforms()[0];
}

export function formatPlatformLabel(
  platform: string | null | undefined
): string {
  const normalized = platform?.trim().toLowerCase() ?? "";

  if (normalized.includes("mac") || normalized === "macos") {
    return "macOS";
  }

  if (normalized.includes("win")) {
    return "Windows";
  }

  if (normalized.includes("linux")) {
    return "Linux";
  }

  return platform?.trim() || "Unknown platform";
}
