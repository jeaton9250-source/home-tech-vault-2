import type {
  GroupedHomeAssistantDevice,
  HomeAssistantState,
  NormalizedHomeAssistantEntity,
} from "./types";

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

const BLOCKED_PREFIXES = [
  "conversation.",
  "person.",
  "sun.",
  "zone.",
  "automation.",
  "script.",
  "scene.",
  "update.home_assistant",
  "sensor.sun_",
  "sensor.backup_",
  "event.backup_",
];

function readString(
  value: unknown
): string | null {
  return typeof value === "string"
    ? value
    : null;
}

function getDomain(
  entityId: string
): string {
  const index =
    entityId.indexOf(".");

  return index === -1
    ? "unknown"
    : entityId.slice(0, index);
}

function getObjectId(
  entityId: string
): string {
  const index =
    entityId.indexOf(".");

  return index === -1
    ? entityId
    : entityId.slice(index + 1);
}

function titleCase(
  value: string
): string {
  return value
    .replace(/_/g, " ")
    .replace(
      /\b\w/g,
      (character: string) =>
        character.toUpperCase()
    );
}

function isBlocked(
  entityId: string
): boolean {
  return BLOCKED_PREFIXES.some(
    (prefix) =>
      entityId.startsWith(prefix)
  );
}

function isUsefulSensor(
  state: HomeAssistantState
): boolean {
  const attributes =
    state.attributes ?? {};

  const deviceClass =
    readString(
      attributes.device_class
    );

  if (deviceClass) {
    return true;
  }

  if (
    typeof attributes.unit_of_measurement ===
    "string"
  ) {
    return true;
  }

  const text = [
    state.entity_id,
    attributes.friendly_name,
  ]
    .filter(
      (value) =>
        typeof value === "string"
    )
    .join(" ")
    .toLowerCase();

  return [
    "battery",
    "temperature",
    "humidity",
    "energy",
    "power",
    "voltage",
    "current",
    "air quality",
    "water",
    "moisture",
    "signal",
  ].some((term) =>
    text.includes(term)
  );
}

export function shouldImportHomeAssistantState(
  state: HomeAssistantState
): boolean {
  const entityId =
    state.entity_id?.trim();

  if (!entityId) {
    return false;
  }

  if (isBlocked(entityId)) {
    return false;
  }

  const domain =
    getDomain(entityId);

  if (!ALLOWED_DOMAINS.has(domain)) {
    return false;
  }

  if (
    domain === "sensor" &&
    !isUsefulSensor(state)
  ) {
    return false;
  }

  return true;
}

export function normalizeHomeAssistantState(
  state: HomeAssistantState
): NormalizedHomeAssistantEntity {
  const entityId =
    state.entity_id;

  const domain =
    getDomain(entityId);

  const objectId =
    getObjectId(entityId);

  const attributes =
    state.attributes ?? {};

  const friendlyName =
    readString(
      attributes.friendly_name
    );

  return {
    entityId,
    domain,
    objectId,

    name:
      friendlyName ??
      titleCase(objectId),

    state:
      state.state ?? "unknown",

    deviceClass:
      readString(
        attributes.device_class
      ),

    unitOfMeasurement:
      readString(
        attributes.unit_of_measurement
      ),

    available:
      state.state !== "unavailable" &&
      state.state !== "unknown",

    attributes,

    lastChangedAt:
      state.last_changed ?? null,

    lastUpdatedAt:
      state.last_updated ?? null,
  };
}

function buildGroupKey(
  entity: NormalizedHomeAssistantEntity
): string {
  return entity.name
    .trim()
    .toLowerCase();
}

function sanitizeFingerprintPart(
  value: string
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9._-]+/g,
      "-"
    )
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

function buildFingerprint(
  entity: NormalizedHomeAssistantEntity
): string {
  /*
   * Later we will replace this with the true
   * Home Assistant device-registry ID.
   */
  const groupPart =
    sanitizeFingerprintPart(
      buildGroupKey(entity)
    );

  return `home-assistant:${groupPart}`;
}

function choosePrimaryState(
  currentState: string,
  entity: NormalizedHomeAssistantEntity
): string {
  const preferredDomains =
    new Set([
      "media_player",
      "light",
      "switch",
      "climate",
      "fan",
      "cover",
      "lock",
      "vacuum",
      "valve",
    ]);

  return preferredDomains.has(
    entity.domain
  )
    ? entity.state
    : currentState;
}

function determineDeviceType(
  entities:
    NormalizedHomeAssistantEntity[]
): string | null {
  const priority = [
    "light",
    "switch",
    "climate",
    "fan",
    "cover",
    "lock",
    "media_player",
    "camera",
    "vacuum",
    "sensor",
    "binary_sensor",
    "remote",
  ];

  for (const domain of priority) {
    if (
      entities.some(
        (entity) =>
          entity.domain === domain
      )
    ) {
      return domain;
    }
  }

  return entities[0]?.domain ?? null;
}

export function groupHomeAssistantStates(
  states: HomeAssistantState[]
): GroupedHomeAssistantDevice[] {
  const normalized = states
    .filter(
      shouldImportHomeAssistantState
    )
    .map(
      normalizeHomeAssistantState
    );

  const grouped = new Map<
    string,
    GroupedHomeAssistantDevice
  >();

  for (const entity of normalized) {
    const key =
      buildGroupKey(entity);

    const existing =
      grouped.get(key);

    if (existing) {
      existing.entities.push(entity);

      existing.available =
        existing.available ||
        entity.available;

      existing.primaryState =
        choosePrimaryState(
          existing.primaryState,
          entity
        );

      existing.domains = [
        ...new Set([
          ...existing.domains,
          entity.domain,
        ]),
      ];

      existing.entityCount =
        existing.entities.length;

      existing.deviceType =
        determineDeviceType(
          existing.entities
        );

      continue;
    }

    grouped.set(key, {
      localFingerprint:
        buildFingerprint(entity),

      name: entity.name,
      provider: "home_assistant",

      primaryState: entity.state,
      available: entity.available,

      manufacturer: null,
      model: null,

      deviceType:
        entity.domain,

      domains: [
        entity.domain,
      ],

      entities: [
        entity,
      ],

      entityCount: 1,
    });
  }

  return Array.from(
    grouped.values()
  ).sort((first, second) =>
    first.name.localeCompare(
      second.name
    )
  );
}