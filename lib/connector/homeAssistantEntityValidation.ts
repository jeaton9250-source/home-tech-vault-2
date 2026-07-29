const MAX_ENTITIES_PER_SYNC = 2_000;

const MAX_ENTITY_ID_LENGTH = 255;
const MAX_DOMAIN_LENGTH = 64;
const MAX_OBJECT_ID_LENGTH = 191;
const MAX_NAME_LENGTH = 255;
const MAX_STATE_LENGTH = 255;
const MAX_CLASS_LENGTH = 100;
const MAX_UNIT_LENGTH = 100;
const MAX_FINGERPRINT_LENGTH = 256;

const MAX_ATTRIBUTES_BYTES = 64 * 1024;
const MAX_TOTAL_ATTRIBUTES_BYTES = 2 * 1024 * 1024;

const ALLOWED_DOMAINS = new Set([
  "air_quality",
  "binary_sensor",
  "camera",
  "climate",
  "cover",
  "fan",
  "humidifier",
  "light",
  "lock",
  "media_player",
  "remote",
  "sensor",
  "siren",
  "switch",
  "vacuum",
  "valve",
  "water_heater",
]);

const BLOCKED_ATTRIBUTE_KEYS = new Set([
  "access_token",
  "accesstoken",
  "api_key",
  "apikey",
  "authorization",
  "bearer",
  "client_secret",
  "credential",
  "credentials",
  "password",
  "refresh_token",
  "refreshtoken",
  "secret",
  "token",
]);

export type HomeAssistantEntitySyncInput = {
  localFingerprint?: unknown;
  entityId?: unknown;
  domain?: unknown;
  objectId?: unknown;
  friendlyName?: unknown;
  currentState?: unknown;
  available?: unknown;
  deviceClass?: unknown;
  unitOfMeasurement?: unknown;
  supportedFeatures?: unknown;
  attributes?: unknown;
  lastChangedAt?: unknown;
  lastUpdatedAt?: unknown;
};

export type HomeAssistantEntitySyncRequestBody = {
  syncedAt?: unknown;
  entities?: unknown;
};

export type ParsedHomeAssistantEntity = {
  localFingerprint: string | null;
  entityId: string;
  domain: string;
  objectId: string;
  friendlyName: string | null;
  currentState: string;
  available: boolean;
  deviceClass: string | null;
  unitOfMeasurement: string | null;
  supportedFeatures: number | null;
  attributes: Record<string, unknown>;
  lastChangedAt: string | null;
  lastUpdatedAt: string | null;
};

export type ParsedHomeAssistantEntitySync = {
  syncedAt: string;
  entities: ParsedHomeAssistantEntity[];
};

export class HomeAssistantEntityValidationError extends Error {
  readonly code = "INVALID_HOME_ASSISTANT_ENTITY_SYNC";

  constructor(message: string) {
    super(message);
    this.name = "HomeAssistantEntityValidationError";
  }
}

function readRequiredString(
  value: unknown,
  fieldName: string,
  maxLength: number
): string {
  if (typeof value !== "string") {
    throw new HomeAssistantEntityValidationError(
      `${fieldName} must be a string.`
    );
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new HomeAssistantEntityValidationError(
      `${fieldName} is required.`
    );
  }

  if (trimmed.length > maxLength) {
    throw new HomeAssistantEntityValidationError(
      `${fieldName} exceeds the maximum length.`
    );
  }

  return trimmed;
}

function readOptionalString(
  value: unknown,
  fieldName: string,
  maxLength: number
): string | null {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  return readRequiredString(
    value,
    fieldName,
    maxLength
  );
}

function readOptionalTimestamp(
  value: unknown,
  fieldName: string
): string | null {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  if (typeof value !== "string") {
    throw new HomeAssistantEntityValidationError(
      `${fieldName} must be an ISO timestamp.`
    );
  }

  const parsed = Date.parse(value);

  if (Number.isNaN(parsed)) {
    throw new HomeAssistantEntityValidationError(
      `${fieldName} must be an ISO timestamp.`
    );
  }

  return new Date(parsed).toISOString();
}

function readSyncTimestamp(
  value: unknown,
  fallback: string
): string {
  return (
    readOptionalTimestamp(
      value,
      "syncedAt"
    ) ?? fallback
  );
}

function readSupportedFeatures(
  value: unknown
): number | null {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value < 0
  ) {
    throw new HomeAssistantEntityValidationError(
      "supportedFeatures must be a non-negative safe integer."
    );
  }

  return value;
}

function normalizeAttributeKey(
  key: string
): string {
  return key
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function sanitizeJsonValue(
  value: unknown,
  depth = 0
): unknown {
  if (depth > 8) {
    return null;
  }

  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : null;
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, 200)
      .map((entry) =>
        sanitizeJsonValue(
          entry,
          depth + 1
        )
      );
  }

  if (
    typeof value === "object"
  ) {
    const sanitized: Record<
      string,
      unknown
    > = {};

    const entries = Object.entries(
      value as Record<string, unknown>
    ).slice(0, 300);

    for (const [key, entry] of entries) {
      if (
        BLOCKED_ATTRIBUTE_KEYS.has(
          normalizeAttributeKey(key)
        )
      ) {
        continue;
      }

      sanitized[key.slice(0, 150)] =
        sanitizeJsonValue(
          entry,
          depth + 1
        );
    }

    return sanitized;
  }

  return null;
}

