import { CONNECTOR_MACOS_APP_VERSION } from "@/lib/connector/constants";

export type ConnectorUpdateStatus =
  | "current"
  | "update_available"
  | "unknown";

export type ConnectorUpdateCheckResult = {
  status: ConnectorUpdateStatus;
  installedVersion: string | null;
  latestVersion: string;
  message: string;
};

function parseVersionParts(value: string): number[] {
  return value
    .split(".")
    .map((part) => Number.parseInt(part, 10))
    .map((part) => (Number.isFinite(part) ? part : 0));
}

export function compareConnectorVersions(
  installed: string,
  latest: string
): number {
  const installedParts = parseVersionParts(installed);
  const latestParts = parseVersionParts(latest);
  const length = Math.max(
    installedParts.length,
    latestParts.length
  );

  for (let index = 0; index < length; index += 1) {
    const installedPart = installedParts[index] ?? 0;
    const latestPart = latestParts[index] ?? 0;

    if (installedPart > latestPart) {
      return 1;
    }

    if (installedPart < latestPart) {
      return -1;
    }
  }

  return 0;
}

export function checkConnectorUpdate(
  installedVersion: string | null | undefined,
  latestVersion = CONNECTOR_MACOS_APP_VERSION
): ConnectorUpdateCheckResult {
  if (!installedVersion?.trim()) {
    return {
      status: "unknown",
      installedVersion: null,
      latestVersion,
      message: "Connector version not reported yet.",
    };
  }

  const comparison = compareConnectorVersions(
    installedVersion,
    latestVersion
  );

  if (comparison < 0) {
    return {
      status: "update_available",
      installedVersion,
      latestVersion,
      message: `Version ${latestVersion} is available.`,
    };
  }

  return {
    status: "current",
    installedVersion,
    latestVersion,
    message: "You are on the latest connector version.",
  };
}
