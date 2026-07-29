import {
  connectorErrorResponse,
  connectorJsonResponse,
  connectorServerErrorResponse,
} from "@/lib/connector/responses";

import {
  householdAccessResponse,
  requireHouseholdMember,
  requireHouseholdMutator,
} from "@/lib/connector/requireHouseholdAdmin";

import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SAFE_DOMAINS = new Set([
  "light",
  "switch",
]);

const SAFE_SERVICES = new Set([
  "turn_on",
  "turn_off",
]);

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type CreateCommandBody = {
  householdId?: unknown;
  entityId?: unknown;
  service?: unknown;
};

type HomeAssistantEntityRow = {
  id: string;
  household_id: string;
  connector_id: string;
  entity_id: string;
  domain: string;
  friendly_name: string | null;
  available: boolean;
  current_state: string;
};

type ConnectorRow = {
  id: string;
  status: string;
  revoked_at: string | null;
};

function parseRequiredString(
  value: unknown,
  label: string
) {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new Error(
      `${label} is required.`
    );
  }

  return value.trim();
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

    const commandId =
      url.searchParams.get(
        "commandId"
      )?.trim() ?? "";

    if (!UUID_PATTERN.test(commandId)) {
      return connectorErrorResponse(
        "A valid commandId is required.",
        400
      );
    }

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
        "home_assistant_commands"
      )
      .select(
        [
          "id",
          "entity_id",
          "home_assistant_entity_id",
          "domain",
          "service",
          "status",
          "claimed_at",
          "completed_at",
          "error_message",
          "created_at",
          "expires_at",
        ].join(", ")
      )
      .eq("id", commandId)
      .eq(
        "household_id",
        memberContext.householdId
      )
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return connectorErrorResponse(
        "Home Assistant command not found.",
        404
      );
    }

    return connectorJsonResponse({
      command: data,
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
      "Home Assistant command status error:",
      error instanceof Error
        ? error.message
        : error
    );

    return connectorServerErrorResponse();
  }
}

export async function POST(
  request: Request
) {
  try {
    const body =
      (await request.json()) as CreateCommandBody;

    const householdId =
      parseRequiredString(
        body.householdId,
        "householdId"
      );

    const entityRecordId =
      parseRequiredString(
        body.entityId,
        "entityId"
      );

    const service =
      parseRequiredString(
        body.service,
        "service"
      );

    if (
      !UUID_PATTERN.test(entityRecordId)
    ) {
      return connectorErrorResponse(
        "A valid Home Assistant entity ID is required.",
        400
      );
    }

    if (!SAFE_SERVICES.has(service)) {
      return connectorErrorResponse(
        "Only turn_on and turn_off commands are currently supported.",
        400
      );
    }

    const memberContext =
      await requireHouseholdMutator(
        householdId
      );

    const admin =
      createAdminClient();

    const {
      data: entityData,
      error: entityError,
    } = await admin
      .from("home_assistant_entities")
      .select(
        [
          "id",
          "household_id",
          "connector_id",
          "entity_id",
          "domain",
          "friendly_name",
          "available",
          "current_state",
        ].join(", ")
      )
      .eq("id", entityRecordId)
      .eq(
        "household_id",
        memberContext.householdId
      )
      .maybeSingle();

    if (entityError) {
      throw entityError;
    }

    if (!entityData) {
      return connectorErrorResponse(
        "Home Assistant entity not found.",
        404
      );
    }

    const entity =
      entityData as unknown as HomeAssistantEntityRow;

    if (!SAFE_DOMAINS.has(entity.domain)) {
      return connectorErrorResponse(
        "This Home Assistant entity cannot be controlled from Home Tech Vault yet.",
        400
      );
    }

    if (!entity.available) {
      return connectorErrorResponse(
        "This Home Assistant entity is currently unavailable.",
        409
      );
    }

    const {
      data: connectorData,
      error: connectorError,
    } = await admin
      .from("connector_installations")
      .select(
        "id, status, revoked_at"
      )
      .eq(
        "id",
        entity.connector_id
      )
      .eq(
        "household_id",
        memberContext.householdId
      )
      .maybeSingle();

    if (connectorError) {
      throw connectorError;
    }

    if (!connectorData) {
      return connectorErrorResponse(
        "The connector for this entity was not found.",
        404
      );
    }

    const connector =
      connectorData as unknown as ConnectorRow;

    if (
      connector.status !== "active" ||
      connector.revoked_at
    ) {
      return connectorErrorResponse(
        "The connector for this entity is not active.",
        409
      );
    }

    const now = new Date();
    const nowIso = now.toISOString();

    const expiresAt =
      new Date(
        now.getTime() +
          2 * 60 * 1000
      ).toISOString();

    const {
      data: commandData,
      error: commandError,
    } = await admin
      .from("home_assistant_commands")
      .insert({
        household_id:
          memberContext.householdId,

        connector_id:
          entity.connector_id,

        entity_id:
          entity.id,

        requested_by:
          memberContext.userId,

        home_assistant_entity_id:
          entity.entity_id,

        domain:
          entity.domain,

        service,

        status:
          "pending",

        service_data: {},

        expires_at:
          expiresAt,

        created_at:
          nowIso,

        updated_at:
          nowIso,
      })
      .select(
        [
          "id",
          "status",
          "domain",
          "service",
          "home_assistant_entity_id",
          "created_at",
          "expires_at",
        ].join(", ")
      )
      .single();

    if (commandError) {
      throw commandError;
    }

    return connectorJsonResponse(
      {
        ok: true,
        command: commandData,
        entity: {
          id: entity.id,
          entityId:
            entity.entity_id,
          friendlyName:
            entity.friendly_name,
          domain:
            entity.domain,
          previousState:
            entity.current_state,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    const accessResponse =
      householdAccessResponse(error);

    if (accessResponse) {
      return connectorErrorResponse(
        accessResponse.message,
        accessResponse.status
      );
    }

    if (
      error instanceof SyntaxError
    ) {
      return connectorErrorResponse(
        "Invalid JSON request.",
        400
      );
    }

    if (
      error instanceof Error &&
      error.message.endsWith(
        "is required."
      )
    ) {
      return connectorErrorResponse(
        error.message,
        400
      );
    }

    console.error(
      "Home Assistant command creation error:",
      error instanceof Error
        ? error.message
        : error
    );

    return connectorServerErrorResponse();
  }
}
