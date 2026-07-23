import { checkPairConfirmRateLimit } from "@/lib/connector/pairConfirmRateLimit";
import {
  assertPairingSessionUsable,
  hashPairingCode,
  normalizePairingCode,
  PairingValidationError,
  pairingValidationResponse,
} from "@/lib/connector/pairing";
import {
  connectorErrorResponse,
  connectorJsonResponse,
  connectorServerErrorResponse,
} from "@/lib/connector/responses";
import {
  generateConnectorToken,
  hashConnectorToken,
} from "@/lib/connector/tokens";
import { createAdminClient } from "@/lib/supabase/admin";

import type {
  ConnectorPairingSessionRow,
} from "@/lib/connector/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ConfirmRequestBody = {
  code?: string;
  connectorName?: string;
  name?: string;
  platform?: string;
  appVersion?: string;
  app_version?: string;
};

function resolveConnectorName(
  body: ConfirmRequestBody
): string {
  const name =
    body.connectorName?.trim() ??
    body.name?.trim() ??
    "";

  if (!name) {
    throw new PairingValidationError(
      "INVALID",
      "A connector name is required."
    );
  }

  if (name.length > 120) {
    throw new PairingValidationError(
      "INVALID",
      "Connector name is too long."
    );
  }

  return name;
}

export async function POST(request: Request) {
  try {
    if (!checkPairConfirmRateLimit(request)) {
      return connectorErrorResponse(
        "Too many pairing attempts. Please wait and try again.",
        429
      );
    }

    const body =
      (await request.json()) as ConfirmRequestBody;

    if (!body.code?.trim()) {
      return connectorErrorResponse(
        "A pairing code is required.",
        400
      );
    }

    const connectorName =
      resolveConnectorName(body);

    const normalizedCode =
      normalizePairingCode(body.code);

    if (normalizedCode.length !== 8) {
      throw new PairingValidationError(
        "INVALID",
        "Invalid pairing code."
      );
    }

    const admin = createAdminClient();
    const codeHash =
      hashPairingCode(normalizedCode);

    const {
      data: session,
      error: sessionError,
    } = await admin
      .from("connector_pairing_sessions")
      .select(
        "id, household_id, created_by_user_id, code_hash, expires_at, consumed_at, installation_id, created_at"
      )
      .eq("code_hash", codeHash)
      .maybeSingle();

    if (sessionError) {
      throw sessionError;
    }

    if (!session) {
      throw new PairingValidationError(
        "INVALID",
        "Invalid pairing code."
      );
    }

    const pairingSession =
      session as ConnectorPairingSessionRow;

    assertPairingSessionUsable(
      pairingSession
    );

    const connectorToken =
      generateConnectorToken();

    const nowIso = new Date().toISOString();

    const { data: installation, error: installError } =
      await admin
        .from("connector_installations")
        .insert({
          household_id:
            pairingSession.household_id,
          created_by_user_id:
            pairingSession.created_by_user_id,
          name: connectorName,
          platform:
            body.platform?.trim() || null,
          app_version:
            body.appVersion?.trim() ??
            body.app_version?.trim() ??
            null,
          status: "active",
          token_hash:
            hashConnectorToken(
              connectorToken
            ),
          updated_at: nowIso,
        })
        .select("id, household_id, name")
        .single();

    if (installError) {
      throw installError;
    }

    const { error: consumeError } =
      await admin
        .from(
          "connector_pairing_sessions"
        )
        .update({
          consumed_at: nowIso,
          installation_id:
            installation.id,
        })
        .eq("id", pairingSession.id)
        .is("consumed_at", null);

    if (consumeError) {
      throw consumeError;
    }

    return connectorJsonResponse({
      connectorId: installation.id,
      connectorToken,
      householdId:
        installation.household_id,
      connectorName: installation.name,
    });
  } catch (error) {
    const pairingResponse =
      pairingValidationResponse(error);

    if (pairingResponse) {
      return connectorErrorResponse(
        pairingResponse.message,
        pairingResponse.status
      );
    }

    console.error(
      "Connector pair confirm error:",
      error instanceof Error
        ? error.message
        : error
    );

    return connectorServerErrorResponse();
  }
}
