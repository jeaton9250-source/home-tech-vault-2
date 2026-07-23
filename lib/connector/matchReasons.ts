import type {
  DeviceMatchResult,
  DiscoveredDeviceSummary,
  MatchReasonSignal,
} from "@/lib/connector/discoveryTypes";

function confidencePercent(
  confidence: DeviceMatchResult["matchConfidence"]
): number | null {
  switch (confidence) {
    case "exact":
      return 98;
    case "high":
      return 90;
    case "medium":
      return 75;
    case "low":
      return 55;
    default:
      return null;
  }
}

/**
 * Human-readable match signals for review cards.
 */
export function buildMatchReasonSignals(
  device: DiscoveredDeviceSummary
): MatchReasonSignal[] {
  const reason = device.matchReason?.toLowerCase() ?? "";
  const signals: MatchReasonSignal[] = [];

  if (reason.includes("mac")) {
    signals.push({
      label: "MAC address",
      matched: true,
    });
  }

  if (
    reason.includes("fingerprint") ||
    reason.includes("network fingerprint")
  ) {
    signals.push({
      label: "Network fingerprint",
      matched: true,
    });
  }

  if (
    reason.includes("confirmed") ||
    reason.includes("previous")
  ) {
    signals.push({
      label: "Previous confirmation",
      matched: true,
    });
  }

  if (reason.includes("serial")) {
    signals.push({
      label: "Serial number",
      matched: true,
    });
  }

  if (reason.includes("vendor")) {
    signals.push({
      label: "Vendor identifier",
      matched: true,
    });
  }

  if (reason.includes("manufacturer")) {
    signals.push({
      label: "Manufacturer",
      matched: true,
    });
  }

  if (reason.includes("model")) {
    signals.push({
      label: "Model",
      matched: true,
    });
  }

  if (reason.includes("hostname")) {
    signals.push({
      label: "Hostname",
      matched: true,
    });
  }

  if (reason.includes("category")) {
    signals.push({
      label: "Category",
      matched: true,
    });
  }

  if (
    device.macAddress &&
    !signals.some((signal) => signal.label === "MAC address")
  ) {
    signals.push({
      label: "MAC prefix",
      matched: device.matchStatus !== "new",
    });
  }

  if (signals.length === 0 && device.matchReason) {
    signals.push({
      label: device.matchReason,
      matched: device.matchStatus === "matched",
    });
  }

  return signals;
}

export function formatMatchConfidenceLabel(
  device: DiscoveredDeviceSummary
): string | null {
  const percent = confidencePercent(
    device.matchConfidence
  );

  if (percent === null) {
    return null;
  }

  return `${percent}% match`;
}
