import fs from "node:fs";
import path from "node:path";

const PROJECT_ROOT = process.cwd();

const ENV_FILE = path.join(
  PROJECT_ROOT,
  ".env.homeassistant.local"
);

const OUTPUT_FILE = path.join(
  PROJECT_ROOT,
  "scripts/home-assistant/home-assistant-import-preview.json"
);

/*
 * Home Assistant domains that normally represent
 * useful household devices, controls, or readings.
 */
const ALLOWED_DOMAINS = new Set([
  "air_quality",
  "binary_sensor",
  "button",
  "camera",
  "climate",
  "cover",
  "fan",
  "humidifier",
  "light",
  "lock",
  "media_player",
  "number",
  "remote",
  "select",
  "sensor",
  "siren",
  "switch",
  "vacuum",
  "valve",
  "water_heater",
]);

/*
 * Built-in or administrative entities that should
 * normally not become Home Tech Vault devices.
 */
const BLOCKED_ENTITY_PREFIXES = [
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

/*
 * Sensor device classes that are useful enough
 * to include in a Home Tech Vault import.
 */
const USEFUL_SENSOR_CLASSES = new Set([
  "aqi",
  "atmospheric_pressure",
  "battery",
  "carbon_dioxide",
  "carbon_monoxide",
  "current",
  "data_rate",
  "distance",
  "duration",
  "energy",
  "frequency",
  "gas",
  "humidity",
  "illuminance",
  "moisture",
  "monetary",
  "nitrogen_dioxide",
  "nitrogen_monoxide",
  "nitrous_oxide",
  "ozone",
  "pm1",
  "pm10",
  "pm25",
  "power",
  "power_factor",
  "precipitation",
  "precipitation_intensity",
  "pressure",
  "reactive_energy",
  "reactive_power",
  "signal_strength",
  "sound_pressure",
  "speed",
  "sulphur_dioxide",
  "temperature",
  "volatile_organic_compounds",
  "volatile_organic_compounds_parts",
  "voltage",
  "volume",
  "volume_flow_rate",
  "volume_storage",
  "water",
  "weight",
  "wind_direction",
  "wind_speed",
]);

function loadEnvironmentFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Missing environment file: ${filePath}`
    );
  }

  const contents = fs.readFileSync(
    filePath,
    "utf8"
  );

  for (const rawLine of contents.split("\n")) {
    const line = rawLine.trim();

    if (
      !line ||
      line.startsWith("#")
    ) {
      continue;
    }

    const equalsIndex = line.indexOf("=");

    if (equalsIndex === -1) {
      continue;
    }

    const key = line
      .slice(0, equalsIndex)
      .trim();

    let value = line
      .slice(equalsIndex + 1)
      .trim();

    /*
     * Remove matching quotation marks.
     */
    if (
      (value.startsWith('"') &&
        value.endsWith('"')) ||
      (value.startsWith("'") &&
        value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (
      key &&
      process.env[key] === undefined
    ) {
      process.env[key] = value;
    }
  }
}

function normalizeBaseUrl(value) {
  return value
    .trim()
    .replace(/\/+$/, "");
}

function getDomain(entityId) {
  const separatorIndex =
    entityId.indexOf(".");

  if (separatorIndex === -1) {
    return "unknown";
  }

  return entityId.slice(
    0,
    separatorIndex
  );
}

function getObjectId(entityId) {
  const separatorIndex =
    entityId.indexOf(".");

  if (separatorIndex === -1) {
    return entityId;
  }

  return entityId.slice(
    separatorIndex + 1
  );
}

function titleCaseObjectId(objectId) {
  return objectId
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function readString(value) {
  return typeof value === "string"
    ? value
    : null;
}

function isBlockedEntity(entityId) {
  return BLOCKED_ENTITY_PREFIXES.some(
    (prefix) =>
      entityId.startsWith(prefix)
  );
}

function isUsefulSensor(entity) {
  const attributes =
    entity.attributes ?? {};

  const deviceClass = readString(
    attributes.device_class
  );

  /*
   * Keep known useful sensor classes.
   */
  if (
    deviceClass &&
    USEFUL_SENSOR_CLASSES.has(deviceClass)
  ) {
    return true;
  }

  /*
   * Sensors with units usually represent
   * meaningful measurements.
   */
  if (
    typeof attributes.unit_of_measurement ===
    "string"
  ) {
    return true;
  }

  /*
   * Keep sensors whose names suggest a useful
   * household measurement.
   */
  const searchableText = [
    entity.entity_id,
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
    "illuminance",
  ].some((term) =>
    searchableText.includes(term)
  );
}

function shouldImportEntity(entity) {
  const entityId =
    entity.entity_id ?? "";

  if (!entityId) {
    return false;
  }

  if (isBlockedEntity(entityId)) {
    return false;
  }

  const domain = getDomain(entityId);

  if (!ALLOWED_DOMAINS.has(domain)) {
    return false;
  }

  if (
    domain === "sensor" &&
    !isUsefulSensor(entity)
  ) {
    return false;
  }

  return true;
}

function normalizeEntity(entity) {
  const entityId = entity.entity_id;
  const domain = getDomain(entityId);
  const objectId = getObjectId(entityId);

  const attributes =
    entity.attributes ?? {};

  const friendlyName =
    readString(
      attributes.friendly_name
    ) ??
    titleCaseObjectId(objectId);

  const deviceClass =
    readString(
      attributes.device_class
    );

  const unitOfMeasurement =
    readString(
      attributes.unit_of_measurement
    );

  return {
    provider: "home_assistant",

    entityId,
    domain,
    objectId,

    name: friendlyName,
    state: entity.state ?? "unknown",

    deviceClass,
    unitOfMeasurement,

    available:
      entity.state !== "unavailable" &&
      entity.state !== "unknown",

    attributes,

    lastChangedAt:
      entity.last_changed ?? null,

    lastUpdatedAt:
      entity.last_updated ?? null,

    /*
     * These will be populated later using
     * Home Assistant registry information.
     */
    externalDeviceId: null,
    areaId: null,
    areaName: null,
    manufacturer: null,
    model: null,
    protocol: null,
  };
}

async function fetchStates({
  baseUrl,
  accessToken,
}) {
  let response;

  try {
    response = await fetch(
      `${baseUrl}/api/states`,
      {
        method: "GET",
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
          "Content-Type":
            "application/json",
        },
      }
    );
  } catch {
    throw new Error(
      "Unable to reach Home Assistant. Confirm that the virtual machine is running and the IP address is correct."
    );
  }

  if (!response.ok) {
    if (
      response.status === 401 ||
      response.status === 403
    ) {
      throw new Error(
        "Home Assistant rejected the access token."
      );
    }

    throw new Error(
      `Home Assistant returned ${response.status} ${response.statusText}.`
    );
  }

  const body = await response.json();

  if (!Array.isArray(body)) {
    throw new Error(
      "Home Assistant returned an unexpected states response."
    );
  }

  return body;
}

function buildGroupKey(entity) {
  /*
   * The friendly name works for the current
   * Apple TV/media-player entities because the
   * media_player and remote share the same name.
   *
   * Later, the Home Assistant device registry
   * will provide a true physical device ID.
   */
  return entity.name
    .trim()
    .toLowerCase();
}

function choosePrimaryState(
  existingDevice,
  entity
) {
  /*
   * Prefer media-player, light, switch, climate,
   * fan, cover, lock, and vacuum states over a
   * secondary remote entity.
   */
  const primaryDomains = new Set([
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

  if (
    primaryDomains.has(entity.domain)
  ) {
    return entity.state;
  }

  return existingDevice.primaryState;
}

function groupEntitiesIntoDevices(
  entities
) {
  const groupedDevices = new Map();

  for (const entity of entities) {
    const groupKey =
      buildGroupKey(entity);

    const existingDevice =
      groupedDevices.get(groupKey);

    if (existingDevice) {
      existingDevice.entities.push(
        entity
      );

      existingDevice.available =
        existingDevice.available ||
        entity.available;

      existingDevice.primaryState =
        choosePrimaryState(
          existingDevice,
          entity
        );

      continue;
    }

    groupedDevices.set(groupKey, {
      name: entity.name,
      provider: "home_assistant",
      primaryState: entity.state,
      available: entity.available,
      entities: [entity],
    });
  }

  return Array.from(
    groupedDevices.values()
  )
    .map((device) => {
      const domains = [
        ...new Set(
          device.entities.map(
            (entity) =>
              entity.domain
          )
        ),
      ];

      return {
        ...device,
        domains,
        entityCount:
          device.entities.length,
      };
    })
    .sort((first, second) =>
      first.name.localeCompare(
        second.name
      )
    );
}

function printEntityPreview(entities) {
  const rows = entities.map(
    (entity) => ({
      Domain: entity.domain,
      Name: entity.name,
      State: entity.state,
      Unit:
        entity.unitOfMeasurement ?? "",
      Entity: entity.entityId,
    })
  );

  if (rows.length === 0) {
    console.log(
      "No useful smart-home entities were found."
    );

    return;
  }

  console.table(rows);
}

function printDevicePreview(devices) {
  const rows = devices.map(
    (device) => ({
      Name: device.name,
      State: device.primaryState,
      Available: device.available,
      Domains:
        device.domains.join(", "),
      Entities:
        device.entityCount,
    })
  );

  if (rows.length === 0) {
    console.log(
      "No grouped devices were found."
    );

    return;
  }

  console.table(rows);
}

async function main() {
  loadEnvironmentFile(ENV_FILE);

  const rawUrl =
    process.env.HOME_ASSISTANT_URL;

  const accessToken =
    process.env.HOME_ASSISTANT_TOKEN;

  if (!rawUrl) {
    throw new Error(
      "HOME_ASSISTANT_URL is missing from .env.homeassistant.local."
    );
  }

  if (!accessToken) {
    throw new Error(
      "HOME_ASSISTANT_TOKEN is missing from .env.homeassistant.local."
    );
  }

  const baseUrl =
    normalizeBaseUrl(rawUrl);

  console.log(
    `Connecting to ${baseUrl}...`
  );

  const states = await fetchStates({
    baseUrl,
    accessToken,
  });

  const importableEntities = states
    .filter(shouldImportEntity)
    .map(normalizeEntity)
    .sort((first, second) => {
      const domainComparison =
        first.domain.localeCompare(
          second.domain
        );

      if (domainComparison !== 0) {
        return domainComparison;
      }

      return first.name.localeCompare(
        second.name
      );
    });

  const devices =
    groupEntitiesIntoDevices(
      importableEntities
    );

  const output = {
    generatedAt:
      new Date().toISOString(),

    source: {
      provider: "home_assistant",
      baseUrl,
    },

    totals: {
      receivedEntities:
        states.length,

      importableEntities:
        importableEntities.length,

      groupedDevices:
        devices.length,

      filteredEntities:
        states.length -
        importableEntities.length,
    },

    devices,
    entities: importableEntities,
  };

  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(
      output,
      null,
      2
    ),
    "utf8"
  );

  console.log("");

  console.log(
    `Home Assistant returned ${states.length} total entities.`
  );

  console.log(
    `${importableEntities.length} useful entities passed the import filter.`
  );

  console.log(
    `${devices.length} grouped devices were identified.`
  );

  console.log(
    `${states.length - importableEntities.length} system or unsupported entities were filtered out.`
  );

  console.log("");
  console.log(
    "Grouped device preview:"
  );
  console.log("");

  printDevicePreview(devices);

  console.log("");
  console.log(
    "Individual entity preview:"
  );
  console.log("");

  printEntityPreview(
    importableEntities
  );

  console.log("");

  console.log(
    `Saved preview to:\n${OUTPUT_FILE}`
  );
}

main().catch((error) => {
  console.error("");

  console.error(
    error instanceof Error
      ? error.message
      : error
  );

  process.exit(1);
});