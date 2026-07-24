/**
 * Feature flag for Device Intelligence v3.
 *
 * Env: CONNECTOR_DEVICE_INTELLIGENCE_V3=true|false
 * Default: enabled (Phase 3A honest scoring + private MAC + artifacts).
 * Set to "false" to fall back to legacy signature identification only.
 */

export const DEVICE_INTELLIGENCE_FLAG =
  "connector_device_intelligence_v3";

export function isDeviceIntelligenceV3Enabled(): boolean {
  const value =
    process.env.CONNECTOR_DEVICE_INTELLIGENCE_V3?.trim().toLowerCase();

  if (value === "false" || value === "0" || value === "off") {
    return false;
  }

  // Default on for Phase 3A correctness (private MAC + artifacts + honest labels)
  return true;
}
