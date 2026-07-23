export type ConnectorInstallationStatus =
  | "pending"
  | "active"
  | "revoked";

export type ConnectorInstallationRow = {
  id: string;
  household_id: string;
  created_by_user_id: string;
  name: string;
  platform: string | null;
  app_version: string | null;
  status: ConnectorInstallationStatus;
  token_hash: string | null;
  last_seen_at: string | null;
  last_scan_at: string | null;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ConnectorPairingSessionRow = {
  id: string;
  household_id: string;
  created_by_user_id: string;
  code_hash: string;
  expires_at: string;
  consumed_at: string | null;
  installation_id: string | null;
  created_at: string;
};

/** Public-safe connector summary (no hashes). */
export type ConnectorInstallationSummary = {
  id: string;
  householdId: string;
  name: string;
  platform: string | null;
  appVersion: string | null;
  status: ConnectorInstallationStatus;
  lastSeenAt: string | null;
  lastScanAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PairInitResponse = {
  code: string;
  expiresAt: string;
  sessionId: string;
};

export type PairConfirmResponse = {
  connectorId: string;
  connectorToken: string;
  householdId: string;
  connectorName: string;
};

export type PairStatusResponse = {
  connectors: ConnectorInstallationSummary[];
};

export type ConnectorSessionContext = {
  connectorId: string;
  householdId: string;
  installation: ConnectorInstallationRow;
};
