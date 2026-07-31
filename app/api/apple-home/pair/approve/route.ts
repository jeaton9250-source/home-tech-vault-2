import {
  hashAppleHomePairingCode,
  normalizeAppleHomePairingCode,
  resolveAppleHomePairingStatus,
  type AppleHomePairingStatus,
} from "@/lib/connector/appleHome/pairing";

import {
  householdAccessResponse,
  requireHouseholdAdmin,
} from "@/lib/connector/requireHouseholdAdmin";

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

type ApproveRequestBody = {
  code?: string;
};

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
    const body =
      (await request.json()) as
        ApproveRequestBody;

    const normalizedCode =
      normalizeAppleHomePairingCode(
        body.code ?? ""
      );

    if (
      normalizedCode.length !== 8
    ) {
      return connectorErrorResponse(
        "Enter a valid Apple Home pairing code.",
        400
      );
    }

    const admin =
      createAdminClient();

    const codeHash =
      hashAppleHomePairingCode(
        normalizedCode
      );

    const {
      data: session,
      error: sessionError,
    } = await admin
      .from(
        "apple_home_pairing_sessions"
      )
      .select(
        "id, household_id, connector_id, status, expires_at, approved_at"
      )
      .eq("code_hash", codeHash)
      .maybeSingle();

    if (sessionError) {
      throw sessionError;
    }

    if (!session) {
      return connectorErrorResponse(
        "The Apple Home pairing code is invalid.",
        404
      );
    }

    const adminContext =
      await requireHouseholdAdmin(
        session.household_id
      );

    const planContext =
      await buildServerPlanAccessContext(
        admin,
        adminContext.userId
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

    const status =
      resolveAppleHomePairingStatus(
        session.status as
          AppleHomePairingStatus,
        session.expires_at
      );

    if (status === "expired") {
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

      return connectorErrorResponse(
        "This Apple Home pairing code has expired.",
        410
      );
    }

    if (status === "cancelled") {
      return connectorErrorResponse(
        "This Apple Home pairing session was cancelled.",
        409
      );
    }

    if (status === "approved") {
      return connectorJsonResponse({
        ok: true,
        sessionId: session.id,
        householdId:
          session.household_id,
        status: "approved",
        approvedAt:
          session.approved_at,
      });
    }

    const nowIso =
      new Date().toISOString();

    const {
      data: approved,
      error: approveError,
    } = await admin
      .from(
        "apple_home_pairing_sessions"
      )
      .update({
        status: "approved",
        approved_by_user_id:
          adminContext.userId,
        approved_at: nowIso,
        updated_at: nowIso,
      })
      .eq("id", session.id)
      .eq("status", "pending")
      .select(
        "id, household_id, status, approved_at"
      )
      .maybeSingle();

    if (approveError) {
      throw approveError;
    }

    if (!approved) {
      return connectorErrorResponse(
        "This Apple Home pairing session is no longer available.",
        409
      );
    }

    return connectorJsonResponse({
      ok: true,
      sessionId: approved.id,
      householdId:
        approved.household_id,
      status: approved.status,
      approvedAt:
        approved.approved_at,
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
      "Apple Home pair approval error:",
      error instanceof Error
        ? error.message
        : error
    );

    return connectorServerErrorResponse();
  }
}
