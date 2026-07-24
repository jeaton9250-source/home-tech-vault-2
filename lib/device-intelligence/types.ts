/**
 * Device Intelligence v3 — shared types.
 * Confidence is honest: Exact requires authoritative evidence.
 */

export type DeviceCategory =
  | "computer"
  | "phone"
  | "tablet"
  | "television"
  | "streaming_device"
  | "speaker"
  | "voice_assistant"
  | "camera"
  | "doorbell"
  | "thermostat"
  | "lighting"
  | "smart_plug"
  | "smart_switch"
  | "hub"
  | "router"
  | "mesh_node"
  | "network_switch"
  | "printer"
  | "nas"
  | "game_console"
  | "robot_vacuum"
  | "air_purifier"
  | "appliance"
  | "security_system"
  | "sensor"
  | "other"
  | "unknown";

export type ConfidenceLevel =
  | "exact"
  | "high"
  | "medium"
  | "low"
  | "unknown";

export type DiscoveryEvidenceType =
  | "connector_identity"
  | "previous_confirmation"
  | "stable_fingerprint"
  | "exact_mac"
  | "mac_vendor"
  | "private_mac"
  | "hostname"
  | "reverse_dns"
  | "mdns_service"
  | "mdns_txt"
  | "ssdp_server"
  | "ssdp_usn"
  | "ssdp_device_type"
  | "upnp_friendly_name"
  | "upnp_manufacturer"
  | "upnp_model"
  | "service_port"
  | "http_header"
  | "ip_address"
  | "same_scan_window"
  | "existing_vault_device";

export type EvidenceReliability =
  | "authoritative"
  | "strong"
  | "moderate"
  | "weak";

export type DiscoveryEvidence = {
  type: DiscoveryEvidenceType;
  label: string;
  value?: string | null;
  weight: number;
  matched: boolean;
  reliability: EvidenceReliability;
};

export type DeviceCandidate = {
  catalogId: string;
  manufacturer: string | null;
  family: string | null;
  suggestedName: string;
  category: DeviceCategory;
  score: number;
  confidence: ConfidenceLevel;
  evidence: DiscoveryEvidence[];
  conflictingEvidence: DiscoveryEvidence[];
};

export type DeviceIntelligenceResult = {
  observationId: string;
  bestCandidate: DeviceCandidate | null;
  alternatives: DeviceCandidate[];
  confidence: ConfidenceLevel;
  confidenceScore: number;
  shouldAutoMatch: boolean;
  shouldAskForConfirmation: boolean;
  matchedVaultDeviceId: string | null;
  identificationSource: string;
  analyzedAt: string;
  ruleSetVersion: string;
  catalogVersion: string;
  vendorDatasetVersion: string;
};

export type NetworkArtifactClassification = {
  classification: "network_artifact";
  reason: string;
  visibleToCustomer: false;
};

export type NormalizedObservation = {
  observationId: string;
  ipAddress: string | null;
  macAddress: string | null;
  isPrivateMac: boolean;
  isBroadcastMac: boolean;
  isMulticastMac: boolean;
  macVendor: string | null;
  macVendorConfidence: "high" | "medium" | "low" | "none";
  hostnameOriginal: string | null;
  hostnameNormalized: string | null;
  manufacturer: string | null;
  model: string | null;
  friendlyName: string | null;
  mdnsServices: string[];
  ssdpDeviceType: string | null;
  ssdpDescriptionUrl: string | null;
  discoverySources: string[];
  localFingerprint: string | null;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  online: boolean;
};

export type RawDiscoveryObservation = {
  observationId?: string | null;
  ipAddress?: string | null;
  macAddress?: string | null;
  hostname?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  friendlyName?: string | null;
  mdnsServices?: string[] | null;
  ssdpDeviceType?: string | null;
  ssdpDescriptionUrl?: string | null;
  discoverySources?: string[] | null;
  localFingerprint?: string | null;
  firstSeenAt?: string | null;
  lastSeenAt?: string | null;
  online?: boolean | null;
  matchedVaultDeviceId?: string | null;
  previousConfirmation?: boolean | null;
  connectorHostIdentity?: {
    modelName?: string | null;
    modelFamily?: string | null;
    computerName?: string | null;
  } | null;
};

export const RULE_SET_VERSION = "3.0.0-phase3a";
export const CATALOG_VERSION = "3.0.0-phase3a";
export const VENDOR_DATASET_VERSION = "seed-2026-07-24";
export const ANALYSIS_VERSION = "3a.1";

/** Baseline evidence weights (not percentages). */
export const EVIDENCE_WEIGHTS = {
  connectorIdentity: 100,
  previousConfirmation: 100,
  stableFingerprint: 95,
  exactStableMac: 85,
  upnpExactModel: 85,
  mdnsProductModel: 80,
  ssdpExactDeviceType: 70,
  upnpManufacturer: 45,
  mdnsServiceCombination: 45,
  exactHostnameProductPattern: 40,
  macVendor: 25,
  genericHostname: 15,
  servicePort: 8,
  ipAddress: 3,
} as const;
