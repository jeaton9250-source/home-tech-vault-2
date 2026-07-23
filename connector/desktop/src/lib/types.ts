export type ConnectorMetadata = {
  connectorId: string;
  householdId: string;
  connectorName: string;
  lastHeartbeatAt: string | null;
  lastScanAt?: string | null;
  lastScanDeviceCount?: number | null;
  scanConsentAccepted?: boolean;
};

export type ScannedDevice = {
  localFingerprint: string;
  ipAddress?: string | null;
  macAddress?: string | null;
  hostname?: string | null;
  manufacturer?: string | null;
  deviceType?: string | null;
  discoverySource: string;
  online: boolean;
};

export type ScanSummary = {
  startedAt: string;
  completedAt: string;
  interfaces: Array<{
    name: string;
    ipAddress: string;
    netmask: string;
  }>;
  devices: ScannedDevice[];
  cancelled: boolean;
};

export type DiscoverySyncResponse = {
  ok: boolean;
  connectorId: string;
  householdId: string;
  scannedAt: string;
  received: number;
  upserted: number;
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
