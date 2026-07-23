import {
  HeartbeatValidationError,
  parseHeartbeatPayload,
} from "@/lib/connector/heartbeatValidation";
import { checkConnectorHeartbeatRateLimit } from "@/lib/connector/heartbeatRateLimit";
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

import type { HeartbeatRequestBody } from "@/lib/connector/heartbeatValidation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session =
      await requireConnectorSession(request);

    if (
      !checkConnectorHeartbeatRateLimit(
        session.connectorId
      )
    ) {
      return connectorErrorResponse(
        "Too many heartbeat requests. Please try again shortly.",
        429
      );
    }

    const body =
      (await request.json()) as HeartbeatRequestBody;

    const payload =
      parseHeartbeatPayload(body);

    const nowIso = new Date().toISOString();
    const admin = createAdminClient();

    const { error: updateError } = await admin
      .from("connector_installations")
      .update({
        last_seen_at: nowIso,
        app_version: payload.appVersion,
        platform: payload.platform,
        updated_at: nowIso,
      })
      .eq("id", session.connectorId)
      .eq("status", "active")
      .is("revoked_at", null);

    if (updateError) {
      throw updateError;
    }

    return connectorJsonResponse({
      ok: true,
      connectorId: session.connectorId,
      householdId: session.householdId,
      serverTime: nowIso,
    });
  } catch (error) {
    if (error instanceof HeartbeatValidationError) {
      return connectorErrorResponse(
        error.message,
        400
      );
    }

    const sessionResponse =
      connectorSessionResponse(error);

    if (sessionResponse) {
      return connectorJsonResponse(
        sessionResponse.body,
        { status: sessionResponse.status }
      );
    }

    console.error(
      "Connector heartbeat error:",
      error instanceof Error
        ? error.message
        : error
    );

    return connectorServerErrorResponse();
  }
}
