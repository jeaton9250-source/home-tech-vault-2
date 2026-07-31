export type ConnectorMetadata = {
  connectorId: string;
  householdId: string;
  connectorName: string;

  lastHeartbeatAt: string | null;

  lastScanAt?: string | null;
  lastScanDeviceCount?: number | null;

  lastScanStartedAt?: string | null;
  lastSuccessfulSyncAt?: string | null;
  lastScanDurationMs?: number | null;

  consecutiveScanFailures?: number;
  lastScanFailureAt?: string | null;
  lastScanFailureMessage?: string | null;

  pendingDiscoveryUploads?: number;

  scanConsentAccepted?: boolean;
  monitoringEnabled?: boolean;
  monitoringPaused?: boolean;
  autostartEnabled?: boolean;

  /*
   * Home Assistant configuration.
   * The access token is stored separately
   * in the operating system credential store.
   */
  homeAssistantUrl?: string | null;
  homeAssistantConnected?: boolean;
  homeAssistantLastSyncAt?: string | null;
  homeAssistantDeviceCount?: number | null;
};

export type ScannedDevice = {
  localFingerprint: string;
  ipAddress?: string | null;
  macAddress?: string | null;
  hostname?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  friendlyName?: string | null;
  deviceType?: string | null;
  discoverySource: string;
  discoverySources?: string[];
  mdnsServices?: string[];
  ssdpDeviceType?: string | null;
  ssdpDescriptionUrl?: string | null;
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

export type HomeAssistantEntitySyncResponse = {
  ok: boolean;
  connectorId: string;
  householdId: string;
  syncedAt: string;
  received: number;
  upserted: number;
};


export type HomeAssistantCommand = {
  id: string;
  homeAssistantEntityId: string;
  domain: "light" | "switch";
  service: "turn_on" | "turn_off";
  serviceData: Record<string, unknown>;
  status: "claimed";
  claimedAt: string;
  expiresAt: string;
};

export type HomeAssistantCommandClaimResponse = {
  ok: boolean;
  command: HomeAssistantCommand | null;
};

export type HomeAssistantCommandCompletionResponse = {
  ok: boolean;
  command: {
    id: string;
    status: "succeeded" | "failed";
    completedAt: string;
    errorMessage: string | null;
  };
};

export type HomeAssistantServiceResponse = {
  ok: boolean;
  entityId: string;
  domain: "light" | "switch";
  service: "turn_on" | "turn_off";
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

export type AppleHomePairingStatus =
  | "pending"
  | "approved"
  | "expired"
  | "cancelled";

export type AppleHomePairingInitResponse = {
  ok: boolean;
  sessionId: string;
  code: string;
  pairingUrl: string;
  expiresAt: string;
  status: AppleHomePairingStatus;
};

export type AppleHomePairingStatusResponse = {
  ok: boolean;
  sessionId: string;
  status: AppleHomePairingStatus;
  expiresAt: string;
  approvedAt: string | null;
};
