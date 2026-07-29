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

type CompletionBody = {
  commandId?: unknown;
  command_id?: unknown;
  succeeded?: unknown;
  errorMessage?: unknown;
  error_message?: unknown;
  result?: unknown;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

function sanitizeErrorMessage(
  value: unknown
) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, 500);
}

function sanitizeResult(
  value: unknown
): Record<string, unknown> {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return {};
  }

  const serialized =
    JSON.stringify(value);

  if (serialized.length > 8_000) {
    return {
      message:
        "Connector result was too large to store.",
    };
  }

  return value as Record<
    string,
    unknown
  >;
}

export async function POST(
  request: Request
) {
  try {
    const session =
      await requireConnectorSession(request);

    const body =
      (await request.json()) as CompletionBody;

    const commandIdValue =
      body.commandId ??
      body.command_id;

    const commandId =
      typeof commandIdValue === "string"
        ? commandIdValue.trim()
        : "";

    if (
      !UUID_PATTERN.test(commandId)
    ) {
      return connectorErrorResponse(
        "A valid commandId is required.",
        400
      );
    }

    if (
      typeof body.succeeded !==
      "boolean"
    ) {
      return connectorErrorResponse(
        "succeeded must be true or false.",
        400
      );
    }

    const nowIso =
      new Date().toISOString();

    const status =
      body.succeeded
        ? "succeeded"
        : "failed";

    const errorMessage =
      body.succeeded
        ? null
        : sanitizeErrorMessage(
            body.errorMessage ??
              body.error_message
          ) ??
          "Home Assistant command failed.";

    const result =
      sanitizeResult(body.result);

    const admin =
      createAdminClient();

    const {
      data,
      error,
    } = await admin
      .from(
        "home_assistant_commands"
      )
      .update({
        status,
        completed_at: nowIso,
        updated_at: nowIso,
        error_message:
          errorMessage,
        result,
      })
      .eq("id", commandId)
      .eq(
        "connector_id",
        session.connectorId
      )
      .eq(
        "household_id",
        session.householdId
      )
      .eq("status", "claimed")
      .select(
        [
          "id",
          "entity_id",
          "service",
          "status",
          "completed_at",
          "error_message",
        ].join(", ")
      )
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return connectorErrorResponse(
        "The claimed command was not found.",
        404
      );
    }

    const completedCommand =
      data as unknown as {
        id: string;
        entity_id: string;
        service:
          | "turn_on"
          | "turn_off";
        status:
          | "succeeded"
          | "failed";
        completed_at: string;
        error_message:
          | string
          | null;
      };

    if (
      body.succeeded &&
      completedCommand.entity_id &&
      (
        completedCommand.service === "turn_on" ||
        completedCommand.service === "turn_off"
      )
    ) {
      const nextState =
        completedCommand.service === "turn_on"
          ? "on"
          : "off";

      const {
        error: entityUpdateError,
      } = await admin
        .from(
          "home_assistant_entities"
        )
        .update({
          current_state: nextState,
          available: true,
          updated_at: nowIso,
          last_synced_at: nowIso,
        })
        .eq(
          "id",
          completedCommand.entity_id
        )
        .eq(
          "connector_id",
          session.connectorId
        )
        .eq(
          "household_id",
          session.householdId
        );

      if (entityUpdateError) {
        throw entityUpdateError;
      }
    }

    return connectorJsonResponse({
      ok: true,
      command: completedCommand,
    });
  } catch (error) {
    if (
      error instanceof SyntaxError
    ) {
      return connectorErrorResponse(
        "Invalid JSON request.",
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
      "Home Assistant command completion error:",
      error instanceof Error
        ? error.message
        : error
    );

    return connectorServerErrorResponse();
  }
}
