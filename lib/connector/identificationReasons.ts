import type {
  DiscoveredDeviceSummary,
  MatchReasonSignal,
} from "@/lib/connector/discoveryTypes";
import {
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
  return (
    device.identificationDisplayName ??
    device.friendlyName ??
    device.hostname ??
    device.manufacturer ??
    device.ipAddress ??
    "Discovered device"
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
