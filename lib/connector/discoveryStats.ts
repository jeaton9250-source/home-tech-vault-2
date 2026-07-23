import type {
  DiscoveredDeviceSummary,
  DiscoveryStatsSummary,
  MatchStatus,
} from "@/lib/connector/discoveryTypes";
import { deviceNeedsIdentificationReview } from "@/lib/connector/identificationReasons";

/**
 * Reusable discovery counts for Home Pulse and network overview.
 */
export function computeDiscoveryStats(input: {
  devices: DiscoveredDeviceSummary[];
  totalVaultDevices?: number;
  onlineVaultDevices?: number;
}): DiscoveryStatsSummary {
  const counts = input.devices.reduce(
    (accumulator, device) => {
      accumulator[device.matchStatus] += 1;

      if (device.online) {
        accumulator.recentlyDetected += 1;
      }

      if (deviceNeedsIdentificationReview(device)) {
        accumulator.identificationReview += 1;
      }

      return accumulator;
    },
    {
      matched: 0,
      possible_match: 0,
      new: 0,
      ignored: 0,
      recentlyDetected: 0,
      identificationReview: 0,
    } as Record<
      MatchStatus | "recentlyDetected" | "identificationReview",
      number
    >
  );

  return {
    totalDevices:
      input.totalVaultDevices ??
      input.devices.filter(
        (device) => device.matchStatus === "matched"
      ).length,
    onlineDevices: input.onlineVaultDevices ?? 0,
    recentlyDetected: counts.recentlyDetected,
    needsReview:
      counts.possible_match + counts.identificationReview,
    newDevices: counts.new,
    ignoredDevices: counts.ignored,
    matchedDevices: counts.matched,
    totalDiscovered: input.devices.length,
  };
}
