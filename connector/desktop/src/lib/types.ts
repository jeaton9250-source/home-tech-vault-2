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

  constructor(kind: ApiErrorKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

export type AppScreen =
  | "unpaired"
  | "pairing"
  | "connected";
