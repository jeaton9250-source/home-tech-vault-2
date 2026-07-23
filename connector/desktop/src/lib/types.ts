export type ConnectorMetadata = {
  connectorId: string;
  householdId: string;
  connectorName: string;
  lastHeartbeatAt: string | null;
};

export type PairConfirmResponse = {
  connectorId: string;
  connectorToken: string;
  householdId: string;
  connectorName: string;
};

export type HeartbeatResponse = {
  ok: boolean;
  connectorId: string;
  householdId: string;
  serverTime: string;
};

export type ApiErrorKind =
  | "invalid_code"
  | "expired_code"
  | "consumed_code"
  | "network"
  | "timeout"
  | "tls"
  | "server"
  | "unauthorized"
  | "malformed";

export class ConnectorApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly reason?: string;
  readonly diagnostics?: Record<string, unknown>;

  constructor(
    kind: ApiErrorKind,
    message: string,
    options?: {
      status?: number;
      reason?: string;
      diagnostics?: Record<string, unknown>;
    }
  ) {
    super(message);
    this.kind = kind;
    this.status = options?.status;
    this.reason = options?.reason;
    this.diagnostics = options?.diagnostics;
  }
}

export type AppScreen =
  | "unpaired"
  | "pairing"
  | "connected";
