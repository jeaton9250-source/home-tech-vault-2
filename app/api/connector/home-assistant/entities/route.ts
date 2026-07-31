import {
  connectorErrorResponse,
  connectorJsonResponse,
  connectorServerErrorResponse,
} from "@/lib/connector/responses";

import {
  householdAccessResponse,
  requireHouseholdMember,
} from "@/lib/connector/requireHouseholdAdmin";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

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

type VaultDeviceRow = {
  id: string;
  device_name: string | null;
  category: string | null;
  location: string | null;
  brand: string | null;
  manufacturer: string | null;
  model_number: string | null;
  online: boolean | null;
  last_seen_at: string | null;
};

function toSummary(
  row: HomeAssistantEntityRow,
  vaultDevice:
    | VaultDeviceRow
    | null
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

    vaultDevice: vaultDevice
      ? {
          id: vaultDevice.id,
          deviceName:
            vaultDevice.device_name,
          category:
            vaultDevice.category,
          location:
            vaultDevice.location,
          brand:
            vaultDevice.brand,
          manufacturer:
            vaultDevice.manufacturer,
          modelNumber:
            vaultDevice.model_number,
          online:
            vaultDevice.online,
          lastSeenAt:
            vaultDevice.last_seen_at,
        }
      : null,
  };
}

export async function GET(
  request: Request
) {
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

    const {
      data,
      error,
    } = await admin
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

    const rows =
      (data ?? []) as unknown as
        HomeAssistantEntityRow[];

    const linkedDeviceIds = [
      ...new Set(
        rows
          .map(
            (row) =>
              row.device_id
          )
          .filter(
            (
              value
            ): value is string =>
              Boolean(value)
          )
      ),
    ];

    const vaultDeviceById =
      new Map<
        string,
        VaultDeviceRow
      >();

    if (
      linkedDeviceIds.length > 0
    ) {
      const {
        data: vaultRows,
        error: vaultError,
      } = await admin
        .from("devices")
        .select(
          [
            "id",
            "device_name",
            "category",
            "location",
            "brand",
            "manufacturer",
            "model_number",
            "online",
            "last_seen_at",
          ].join(", ")
        )
        .eq(
          "household_id",
          memberContext.householdId
        )
        .in(
          "id",
          linkedDeviceIds
        );

      if (vaultError) {
        throw vaultError;
      }

      for (
        const vaultDevice of
        (vaultRows ??
          []) as unknown as VaultDeviceRow[]
      ) {
        vaultDeviceById.set(
          vaultDevice.id,
          vaultDevice
        );
      }
    }

    const entities =
      rows.map((row) =>
        toSummary(
          row,
          row.device_id
            ? vaultDeviceById.get(
                row.device_id
              ) ?? null
            : null
        )
      );

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
