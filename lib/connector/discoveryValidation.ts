import {
  CONNECTOR_FIELD_LIMITS,
} from "@/lib/connector/constants";
import {
  isPrivateIpAddress,
} from "@/lib/connector/privateNetwork";
import {
  computeStableFingerprint,
  normalizeMacAddress,
} from "@/lib/connector/network";

export type DiscoverySyncDeviceInput = {
  localFingerprint?: string;
  ipAddress?: string;
  macAddress?: string;
  hostname?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  deviceType?: string;
  discoverySource?: string;
  firstSeenAt?: string;
  lastSeenAt?: string;
  online?: boolean;
};

export type DiscoverySyncRequestBody = {
  scannedAt?: string;
  devices?: DiscoverySyncDeviceInput[];
  /** Phase 2B.2+: run matching and enrichment after upsert. Default false. */
  runMatching?: boolean;
};

export type ParsedDiscoveryDevice = {
  localFingerprint: string;
  ipAddress: string | null;
  macAddress: string | null;
  hostname: string | null;
  manufacturer: string | null;
  model: string | null;
  serialNumber: string | null;
  deviceType: string | null;
  discoverySource: string;
  firstSeenAt: string;
  lastSeenAt: string;
  online: boolean;
};

export class DiscoveryValidationError extends Error {
  readonly code = "INVALID";

  constructor(message: string) {
    super(message);
  }
}

const MAX_DEVICES_PER_SYNC = 500;
const MAX_TEXT_FIELD = 200;
const MAX_FINGERPRINT = 256;

function trimOptional(
  value: unknown,
  maxLength: number
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.length > maxLength) {
    throw new DiscoveryValidationError(
      `A discovery field exceeds ${maxLength} characters.`
    );
  }

  return trimmed;
}

function parseIsoTimestamp(
  value: unknown,
  fieldName: string,
  fallback: string
): string {
  if (value === undefined || value === null) {
    return fallback;
  }

  if (typeof value !== "string" || !value.trim()) {
    throw new DiscoveryValidationError(
      `${fieldName} must be an ISO timestamp.`
    );
  }

  const parsed = Date.parse(value);

  if (Number.isNaN(parsed)) {
    throw new DiscoveryValidationError(
      `${fieldName} must be an ISO timestamp.`
    );
  }

  return new Date(parsed).toISOString();
}

function parseIpAddress(
  value: unknown,
  index: number
): string | null {
  const trimmed = trimOptional(
    value,
    45
  );

  if (!trimmed) {
    return null;
  }

  if (!isPrivateIpAddress(trimmed)) {
    throw new DiscoveryValidationError(
      `devices[${index}].ipAddress must be a private local network address.`
    );
  }

  return trimmed;
}

function parseMacAddress(
  value: unknown
): string | null {
  const trimmed = trimOptional(value, 32);

  if (!trimmed) {
    return null;
  }

  const normalized = normalizeMacAddress(
    trimmed
  );

  if (!normalized) {
    throw new DiscoveryValidationError(
      "macAddress must be a valid MAC address."
    );
  }

  return normalized;
}

export function parseDiscoverySyncPayload(
  body: DiscoverySyncRequestBody,
  nowIso: string
): {
  scannedAt: string;
  devices: ParsedDiscoveryDevice[];
} {
  const scannedAt = parseIsoTimestamp(
    body.scannedAt,
    "scannedAt",
    nowIso
  );

  if (!Array.isArray(body.devices)) {
    throw new DiscoveryValidationError(
      "devices must be an array."
    );
  }

  if (body.devices.length > MAX_DEVICES_PER_SYNC) {
    throw new DiscoveryValidationError(
      `A sync batch may include at most ${MAX_DEVICES_PER_SYNC} devices.`
    );
  }

  const devices = body.devices.map(
    (device, index) => {
      if (
        !device ||
        typeof device !== "object"
      ) {
        throw new DiscoveryValidationError(
          `devices[${index}] must be an object.`
        );
      }

      const ipAddress = parseIpAddress(
        device.ipAddress,
        index
      );
      const macAddress = parseMacAddress(
        device.macAddress
      );
      const hostname = trimOptional(
        device.hostname,
        CONNECTOR_FIELD_LIMITS.deviceName
      );
      const manufacturer = trimOptional(
        device.manufacturer,
        MAX_TEXT_FIELD
      );
      const model = trimOptional(
        device.model,
        MAX_TEXT_FIELD
      );
      const serialNumber = trimOptional(
        device.serialNumber,
        MAX_TEXT_FIELD
      );
      const deviceType = trimOptional(
        device.deviceType,
        MAX_TEXT_FIELD
      );
      const discoverySource =
        trimOptional(
          device.discoverySource,
          MAX_TEXT_FIELD
        ) ?? "Connector Scan";

      const firstSeenAt = parseIsoTimestamp(
        device.firstSeenAt,
        `devices[${index}].firstSeenAt`,
        scannedAt
      );
      const lastSeenAt = parseIsoTimestamp(
        device.lastSeenAt,
        `devices[${index}].lastSeenAt`,
        scannedAt
      );

      const online =
        typeof device.online === "boolean"
          ? device.online
          : true;

      let localFingerprint = trimOptional(
        device.localFingerprint,
        MAX_FINGERPRINT
      );

      if (!localFingerprint) {
        try {
          localFingerprint =
            computeStableFingerprint({
              macAddress,
              hostname,
              manufacturer,
              model,
              serialNumber,
            });
        } catch {
          throw new DiscoveryValidationError(
            `devices[${index}] must include localFingerprint or enough metadata to derive one.`
          );
        }
      }

      return {
        localFingerprint,
        ipAddress,
        macAddress,
        hostname,
        manufacturer,
        model,
        serialNumber,
        deviceType,
        discoverySource,
        firstSeenAt,
        lastSeenAt,
        online,
      };
    }
  );

  return {
    scannedAt,
    devices,
  };
}
