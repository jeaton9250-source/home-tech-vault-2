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

import {
  buildHomeAssistantRecognitionSuggestions,
} from "@/lib/connector/homeAssistantRecognition";

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
          recognition_status:
            | string
            | null;
          identification_confidence:
            | string
            | null;
          friendly_name:
            | string
            | null;
          likely_category:
            | string
            | null;
          identification_reasons:
            | string[]
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
          [
            "id",
            "local_fingerprint",
            "imported_device_id",
            "recognition_status",
            "identification_confidence",
            "friendly_name",
            "likely_category",
            "identification_reasons",
          ].join(", ")
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

      const typedDiscoveredRows =
        (discoveredRows ??
          []) as unknown as Array<{
            id: string;
            local_fingerprint: string;
            imported_device_id:
              | string
              | null;
            recognition_status:
              | string
              | null;
            identification_confidence:
              | string
              | null;
            friendly_name:
              | string
              | null;
            likely_category:
              | string
              | null;
            identification_reasons:
              | string[]
              | null;
          }>;

      for (
        const row of
          typedDiscoveredRows
      ) {
        discoveredByFingerprint.set(
          row.local_fingerprint,
          {
            id: row.id,
            imported_device_id:
              row.imported_device_id,
            recognition_status:
              row.recognition_status,
            identification_confidence:
              row.identification_confidence,
            friendly_name:
              row.friendly_name,
            likely_category:
              row.likely_category,
            identification_reasons:
              row.identification_reasons,
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

    /*
     * Use sanitized Home Assistant metadata
     * to strengthen passive network-device
     * recognition. Accepted household edits
     * are never overwritten.
     */
    const recognitionSuggestions =
      buildHomeAssistantRecognitionSuggestions(
        payload.entities.map(
          (entity) => ({
            localFingerprint:
              entity.localFingerprint,
            entityId:
              entity.entityId,
            domain:
              entity.domain,
            objectId:
              entity.objectId,
            friendlyName:
              entity.friendlyName,
            deviceClass:
              entity.deviceClass,
            attributes:
              entity.attributes,
          })
        )
      );

    let recognitionEnriched = 0;

    for (
      const suggestion of
      recognitionSuggestions
    ) {
      const discovered =
        discoveredByFingerprint.get(
          suggestion.localFingerprint
        );

      if (
        !discovered ||
        discovered.recognition_status ===
          "accepted"
      ) {
        continue;
      }

      const existingReasons =
        discovered
          .identification_reasons ??
        [];

      const mergedReasons = [
        ...new Set([
          ...existingReasons,
          ...suggestion.reasons,
        ]),
      ].slice(0, 20);

      const confidenceRank:
        Record<string, number> = {
          unknown: 0,
          low: 1,
          medium: 2,
          high: 3,
          exact: 4,
        };

      const existingConfidence =
        discovered
          .identification_confidence ??
        "unknown";

      const nextConfidence =
        (
          confidenceRank[
            suggestion.confidence
          ] ?? 0
        ) >
        (
          confidenceRank[
            existingConfidence
          ] ?? 0
        )
          ? suggestion.confidence
          : existingConfidence;

      const update: Record<
        string,
        unknown
      > = {
        identification_reasons:
          mergedReasons,
        identification_confidence:
          nextConfidence,
        updated_at: nowIso,
      };

      if (
        !discovered
          .friendly_name?.trim() &&
        suggestion.friendlyName
      ) {
        update.friendly_name =
          suggestion.friendlyName;
      }

      if (
        !discovered
          .likely_category?.trim() &&
        suggestion.likelyCategory
      ) {
        update.likely_category =
          suggestion.likelyCategory;
      }

      const {
        error: enrichmentError,
      } = await admin
        .from("discovered_devices")
        .update(update)
        .eq(
          "id",
          discovered.id
        )
        .eq(
          "household_id",
          session.householdId
        )
        .neq(
          "recognition_status",
          "accepted"
        );

      if (enrichmentError) {
        console.error(
          "Home Assistant recognition enrichment failed:",
          enrichmentError.message
        );

        continue;
      }

      recognitionEnriched += 1;
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
      recognitionEnriched,
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