function readAttributes(
  value: unknown
): {
  attributes: Record<string, unknown>;
  byteLength: number;
} {
  if (
    value === undefined ||
    value === null
  ) {
    return {
      attributes: {},
      byteLength: 2,
    };
  }

  if (
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new HomeAssistantEntityValidationError(
      "attributes must be an object."
    );
  }

  const sanitized = sanitizeJsonValue(
    value
  );

  if (
    !sanitized ||
    typeof sanitized !== "object" ||
    Array.isArray(sanitized)
  ) {
    throw new HomeAssistantEntityValidationError(
      "attributes must be an object."
    );
  }

  const attributes =
    sanitized as Record<string, unknown>;

  const byteLength = Buffer.byteLength(
    JSON.stringify(attributes),
    "utf8"
  );

  if (
    byteLength >
    MAX_ATTRIBUTES_BYTES
  ) {
    throw new HomeAssistantEntityValidationError(
      "An entity contains too much attribute data."
    );
  }

  return {
    attributes,
    byteLength,
  };
}

function parseEntity(
  value: unknown,
  index: number
): {
  entity: ParsedHomeAssistantEntity;
  attributeBytes: number;
} {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new HomeAssistantEntityValidationError(
      `entities[${index}] must be an object.`
    );
  }

  const input =
    value as HomeAssistantEntitySyncInput;

  const entityId = readRequiredString(
    input.entityId,
    `entities[${index}].entityId`,
    MAX_ENTITY_ID_LENGTH
  );

  const separatorIndex =
    entityId.indexOf(".");

  if (
    separatorIndex <= 0 ||
    separatorIndex ===
      entityId.length - 1
  ) {
    throw new HomeAssistantEntityValidationError(
      `entities[${index}].entityId must use the domain.object_id format.`
    );
  }

  const derivedDomain =
    entityId
      .slice(0, separatorIndex)
      .toLowerCase();

  const derivedObjectId =
    entityId.slice(
      separatorIndex + 1
    );

  const domain = readRequiredString(
    input.domain ?? derivedDomain,
    `entities[${index}].domain`,
    MAX_DOMAIN_LENGTH
  ).toLowerCase();

  const objectId = readRequiredString(
    input.objectId ??
      derivedObjectId,
    `entities[${index}].objectId`,
    MAX_OBJECT_ID_LENGTH
  );

  if (
    domain !== derivedDomain ||
    objectId !== derivedObjectId
  ) {
    throw new HomeAssistantEntityValidationError(
      `entities[${index}] does not match its entityId.`
    );
  }

  if (!ALLOWED_DOMAINS.has(domain)) {
    throw new HomeAssistantEntityValidationError(
      `entities[${index}].domain is not supported.`
    );
  }

  const {
    attributes,
    byteLength,
  } = readAttributes(
    input.attributes
  );

  const entity: ParsedHomeAssistantEntity = {
    localFingerprint:
      readOptionalString(
        input.localFingerprint,
        `entities[${index}].localFingerprint`,
        MAX_FINGERPRINT_LENGTH
      ),

    entityId,
    domain,
    objectId,

    friendlyName:
      readOptionalString(
        input.friendlyName,
        `entities[${index}].friendlyName`,
        MAX_NAME_LENGTH
      ),

    currentState:
      readRequiredString(
        input.currentState ??
          "unknown",
        `entities[${index}].currentState`,
        MAX_STATE_LENGTH
      ),

    available:
      typeof input.available ===
      "boolean"
        ? input.available
        : false,

    deviceClass:
      readOptionalString(
        input.deviceClass,
        `entities[${index}].deviceClass`,
        MAX_CLASS_LENGTH
      ),

    unitOfMeasurement:
      readOptionalString(
        input.unitOfMeasurement,
        `entities[${index}].unitOfMeasurement`,
        MAX_UNIT_LENGTH
      ),

    supportedFeatures:
      readSupportedFeatures(
        input.supportedFeatures
      ),

    attributes,

    lastChangedAt:
      readOptionalTimestamp(
        input.lastChangedAt,
        `entities[${index}].lastChangedAt`
      ),

    lastUpdatedAt:
      readOptionalTimestamp(
        input.lastUpdatedAt,
        `entities[${index}].lastUpdatedAt`
      ),
  };

  return {
    entity,
    attributeBytes: byteLength,
  };
}

export function parseHomeAssistantEntitySyncPayload(
  body: HomeAssistantEntitySyncRequestBody,
  nowIso: string
): ParsedHomeAssistantEntitySync {
  if (
    !body ||
    typeof body !== "object"
  ) {
    throw new HomeAssistantEntityValidationError(
      "The request body must be an object."
    );
  }

  if (!Array.isArray(body.entities)) {
    throw new HomeAssistantEntityValidationError(
      "entities must be an array."
    );
  }

  if (
    body.entities.length >
    MAX_ENTITIES_PER_SYNC
  ) {
    throw new HomeAssistantEntityValidationError(
      `A sync may include at most ${MAX_ENTITIES_PER_SYNC} entities.`
    );
  }

  const seenEntityIds =
    new Set<string>();

  let totalAttributeBytes = 0;

  const entities =
    body.entities.map(
      (value, index) => {
        const {
          entity,
          attributeBytes,
        } = parseEntity(
          value,
          index
        );

        if (
          seenEntityIds.has(
            entity.entityId
          )
        ) {
          throw new HomeAssistantEntityValidationError(
            `Duplicate entityId: ${entity.entityId}.`
          );
        }

        seenEntityIds.add(
          entity.entityId
        );

        totalAttributeBytes +=
          attributeBytes;

        if (
          totalAttributeBytes >
          MAX_TOTAL_ATTRIBUTES_BYTES
        ) {
          throw new HomeAssistantEntityValidationError(
            "The entity sync contains too much attribute data."
          );
        }

        return entity;
      }
    );

  return {
    syncedAt: readSyncTimestamp(
      body.syncedAt,
      nowIso
    ),
    entities,
  };
}
