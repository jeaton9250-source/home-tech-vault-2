import {
  getConnectorMacosDownloadUrl,
  getConnectorWindowsDownloadUrl,
} from "@/lib/connector/release";
import {
  CONNECTOR_MACOS_APP_VERSION,
  CONNECTOR_WINDOWS_APP_VERSION,
} from "@/lib/connector/constants";

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
};

const PLATFORM_DEFINITIONS: Record<
  ConnectorPlatformId,
  Omit<
    ConnectorPlatformDefinition,
    "downloadUrl" | "version" | "availability" | "unavailableMessage"
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
  const macosDownloadUrl = getConnectorMacosDownloadUrl();
  const windowsDownloadUrl = getConnectorWindowsDownloadUrl();

  return (
    Object.keys(PLATFORM_DEFINITIONS) as ConnectorPlatformId[]
  ).map((id) => {
    const base = PLATFORM_DEFINITIONS[id];

    if (id === "macos") {
      return {
        ...base,
        availability: macosDownloadUrl
          ? "available"
          : "unavailable",
        downloadUrl: macosDownloadUrl,
        version: CONNECTOR_MACOS_APP_VERSION,
        unavailableMessage: macosDownloadUrl
          ? null
          : "Download coming soon.",
      };
    }

    if (id === "windows") {
      return {
        ...base,
        availability: windowsDownloadUrl
          ? "available"
          : "coming_soon",
        downloadUrl: windowsDownloadUrl,
        version: CONNECTOR_WINDOWS_APP_VERSION,
        unavailableMessage: windowsDownloadUrl
          ? null
          : "Windows version coming soon",
      };
    }

    return {
      ...base,
      availability: "coming_soon",
      downloadUrl: null,
      version: null,
      unavailableMessage: "Coming Soon",
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
