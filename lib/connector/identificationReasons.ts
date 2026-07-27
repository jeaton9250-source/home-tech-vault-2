import type {
  DiscoveredDeviceSummary,
  MatchReasonSignal,
} from "@/lib/connector/discoveryTypes";
import {
  cleanDiscoveredHostname,
  formatIdentificationConfidenceLabel,
} from "@/lib/connector/deviceIdentification";

export function buildIdentificationReasonSignals(
  device: DiscoveredDeviceSummary
): MatchReasonSignal[] {
  return device.identificationReasons.map(
    (reason) => ({
      label: reason,
      matched: device.identificationConfidence !== "unknown",
    })
  );
}

export function formatIdentificationLabel(
  device: DiscoveredDeviceSummary
): string | null {
  if (!device.identificationConfidence) {
    return null;
  }

  return formatIdentificationConfidenceLabel(
    device.identificationConfidence
  );
}

export function discoveryDeviceTitle(
  device: DiscoveredDeviceSummary
): string {
  const acceptedRecognitionName =
    device.recognitionStatus === "accepted"
      ? device.recognitionSuggestion.friendlyName?.trim() || null
      : null;
  const cleanedHostname = cleanDiscoveredHostname(
    device.hostname
  );
  const manufacturerCategoryFallback = [
    device.manufacturer,
    device.likelyCategory,
  ]
    .filter((value) => value?.trim())
    .join(" ")
    .trim();

  return (
    acceptedRecognitionName ??
    device.friendlyName ??
    device.identificationDisplayName ??
    cleanedHostname ??
    (manufacturerCategoryFallback || null) ??
    "Unknown device"
  );
}

export function deviceNeedsIdentificationReview(
  device: DiscoveredDeviceSummary
): boolean {
  if (
    device.matchStatus === "ignored" ||
    device.matchStatus === "matched"
  ) {
    return false;
  }

  return (
    device.identificationConfidence === "unknown" ||
    device.identificationConfidence === "medium"
  );
}
