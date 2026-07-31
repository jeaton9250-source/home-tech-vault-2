export type HomeAssistantRecognitionEntity = {
  localFingerprint: string | null;
  entityId: string;
  domain: string;
  objectId: string;
  friendlyName: string | null;
  deviceClass: string | null;
  attributes: Record<string, unknown>;
};

export type HomeAssistantRecognitionSuggestion = {
  localFingerprint: string;
  friendlyName: string | null;
  likelyCategory: string | null;
  suggestedLocation: string | null;
  confidence:
    | "high"
    | "medium"
    | "low";
  reasons: string[];
};

const ROOM_WORDS = [
  "living room",
  "family room",
  "bedroom",
  "guest room",
  "kitchen",
  "dining room",
  "bathroom",
  "office",
  "garage",
  "hallway",
  "entryway",
  "foyer",
  "laundry",
  "basement",
  "upstairs",
  "downstairs",
  "porch",
  "patio",
  "backyard",
  "front yard",
  "nursery",
  "loft",
  "bonus room",
] as const;

const GENERIC_ENTITY_WORDS =
  new Set([
    "light",
    "switch",
    "sensor",
    "binary",
    "media",
    "player",
    "temperature",
    "humidity",
    "battery",
    "power",
    "energy",
    "online",
    "status",
    "motion",
    "occupancy",
    "contact",
    "update",
    "signal",
    "strength",
  ]);

