import {
  HomeAssistantEntityValidationError,
  parseHomeAssistantEntitySyncPayload,
} from "@/lib/connector/homeAssistantEntityValidation";

import {
  connectorErrorResponse,
  connectorJsonResponse,
  connectorServerErrorResponse,
} from "@/lib/connector/responses";

import {
  connectorSessionResponse,
  requireConnectorSession,
} from "@/lib/connector/requireConnectorSession";

import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session =
      await requireConnectorSession(request);

    const body = await request.json();

    const nowIso = new Date().toISOString();

    const payload =
      parseHomeAssistantEntitySyncPayload(
        body,
        nowIso
      );

    const admin = createAdminClient();

    const fingerprints = [
      ...new Set(
        payload.entities
          .map(
            (entity) =>
              entity.localFingerprint
          )
          .filter(
            (
              value
            ): value is string =>
              Boolean(value)
          )
      ),
    ];

    const discoveredByFingerprint =
      new Map<
        string,
        {
          id: string;
          imported_device_id:
            | string
            | null;
        }
      >();

    if (fingerprints.length > 0) {
      const {
        data: discoveredRows,
        error: discoveredError,
      } = await admin
        .from("discovered_devices")
        .select(
          "id, local_fingerprint, imported_device_id"
        )
        .eq(
          "connector_id",
          session.connectorId
        )
        .eq(
          "household_id",
          session.householdId
        )
        .in(
          "local_fingerprint",
          fingerprints
        );

      if (discoveredError) {
        throw discoveredError;
      }

      for (
        const row of
          discoveredRows ?? []
      ) {
        discoveredByFingerprint.set(
          row.local_fingerprint,
          {
            id: row.id,
            imported_device_id:
              row.imported_device_id,
          }
        );
      }
    }

    const rows = payload.entities.map(
      (entity) => {
        const discovered =
          entity.localFingerprint
            ? discoveredByFingerprint.get(
                entity.localFingerprint
              )
            : undefined;

        return {
          household_id:
            session.householdId,

          connector_id:
            session.connectorId,

          discovered_device_id:
            discovered?.id ?? null,

          device_id:
            discovered
              ?.imported_device_id ??
            null,

          local_fingerprint:
            entity.localFingerprint,

          entity_id:
            entity.entityId,

          domain:
            entity.domain,

          object_id:
            entity.objectId,

          friendly_name:
            entity.friendlyName,

          current_state:
            entity.currentState,

          available:
            entity.available,

          device_class:
            entity.deviceClass,

          unit_of_measurement:
            entity.unitOfMeasurement,

          supported_features:
            entity.supportedFeatures,

          attributes:
            entity.attributes,

          home_assistant_last_changed_at:
            entity.lastChangedAt,

          home_assistant_last_updated_at:
            entity.lastUpdatedAt,

          last_synced_at:
            payload.syncedAt,

          updated_at:
            payload.syncedAt,
        };
      }
    );

    if (rows.length > 0) {
      const { error: upsertError } =
        await admin
          .from(
            "home_assistant_entities"
          )
          .upsert(rows, {
            onConflict:
              "connector_id,entity_id",
          });

      if (upsertError) {
        throw upsertError;
      }
    }

    return connectorJsonResponse({
      ok: true,
      connectorId:
        session.connectorId,
      householdId:
        session.householdId,
      syncedAt:
        payload.syncedAt,
      received:
        payload.entities.length,
      upserted:
        rows.length,
    });
  } catch (error) {
    if (
      error instanceof
      HomeAssistantEntityValidationError
    ) {
      return connectorErrorResponse(
        error.message,
        400
      );
    }

    const sessionResponse =
      connectorSessionResponse(error);

    if (sessionResponse) {
      return connectorErrorResponse(
        sessionResponse.message,
        sessionResponse.status
      );
    }

    console.error(
      "Home Assistant entity sync error:",
      error instanceof Error
        ? error.message
        : error
    );

    return connectorServerErrorResponse();
  }
}
