import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { hashConnectorToken } from "@/lib/connector/tokens";
import {
  diagnosticsForInvalidToken,
  diagnosticsForMissingToken,
  diagnosticsForRevokedInstallation,
} from "@/lib/connector/sessionDiagnostics";

import type { SafeConnectorDiagnostics } from "@/lib/connector/sessionDiagnostics";
import type {
  ConnectorInstallationRow,
  ConnectorSessionContext,
} from "@/lib/connector/types";

export class ConnectorSessionError extends Error {
  readonly code:
    | "UNAUTHORIZED"
    | "FORBIDDEN";
  readonly diagnostics: SafeConnectorDiagnostics;

  constructor(
    code: "UNAUTHORIZED" | "FORBIDDEN",
    diagnostics: SafeConnectorDiagnostics,
    message?: string
  ) {
    super(message ?? code);
    this.code = code;
    this.diagnostics = diagnostics;
  }
}

function parseBearerToken(
  authorizationHeader: string | null
): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const match =
    authorizationHeader.match(
      /^Bearer\s+(.+)$/i
    );

  if (!match?.[1]?.trim()) {
    return null;
  }

  return match[1].trim();
}

/**
 * Validate a connector bearer token for future sync endpoints.
 * Server-only — never import from client components.
 */
export async function requireConnectorSession(
  request: Request
): Promise<ConnectorSessionContext> {
  const token = parseBearerToken(
    request.headers.get("authorization")
  );

  if (!token) {
    throw new ConnectorSessionError(
      "UNAUTHORIZED",
      diagnosticsForMissingToken(),
      "Missing connector authorization token."
    );
  }

  const admin = createAdminClient();
  const tokenHash = hashConnectorToken(token);

  const { data, error } = await admin
    .from("connector_installations")
    .select(
      "id, household_id, created_by_user_id, name, platform, app_version, status, token_hash, last_seen_at, last_scan_at, revoked_at, created_at, updated_at"
    )
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const installation =
    data as ConnectorInstallationRow | null;

  if (!installation) {
    throw new ConnectorSessionError(
      "UNAUTHORIZED",
      diagnosticsForInvalidToken(token),
      "Invalid connector authorization token."
    );
  }

  if (
    installation.status !== "active" ||
    installation.revoked_at
  ) {
    throw new ConnectorSessionError(
      "UNAUTHORIZED",
      diagnosticsForRevokedInstallation(
        installation,
        token
      ),
      "Connector authorization is no longer valid."
    );
  }

  return {
    connectorId: installation.id,
    householdId: installation.household_id,
    installation,
  };
}

export function connectorSessionResponse(
  error: unknown
) {
  if (error instanceof ConnectorSessionError) {
    return {
      status: 401,
      message: "Unauthorized",
      body: {
        error:
          error.message ??
          "Unauthorized",
        reason:
          error.diagnostics.reason,
        diagnostics: error.diagnostics,
      },
    };
  }

  return null;
}
