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

type RevokeRequestBody = {
  householdId?: string;
  connectorId?: string;
};

export async function DELETE(request: Request) {
  try {
    const body =
      (await request.json()) as RevokeRequestBody;

    const adminContext =
      await requireHouseholdAdmin(
        body.householdId
      );

    const connectorId =
      body.connectorId?.trim();

    if (!connectorId) {
      return connectorErrorResponse(
        "A valid connectorId is required.",
        400
      );
    }

    const admin = createAdminClient();
    const nowIso = new Date().toISOString();

    const { data: installation, error: lookupError } =
      await admin
        .from("connector_installations")
        .select("id, household_id, status")
        .eq("id", connectorId)
        .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    if (
      !installation ||
      installation.household_id !==
        adminContext.householdId
    ) {
      return connectorErrorResponse(
        "Connector not found.",
        404
      );
    }

    if (installation.status === "revoked") {
      return connectorJsonResponse({
        success: true,
        connectorId: installation.id,
        status: "revoked",
      });
    }

    const { error: revokeError } = await admin
      .from("connector_installations")
      .update({
        status: "revoked",
        revoked_at: nowIso,
        token_hash: null,
        updated_at: nowIso,
      })
      .eq("id", connectorId)
      .eq(
        "household_id",
        adminContext.householdId
      );

    if (revokeError) {
      throw revokeError;
    }

    return connectorJsonResponse({
      success: true,
      connectorId,
      status: "revoked",
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
      "Connector pair revoke error:",
      error instanceof Error
        ? error.message
        : error
    );

    return connectorServerErrorResponse();
  }
}
