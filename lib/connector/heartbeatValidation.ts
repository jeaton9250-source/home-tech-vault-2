import {
  CONNECTOR_FIELD_LIMITS,
  CONNECTOR_SUPPORTED_PLATFORMS,
  type ConnectorPlatform,
} from "@/lib/connector/constants";

export type HeartbeatRequestBody = {
  appVersion?: string;
  platform?: string;
  deviceName?: string;
};

export type ParsedHeartbeatPayload = {
  appVersion: string;
  platform: ConnectorPlatform;
  deviceName: string;
};

export class HeartbeatValidationError extends Error {
  readonly code = "INVALID";

  constructor(message: string) {
    super(message);
  }
}

const SEMVER_PATTERN =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

export function isSemanticVersion(
  value: string
): boolean {
  return SEMVER_PATTERN.test(value);
}

export function parseHeartbeatPayload(
  body: HeartbeatRequestBody
): ParsedHeartbeatPayload {
  const appVersion =
    body.appVersion?.trim() ?? "";

  if (!appVersion) {
    throw new HeartbeatValidationError(
      "appVersion is required."
    );
  }

  if (
    appVersion.length >
    CONNECTOR_FIELD_LIMITS.appVersion
  ) {
    throw new HeartbeatValidationError(
      "appVersion is too long."
    );
  }

  if (!isSemanticVersion(appVersion)) {
    throw new HeartbeatValidationError(
      "appVersion must be a semantic version."
    );
  }

  const platformRaw =
    body.platform?.trim().toLowerCase() ??
    "";

  if (!platformRaw) {
    throw new HeartbeatValidationError(
      "platform is required."
    );
  }

  if (
    !CONNECTOR_SUPPORTED_PLATFORMS.includes(
      platformRaw as ConnectorPlatform
    )
  ) {
    throw new HeartbeatValidationError(
      "platform is not supported."
    );
  }

  const deviceName =
    body.deviceName?.trim() ?? "";

  if (!deviceName) {
    throw new HeartbeatValidationError(
      "deviceName is required."
    );
  }

  if (
    deviceName.length >
    CONNECTOR_FIELD_LIMITS.deviceName
  ) {
    throw new HeartbeatValidationError(
      "deviceName is too long."
    );
  }

  return {
    appVersion,
    platform: platformRaw as ConnectorPlatform,
    deviceName,
  };
}
