export type MatchStatus =
  | "matched"
  | "possible_match"
  | "new"
  | "ignored";

export type MatchConfidence =
  | "exact"
  | "high"
  | "medium"
  | "low";

export type DeviceMatchResult = {
  matchStatus: MatchStatus;
  matchConfidence: MatchConfidence | null;
  matchReason: string | null;
  matchedDeviceId: string | null;
  /** When multiple possible vault devices qualify */
  candidateDeviceIds?: string[];
};

export type VaultDeviceForMatching = {
  id: string;
  householdId: string;
  deviceName: string | null;
  brand: string | null;
  manufacturer: string | null;
  modelNumber: string | null;
  serialNumber: string | null;
  macAddress: string | null;
  networkFingerprint: string | null;
  category: string | null;
  ipAddress?: string | null;
  hostname?: string | null;
  firstSeenAt?: string | null;
  discoverySource?: string | null;
};

export type DiscoveredForMatching = {
  id?: string;
  householdId: string;
  localFingerprint: string;
  hostname: string | null;
  manufacturer: string | null;
  model: string | null;
  serialNumber: string | null;
  ipAddress: string | null;
  macAddress: string | null;
  deviceType: string | null;
  importedDeviceId: string | null;
  matchConfirmedAt: string | null;
  ignoredAt: string | null;
  firstSeenAt?: string | null;
  lastSeenAt?: string | null;
  online?: boolean;
  discoverySources?: string[];
};

export type DiscoveryNetworkFields = {
  ipAddress: string | null;
  macAddress: string | null;
  hostname: string | null;
  manufacturer: string | null;
  model: string | null;
  online: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
  discoverySource: string;
  connectorId: string;
  networkFingerprint: string;
};

export type IdentificationConfidence =
  | "exact"
  | "high"
  | "medium"
  | "low"
  | "unknown";

export type RecognitionStatus =
  | "pending"
  | "accepted"
  | "dismissed";

export type DiscoveredRecognitionSuggestion = {
  friendlyName: string;
  manufacturer: string | null;
  model: string | null;
  category: string | null;
  deviceTypeKey: string | null;
  confidenceScore: number;
  reason: string;
};

export type DiscoveredDeviceRow = {
  id: string;
  household_id: string;
  connector_id: string;
  local_fingerprint: string;
  hostname: string | null;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  ip_address: string | null;
  mac_address: string | null;
  device_type: string | null;
  friendly_name: string | null;
  mdns_services: string[];
  ssdp_device_type: string | null;
  ssdp_description_url: string | null;
  likely_category: string | null;
  likely_brand: string | null;
  identification_confidence: IdentificationConfidence | null;
  identification_reasons: string[];
  identification_display_name: string | null;
  online: boolean;
  discovery_sources: string[];
  first_seen_at: string;
  last_seen_at: string;
  imported_device_id: string | null;
  match_confirmed_at: string | null;
  match_confirmed_by: string | null;
  ignored_at: string | null;
  recognition_status: RecognitionStatus;
  recognition_reviewed_at: string | null;
  recognition_reviewed_by: string | null;
  recognition_accepted_name: string | null;
  recognition_accepted_manufacturer: string | null;
  recognition_accepted_model: string | null;
  recognition_accepted_category: string | null;
  recognition_accepted_device_type_key: string | null;
  created_at: string;
  updated_at: string;
};

export type MatchReasonSignal = {
  label: string;
  matched: boolean;
};

export type DiscoveryStatsSummary = {
  totalDevices: number;
  onlineDevices: number;
  recentlyDetected: number;
  needsReview: number;
  newDevices: number;
  ignoredDevices: number;
  matchedDevices: number;
  totalDiscovered: number;
};

export type DiscoveredDeviceSummary = {
  id: string;
  connectorId: string;
  localFingerprint: string;
  hostname: string | null;
  manufacturer: string | null;
  model: string | null;
  serialNumber: string | null;
  ipAddress: string | null;
  macAddress: string | null;
  deviceType: string | null;
  friendlyName: string | null;
  mdnsServices: string[];
  ssdpDeviceType: string | null;
  ssdpDescriptionUrl: string | null;
  likelyCategory: string | null;
  likelyBrand: string | null;
  identificationConfidence: IdentificationConfidence | null;
  identificationReasons: string[];
  identificationDisplayName: string | null;
  online: boolean;
  discoverySources: string[];
  firstSeenAt: string;
  lastSeenAt: string;
  importedDeviceId: string | null;
  matchConfirmedAt: string | null;
  ignoredAt: string | null;
  recognitionStatus: RecognitionStatus;
  recognitionReviewedAt: string | null;
  recognitionSuggestion: DiscoveredRecognitionSuggestion;
  matchStatus: MatchStatus;
  matchConfidence: MatchConfidence | null;
  matchReason: string | null;
  matchedDeviceId: string | null;
  candidateDeviceIds?: string[];
  matchedDevice?: {
    id: string;
    deviceName: string | null;
    category: string | null;
    manufacturer: string | null;
    modelNumber: string | null;
    location?: string | null;
  } | null;
};

export type DiscoverySyncResponse = {
  ok: true;
  connectorId: string;
  householdId: string;
  scannedAt: string;
  received: number;
  upserted: number;
  autoMatched: number;
  enriched: number;
  possibleMatches: number;
  ignored: number;
  newDevices: number;
};

export type DuplicateImportWarning = {
  deviceId: string;
  deviceName: string | null;
  reason: string;
  confidence: MatchConfidence;
};
