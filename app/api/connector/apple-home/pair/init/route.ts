import {
  generateAppleHomePairingCode,
  getAppleHomePairingExpiration,
  hashAppleHomePairingCode,
} from "@/lib/connector/appleHome/pairing";

import {
  connectorSessionResponse,
  requireConnectorSession,
} from "@/lib/connector/requireConnectorSession";

import {
  buildServerPlanAccessContext,
} from "@/lib/permissions/serverPlanAccess";

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

function hasAppleHomeAccess(input: {
  effectivePlan: string;
  isPlatformAdmin: boolean;
}) {
  return (
    input.isPlatformAdmin ||
    input.effectivePlan === "pro" ||
    input.effectivePlan === "family"
  );
}

export async function POST(
  request: Request
) {
  try {
    const connector =
      await requireConnectorSession(
        request
      );

    const admin =
      createAdminClient();

    const planContext =
      await buildServerPlanAccessContext(
        admin,
        connector.installation
          .created_by_user_id
      );

    if (
      !hasAppleHomeAccess({
        effectivePlan:
          planContext.result
            .effectivePlan,
        isPlatformAdmin:
          planContext.input
            .isPlatformAdmin,
      })
    ) {
      return connectorErrorResponse(
        "Apple Home integration requires a Pro or Family plan.",
        403
      );
    }

    const nowIso =
      new Date().toISOString();

    /*
     * Cancel any older unfinished session
     * created by this connector.
     */
    const {
      error: cancelError,
    } = await admin
      .from(
        "apple_home_pairing_sessions"
      )
      .update({
        status: "cancelled",
        cancelled_at: nowIso,
        updated_at: nowIso,
      })
      .eq(
        "connector_id",
        connector.connectorId
      )
      .eq("status", "pending");

    if (cancelError) {
      throw cancelError;
    }

    const {
      normalized,
      readable,
    } =
      generateAppleHomePairingCode();

    const expiresAt =
      getAppleHomePairingExpiration();

    const {
      data: session,
      error: insertError,
    } = await admin
      .from(
        "apple_home_pairing_sessions"
      )
      .insert({
        household_id:
          connector.householdId,
        connector_id:
          connector.connectorId,
        created_by_user_id:
          connector.installation
            .created_by_user_id,
        code_hash:
          hashAppleHomePairingCode(
            normalized
          ),
        status: "pending",
        expires_at:
          expiresAt.toISOString(),
        updated_at: nowIso,
      })
      .select(
        "id, expires_at, status"
      )
      .single();

    if (
      insertError ||
      !session
    ) {
      throw (
        insertError ??
        new Error(
          "Apple Home pairing session could not be created."
        )
      );
    }

    const pairingUrl = new URL(
      "/apple-home/pair",
      request.url
    );

    pairingUrl.searchParams.set(
      "code",
      readable
    );

    return connectorJsonResponse({
      ok: true,
      sessionId: session.id,
      code: readable,
      pairingUrl:
        pairingUrl.toString(),
      expiresAt:
        session.expires_at,
      status: session.status,
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
      "Apple Home pair init error:",
      error instanceof Error
        ? error.message
        : error
    );

    return connectorServerErrorResponse();
  }
}
