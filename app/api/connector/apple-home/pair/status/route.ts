import {
  resolveAppleHomePairingStatus,
  type AppleHomePairingStatus,
} from "@/lib/connector/appleHome/pairing";

import {
  connectorSessionResponse,
  requireConnectorSession,
} from "@/lib/connector/requireConnectorSession";

import {
  connectorErrorResponse,
  connectorJsonResponse,
  connectorServerErrorResponse,
} from "@/lib/connector/responses";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request
) {
  try {
    const connector =
      await requireConnectorSession(
        request
      );

    const requestUrl =
      new URL(request.url);

    const sessionId =
      requestUrl.searchParams
        .get("sessionId")
        ?.trim();

    if (!sessionId) {
      return connectorErrorResponse(
        "A sessionId is required.",
        400
      );
    }

    const admin =
      createAdminClient();

    const {
      data: session,
      error,
    } = await admin
      .from(
        "apple_home_pairing_sessions"
      )
      .select(
        "id, household_id, connector_id, status, expires_at, approved_at, created_at, updated_at"
      )
      .eq("id", sessionId)
      .eq(
        "connector_id",
        connector.connectorId
      )
      .eq(
        "household_id",
        connector.householdId
      )
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!session) {
      return connectorErrorResponse(
        "Apple Home pairing session was not found.",
        404
      );
    }

    const resolvedStatus =
      resolveAppleHomePairingStatus(
        session.status as
          AppleHomePairingStatus,
        session.expires_at
      );

    if (
      resolvedStatus ===
        "expired" &&
      session.status === "pending"
    ) {
      await admin
        .from(
          "apple_home_pairing_sessions"
        )
        .update({
          status: "expired",
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", session.id)
        .eq("status", "pending");
    }

    return connectorJsonResponse({
      ok: true,
      sessionId: session.id,
      status: resolvedStatus,
      expiresAt:
        session.expires_at,
      approvedAt:
        session.approved_at,
    });
  } catch (error) {
    const sessionResponse =
      connectorSessionResponse(error);

    if (sessionResponse) {
      return connectorErrorResponse(
        sessionResponse.body.error,
        sessionResponse.status
      );
    }

    console.error(
      "Apple Home pair status error:",
      error instanceof Error
        ? error.message
        : error
    );

    return connectorServerErrorResponse();
  }
}