function titleCase(
  value: string
): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function normalizeText(
  value: string
): string {
  return value
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stringAttribute(
  attributes:
    Record<string, unknown>,
  key: string
): string | null {
  const value = attributes[key];

  return typeof value === "string" &&
    value.trim()
    ? value.trim()
    : null;
}

function findRoom(
  values: Array<
    string | null | undefined
  >
): string | null {
  const haystack = normalizeText(
    values
      .filter(
        (
          value
        ): value is string =>
          Boolean(value?.trim())
      )
      .join(" ")
  );

  const matchedRoom =
    ROOM_WORDS.find((room) =>
      haystack.includes(room)
    );

  return matchedRoom
    ? titleCase(matchedRoom)
    : null;
}

function categoryForEntity(
  entity:
    HomeAssistantRecognitionEntity
): string | null {
  const deviceClass =
    normalizeText(
      entity.deviceClass ?? ""
    );

  switch (entity.domain) {
    case "light":
      return "Smart Lighting";

    case "switch":
      return "Smart Home";

    case "climate":
      return "Climate";

    case "lock":
      return "Security";

    case "camera":
      return "Security Camera";

    case "alarm_control_panel":
      return "Security";

    case "cover":
      if (
        deviceClass.includes(
          "garage"
        )
      ) {
        return "Garage Door";
      }

      return "Smart Home";

    case "media_player":
      return "TV & Streaming";

    case "vacuum":
      return "Robot Vacuum";

    case "fan":
      return "Smart Home";

    case "humidifier":
      return "Climate";

    case "person":
    case "device_tracker":
      return "Mobile";

    case "binary_sensor":
      if (
        deviceClass.includes(
          "door"
        ) ||
        deviceClass.includes(
          "window"
        ) ||
        deviceClass.includes(
          "motion"
        ) ||
        deviceClass.includes(
          "occupancy"
        ) ||
        deviceClass.includes(
          "smoke"
        ) ||
        deviceClass.includes(
          "gas"
        )
      ) {
        return "Security";
      }

      return "Sensor";

    case "sensor":
      if (
        deviceClass.includes(
          "temperature"
        ) ||
        deviceClass.includes(
          "humidity"
        )
      ) {
        return "Climate";
      }

      if (
        deviceClass.includes(
          "battery"
        ) ||
        deviceClass.includes(
          "power"
        ) ||
        deviceClass.includes(
          "energy"
        )
      ) {
        return "Sensor";
      }

      return null;

    default:
      return null;
  }
}

function cleanedObjectName(
  entity:
    HomeAssistantRecognitionEntity
): string | null {
  const tokens = entity.objectId
    .split("_")
    .filter(
      (token) =>
        token &&
        !GENERIC_ENTITY_WORDS.has(
          token.toLowerCase()
        )
    );

  if (tokens.length === 0) {
    return null;
  }

  return titleCase(
    tokens.join(" ")
  );
}

function bestFriendlyName(
  entities:
    HomeAssistantRecognitionEntity[]
): string | null {
  const preferred =
    entities.find(
      (entity) =>
        entity.friendlyName?.trim() &&
        ![
          "sensor",
          "binary_sensor",
        ].includes(entity.domain)
    ) ??
    entities.find(
      (entity) =>
        entity.friendlyName?.trim()
    );

  if (preferred?.friendlyName) {
    return preferred.friendlyName.trim();
  }

  for (const entity of entities) {
    const attributeName =
      stringAttribute(
        entity.attributes,
        "device_name"
      ) ??
      stringAttribute(
        entity.attributes,
        "name"
      );

    if (attributeName) {
      return attributeName;
    }
  }

  return (
    cleanedObjectName(
      entities[0]!
    ) ?? null
  );
}

function strongestCategory(
  entities:
    HomeAssistantRecognitionEntity[]
): string | null {
  const priority = [
    "Security Camera",
    "Garage Door",
    "Robot Vacuum",
    "Smart Lighting",
    "Climate",
    "TV & Streaming",
    "Security",
    "Smart Home",
    "Mobile",
    "Sensor",
  ];

  const categories =
    entities
      .map(categoryForEntity)
      .filter(
        (
          value
        ): value is string =>
          Boolean(value)
      );

  return (
    priority.find(
      (category) =>
        categories.includes(category)
    ) ??
    categories[0] ??
    null
  );
}

export function buildHomeAssistantRecognitionSuggestions(
  entities:
    HomeAssistantRecognitionEntity[]
): HomeAssistantRecognitionSuggestion[] {
  const groups =
    new Map<
      string,
      HomeAssistantRecognitionEntity[]
    >();

  for (const entity of entities) {
    if (!entity.localFingerprint) {
      continue;
    }

    const current =
      groups.get(
        entity.localFingerprint
      ) ?? [];

    current.push(entity);

    groups.set(
      entity.localFingerprint,
      current
    );
  }

  const suggestions:
    HomeAssistantRecognitionSuggestion[] =
    [];

  for (
    const [
      localFingerprint,
      groupedEntities,
    ] of groups
  ) {
    const friendlyName =
      bestFriendlyName(
        groupedEntities
      );

    const likelyCategory =
      strongestCategory(
        groupedEntities
      );

    const suggestedLocation =
      findRoom(
        groupedEntities.flatMap(
          (entity) => [
            entity.friendlyName,
            entity.objectId,
            entity.entityId,
            stringAttribute(
              entity.attributes,
              "area_name"
            ),
            stringAttribute(
              entity.attributes,
              "room"
            ),
          ]
        )
      );

    const domains = [
      ...new Set(
        groupedEntities.map(
          (entity) =>
            entity.domain
        )
      ),
    ];

    const reasons: string[] = [
      `Home Assistant linked ${groupedEntities.length} ${
        groupedEntities.length === 1
          ? "entity"
          : "entities"
      }`,
      `Home Assistant domains: ${domains.join(
        ", "
      )}`,
    ];

    if (friendlyName) {
      reasons.push(
        `Home Assistant name: ${friendlyName}`
      );
    }

    if (likelyCategory) {
      reasons.push(
        `Category inferred from Home Assistant: ${likelyCategory}`
      );
    }

    if (suggestedLocation) {
      reasons.push(
        `Possible room: ${suggestedLocation}`
      );
    }

    const evidenceCount = [
      Boolean(friendlyName),
      Boolean(likelyCategory),
      Boolean(suggestedLocation),
      groupedEntities.length > 1,
    ].filter(Boolean).length;

    suggestions.push({
      localFingerprint,
      friendlyName,
      likelyCategory,
      suggestedLocation,
      confidence:
        evidenceCount >= 3
          ? "high"
          : evidenceCount >= 2
            ? "medium"
            : "low",
      reasons,
    });
  }

  return suggestions;
}
