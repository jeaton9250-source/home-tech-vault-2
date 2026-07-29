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

type CommandRow = {
  id: string;
  household_id: string;
  connector_id: string;
  entity_id: string;
  home_assistant_entity_id: string;
  domain: string;
  service: string;
  service_data: Record<string, unknown> | null;
  status: string;
  created_at: string;
  expires_at: string;
};

export async function POST(
  request: Request
) {
  try {
    const session =
      await requireConnectorSession(request);

    const admin =
      createAdminClient();

    const nowIso =
      new Date().toISOString();

    /*
     * Expire pending commands that are already stale.
     */
    const {
      error: expireError,
    } = await admin
      .from("home_assistant_commands")
      .update({
        status: "expired",
        completed_at: nowIso,
        updated_at: nowIso,
        error_message:
          "Command expired before the connector claimed it.",
      })
      .eq(
        "connector_id",
        session.connectorId
      )
      .eq(
        "household_id",
        session.householdId
      )
      .eq("status", "pending")
      .lte("expires_at", nowIso);

    if (expireError) {
      throw expireError;
    }

    /*
     * Load the oldest pending command for this connector.
     */
    const {
      data: pendingData,
      error: pendingError,
    } = await admin
      .from("home_assistant_commands")
      .select(
        [
          "id",
          "household_id",
          "connector_id",
          "entity_id",
          "home_assistant_entity_id",
          "domain",
          "service",
          "service_data",
          "status",
          "created_at",
          "expires_at",
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
      .eq("status", "pending")
      .gt("expires_at", nowIso)
      .order("created_at", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle();

    if (pendingError) {
      throw pendingError;
    }

    if (!pendingData) {
      return connectorJsonResponse({
        ok: true,
        command: null,
      });
    }

    const pendingCommand =
      pendingData as unknown as CommandRow;

    /*
     * Claim only if the command is still pending.
     * The status filter prevents duplicate execution.
     */
    const {
      data: claimedData,
      error: claimError,
    } = await admin
      .from("home_assistant_commands")
      .update({
        status: "claimed",
        claimed_at: nowIso,
        updated_at: nowIso,
      })
      .eq("id", pendingCommand.id)
      .eq(
        "connector_id",
        session.connectorId
      )
      .eq("status", "pending")
      .select(
        [
          "id",
          "home_assistant_entity_id",
          "domain",
          "service",
          "service_data",
          "status",
          "claimed_at",
          "expires_at",
        ].join(", ")
      )
      .maybeSingle();

    if (claimError) {
      throw claimError;
    }

    /*
     * Another request may have claimed it first.
     */
    if (!claimedData) {
      return connectorJsonResponse({
        ok: true,
        command: null,
      });
    }

    return connectorJsonResponse({
      ok: true,
      command: claimedData,
    });
  } catch (error) {
    const sessionResponse =
      connectorSessionResponse(error);

    if (sessionResponse) {
      return connectorErrorResponse(
        sessionResponse.message,
        sessionResponse.status
      );
    }

    console.error(
      "Home Assistant command claim error:",
      error instanceof Error
        ? error.message
        : error
    );

    return connectorServerErrorResponse();
  }
}
