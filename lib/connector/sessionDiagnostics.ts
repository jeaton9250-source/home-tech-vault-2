import "server-only";

import { hashConnectorToken } from "@/lib/connector/tokens";

import type { ConnectorInstallationRow } from "@/lib/connector/types";

export type ConnectorAuthFailureReason =
  | "missing_token"
  | "invalid_token"
  | "revoked";

export type SafeConnectorDiagnostics = {
  reason: ConnectorAuthFailureReason;
  connectorId?: string;
  tokenHashPrefix?: string;
  installationStatus?: string;
  revokedAtPresent?: boolean;
  apiBaseUrl?: string;
  appVersion?: string;
};

export function tokenHashPrefix(
  token: string
): string {
  return hashConnectorToken(token).slice(
    0,
    8
  );
}

export function diagnosticsForMissingToken(): SafeConnectorDiagnostics {
  return {
    reason: "missing_token",
  };
}

export function diagnosticsForInvalidToken(
  token: string
): SafeConnectorDiagnostics {
  return {
    reason: "invalid_token",
    tokenHashPrefix: tokenHashPrefix(token),
  };
}

export function diagnosticsForRevokedInstallation(
  installation: Pick<
    ConnectorInstallationRow,
    "id" | "status" | "revoked_at"
  >,
  token: string
): SafeConnectorDiagnostics {
  return {
    reason: "revoked",
    connectorId: installation.id,
    tokenHashPrefix: tokenHashPrefix(token),
    installationStatus: installation.status,
    revokedAtPresent: Boolean(
      installation.revoked_at
    ),
  };
}
