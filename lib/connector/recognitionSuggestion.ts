import type { IdentificationConfidence } from "@/lib/connector/discoveryTypes";

export const SUPPORTED_DEVICE_ICON_KEYS = [
  "streaming_device",
  "television",
  "router",
  "network_device",
  "camera",
  "thermostat",
  "speaker",
  "light",
  "smart_plug",
  "unknown",
] as const;

export type SupportedDeviceIconKey =
  (typeof SUPPORTED_DEVICE_ICON_KEYS)[number];

const SUPPORTED_DEVICE_ICON_KEY_SET = new Set<string>(
  SUPPORTED_DEVICE_ICON_KEYS
);

function normalizeCategoryKey(category: string) {
  return category
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

const CATEGORY_ICON_ALIASES: Record<string, SupportedDeviceIconKey> = {
  streaming: "streaming_device",
  tv: "television",
  router: "router",
  network: "network_device",
  camera: "camera",
  thermostat: "thermostat",
  speaker: "speaker",
  smart_speaker: "speaker",
  light: "light",
  lighting: "light",
  plug: "smart_plug",
  smart_plug: "smart_plug",
};

export function iconKeyForCategory(
  category: string | null
): SupportedDeviceIconKey | null {
  if (!category?.trim()) {
    return null;
  }

  const key = normalizeCategoryKey(category);

  if (SUPPORTED_DEVICE_ICON_KEY_SET.has(key)) {
    return key as SupportedDeviceIconKey;
  }

  const aliased = CATEGORY_ICON_ALIASES[key];

  if (aliased) {
    return aliased;
  }

  return "unknown";
}

export function isSupportedDeviceIconKey(
  value: string | null | undefined
): value is SupportedDeviceIconKey {
  if (!value?.trim()) {
    return false;
  }

  return SUPPORTED_DEVICE_ICON_KEY_SET.has(value.trim());
}

export function confidenceScoreFromLabel(
  confidence: IdentificationConfidence | null | undefined
): number {
  switch (confidence) {
    case "exact":
      return 99;
    case "high":
      return 92;
    case "medium":
      return 74;
    case "low":
      return 48;
    case "unknown":
    default:
      return 20;
  }
}

export function summarizeEvidence(reasons: string[]): string {
  if (reasons.length === 0) {
    return "Insufficient evidence for identification.";
  }

  const cleaned = reasons
    .map((reason) => reason.trim())
    .filter((reason) => reason.length > 0)
    .slice(0, 3);

  if (cleaned.length === 0) {
    return "Insufficient evidence for identification.";
  }

  return cleaned.join("; ");
}
