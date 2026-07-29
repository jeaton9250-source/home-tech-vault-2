import type {
  GroupedHomeAssistantDevice,
} from "./types";

import type {
  HomeAssistantEntitySyncPayload,
} from "../api";

function readSupportedFeatures(
  attributes: Record<string, unknown>
): number | null {
  const value =
    attributes.supported_features;

  return typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0
    ? value
    : null;
}

export function mapHomeAssistantEntitiesForSync(
  devices: GroupedHomeAssistantDevice[]
): HomeAssistantEntitySyncPayload[] {
  return devices.flatMap((device) =>
    device.entities.map((entity) => ({
      localFingerprint:
        device.localFingerprint,

      entityId:
        entity.entityId,

      domain:
        entity.domain,

      objectId:
        entity.objectId,

      friendlyName:
        entity.name,

      currentState:
        entity.state,

      available:
        entity.available,

      deviceClass:
        entity.deviceClass,

      unitOfMeasurement:
        entity.unitOfMeasurement,

      supportedFeatures:
        readSupportedFeatures(
          entity.attributes
        ),

      attributes:
        entity.attributes,

      lastChangedAt:
        entity.lastChangedAt,

      lastUpdatedAt:
        entity.lastUpdatedAt,
    }))
  );
}
