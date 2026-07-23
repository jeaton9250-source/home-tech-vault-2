import {
  generatePairingCode,
  getPairingExpiresAt,
  hashPairingCode,
} from "@/lib/connector/pairing";
import {
  connectorErrorResponse,
  connectorJsonResponse,
  connectorServerErrorResponse,
} from "@/lib/connector/responses";
import {
  householdAccessResponse,
  requireHouseholdAdmin,
} from "@/lib/connector/requireHouseholdAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type InitRequestBody = {
  householdId?: string;
};

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as InitRequestBody;

    const adminContext =
      await requireHouseholdAdmin(
        body.householdId
      );

    const admin = createAdminClient();
    const nowIso = new Date().toISOString();

    const { error: invalidateError } =
      await admin
        .from(
          "connector_pairing_sessions"
        )
        .update({
          consumed_at: nowIso,
        })
        .eq(
          "household_id",
          adminContext.householdId
        )
        .is("consumed_at", null);

    if (invalidateError) {
      throw invalidateError;
    }

    const { readable, normalized } =
      generatePairingCode();

    const expiresAt =
      getPairingExpiresAt();

    const { data: session, error } =
      await admin
        .from(
          "connector_pairing_sessions"
        )
        .insert({
          household_id:
            adminContext.householdId,
          created_by_user_id:
            adminContext.userId,
          code_hash:
            hashPairingCode(normalized),
          expires_at:
            expiresAt.toISOString(),
        })
        .select("id, expires_at")
        .single();

    if (error) {
      throw error;
    }

    return connectorJsonResponse({
      code: readable,
      expiresAt: session.expires_at,
      sessionId: session.id,
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
      "Connector pair init error:",
      error instanceof Error
        ? error.message
        : error
    );

    return connectorServerErrorResponse();
  }
}
