export {
  identifyDevice,
  explainIntelligenceResult,
} from "@/lib/device-intelligence/identifyDevice";
export {
  normalizeMacAddress,
  isLocallyAdministeredMac,
  isStableMacForIdentity,
  isBroadcastMac,
  isMulticastMac,
  maskMacAddress,
} from "@/lib/device-intelligence/macAddress";
export {
  classifyNetworkArtifact,
  isVisibleToCustomer,
} from "@/lib/device-intelligence/rejectArtifacts";
export { lookupMacVendorSync } from "@/lib/device-intelligence/vendorLookup";
export { analyzeHostname } from "@/lib/device-intelligence/hostnameRules";
export { normalizeObservation } from "@/lib/device-intelligence/normalizeObservation";
export {
  classifyConfidence,
  confidenceLabel,
} from "@/lib/device-intelligence/classifyConfidence";
export {
  isDeviceIntelligenceV3Enabled,
  DEVICE_INTELLIGENCE_FLAG,
} from "@/lib/device-intelligence/featureFlag";
export { DEVICE_CATALOG } from "@/lib/device-intelligence/catalog";
export type * from "@/lib/device-intelligence/types";
