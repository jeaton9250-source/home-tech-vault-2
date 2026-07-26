import { checkPairConfirmRateLimit } from "@/lib/connector/pairConfirmRateLimit";
import {
  assertPairingSessionUsable,
  hashPairingCode,
  normalizePairingCode,
  PairingValidationError,
} from "@/lib/connector/pairing";
import {
  generateConnectorToken,
  hashConnectorToken,
} from "@/lib/connector/tokens";
import { createAdminClient } from "@/lib/supabase/admin";
import { iosError, iosInternalError, iosJson } from "@/lib/ios-api/errors";
import { createTrustedHouseholdNotification } from "@/lib/notifications/events";

import type { ConnectorPairingSessionRow } from "@/lib/connector/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ConfirmRequestBody = {
  code?: string;
  connector?: {
    name?: string;
    platform?: string;
    app_version?: string;
    installation_identifier?: string;
  };
};

function pairingError(error: PairingValidationError) {
  if (error.code === "EXPIRED") {
    return iosError("PAIRING_CODE_EXPIRED", error.message, 410);
  }

  if (error.code === "CONSUMED") {
    return iosError("PAIRING_CODE_USED", error.message, 410);
  }

  return iosError("PAIRING_NOT_FOUND", error.message, 404);
}

function connectorName(body: ConfirmRequestBody) {
  const name = body.connector?.name?.trim() ?? "";

  if (!name) {
    throw new PairingValidationError("INVALID", "A connector name is required.");
  }

  if (name.length > 120) {
    throw new PairingValidationError("INVALID", "Connector name is too long.");
  }

  return name;
}

export async function POST(request: Request) {
  try {
    const admin = createAdminClient();

    if (!(await checkPairConfirmRateLimit(admin, request))) {
      return iosError(
        "PAIRING_RATE_LIMITED",
        "Too many pairing attempts. Please wait and try again.",
        429
      );
    }

    const body = (await request.json()) as ConfirmRequestBody;

    if (!body.code?.trim()) {
      return iosError("VALIDATION_FAILED", "A pairing code is required.", 422);
    }

    const name = connectorName(body);
    const normalizedCode = normalizePairingCode(body.code);

    if (normalizedCode.length !== 8) {
      throw new PairingValidationError("INVALID", "Invalid pairing code.");
    }

    const { data: session, error: sessionError } = await admin
      .from("connector_pairing_sessions")
      .select("id, household_id, created_by_user_id, code_hash, expires_at, consumed_at, installation_id, created_at")
      .eq("code_hash", hashPairingCode(normalizedCode))
      .maybeSingle();

    if (sessionError) {
      throw sessionError;
    }

    if (!session) {
      throw new PairingValidationError("INVALID", "Invalid pairing code.");
    }

    const pairingSession = session as ConnectorPairingSessionRow;
    assertPairingSessionUsable(pairingSession);

    const nowIso = new Date().toISOString();
    const { data: claimed, error: claimError } = await admin
      .from("connector_pairing_sessions")
      .update({ consumed_at: nowIso })
      .eq("id", pairingSession.id)
      .is("consumed_at", null)
      .select("id, household_id, created_by_user_id, code_hash, expires_at, consumed_at, installation_id, created_at")
      .maybeSingle();

    if (claimError) {
      throw claimError;
    }

    if (!claimed) {
      throw new PairingValidationError("CONSUMED", "This pairing code has already been used.");
    }

    const connectorToken = generateConnectorToken();
    const { data: installation, error: installError } = await admin
      .from("connector_installations")
      .insert({
        household_id: claimed.household_id,
        created_by_user_id: claimed.created_by_user_id,
        name,
        platform: body.connector?.platform?.trim() || null,
        app_version: body.connector?.app_version?.trim() || null,
        status: "active",
        token_hash: hashConnectorToken(connectorToken),
        last_seen_at: nowIso,
        updated_at: nowIso,
      })
      .select("id, household_id, name, platform, created_at")
      .single();

    if (installError || !installation) {
      await admin
        .from("connector_pairing_sessions")
        .update({ consumed_at: null, installation_id: null })
        .eq("id", claimed.id)
        .is("installation_id", null);
      throw installError ?? new Error("Installation create failed.");
    }

    const { error: linkError } = await admin
      .from("connector_pairing_sessions")
      .update({ installation_id: installation.id })
      .eq("id", claimed.id);

    if (linkError) {
      console.error("[ios-api] pair confirm link failed:", linkError.message);
    }

    await createTrustedHouseholdNotification({
      admin,
      householdId: installation.household_id,
      type: "pairing_completed",
      title: "Connector Paired",
      body: `${installation.name} is now connected to Home Tech Vault.`,
      entityType: "connector",
      entityId: installation.id,
      eventKey: `pairing_completed:${installation.id}`,
      adminOnly: true,
    });

    return iosJson(
      {
        installation: {
          id: installation.id,
          household_id: installation.household_id,
          name: installation.name,
          platform: installation.platform,
          paired_at: installation.created_at,
        },
        installation_token: connectorToken,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof PairingValidationError) {
      return pairingError(error);
    }

    return iosInternalError("pair confirm", error);
  }
}
