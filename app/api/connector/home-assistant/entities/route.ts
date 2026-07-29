import {
  connectorErrorResponse,
  connectorJsonResponse,
  connectorServerErrorResponse,
} from "@/lib/connector/responses";

import {
  householdAccessResponse,
  requireHouseholdMember,
} from "@/lib/connector/requireHouseholdAdmin";

import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HomeAssistantEntityRow = {
  id: string;
  household_id: string;
  connector_id: string;
  discovered_device_id: string | null;
  device_id: string | null;
  local_fingerprint: string | null;
  entity_id: string;
  domain: string;
  object_id: string;
  friendly_name: string | null;
  current_state: string;
  available: boolean;
  device_class: string | null;
  unit_of_measurement: string | null;
  supported_features: number | null;
  attributes: Record<string, unknown> | null;
  home_assistant_last_changed_at: string | null;
  home_assistant_last_updated_at: string | null;
  last_synced_at: string;
};

function toSummary(
  row: HomeAssistantEntityRow
) {
  return {
    id: row.id,
    connectorId: row.connector_id,
    discoveredDeviceId:
      row.discovered_device_id,
    deviceId: row.device_id,
    localFingerprint:
      row.local_fingerprint,
    entityId: row.entity_id,
    domain: row.domain,
    objectId: row.object_id,
    friendlyName:
      row.friendly_name,
    currentState:
      row.current_state,
    available: row.available,
    deviceClass:
      row.device_class,
    unitOfMeasurement:
      row.unit_of_measurement,
    supportedFeatures:
      row.supported_features,
    attributes:
      row.attributes ?? {},
    lastChangedAt:
      row.home_assistant_last_changed_at,
    lastUpdatedAt:
      row.home_assistant_last_updated_at,
    lastSyncedAt:
      row.last_synced_at,
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const householdId =
      url.searchParams.get(
        "householdId"
      );

    const memberContext =
      await requireHouseholdMember(
        householdId
      );

    const admin =
      createAdminClient();

    const { data, error } =
      await admin
        .from(
          "home_assistant_entities"
        )
        .select(
          [
            "id",
            "household_id",
            "connector_id",
            "discovered_device_id",
            "device_id",
            "local_fingerprint",
            "entity_id",
            "domain",
            "object_id",
            "friendly_name",
            "current_state",
            "available",
            "device_class",
            "unit_of_measurement",
            "supported_features",
            "attributes",
            "home_assistant_last_changed_at",
            "home_assistant_last_updated_at",
            "last_synced_at",
          ].join(", ")
        )
        .eq(
          "household_id",
          memberContext.householdId
        )
        .order(
          "friendly_name",
          {
            ascending: true,
            nullsFirst: false,
          }
        )
        .order(
          "entity_id",
          {
            ascending: true,
          }
        );

    if (error) {
      throw error;
    }

    const entities = (
      (data ?? []) as unknown as HomeAssistantEntityRow[]
    ).map(toSummary);

    const availableCount =
      entities.filter(
        (entity) =>
          entity.available
      ).length;

    const domainCount =
      new Set(
        entities.map(
          (entity) =>
            entity.domain
        )
      ).size;

    return connectorJsonResponse({
      householdId:
        memberContext.householdId,
      entities,
      stats: {
        entityCount:
          entities.length,
        availableCount,
        domainCount,
      },
    });
  } catch (error) {
    const accessResponse =
      householdAccessResponse(error);

    if (accessResponse) {
      return connectorErrorResponse(
        accessResponse.message,
        accessResponse.status
      );
    }

    console.error(
      "Home Assistant entity list error:",
      error instanceof Error
        ? error.message
        : error
    );

    return connectorServerErrorResponse();
  }
}
