import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { computeDiscoveryStats } from "./discoveryStats";

import type { DiscoveredDeviceSummary } from "./discoveryTypes";

function summary(
  overrides: Partial<DiscoveredDeviceSummary> &
    Pick<DiscoveredDeviceSummary, "id" | "matchStatus">
): DiscoveredDeviceSummary {
  return {
    connectorId: "connector-1",
    localFingerprint: "mac:aa:bb:cc:dd:ee:01",
    hostname: "device",
    manufacturer: "Apple",
    model: null,
    serialNumber: null,
    ipAddress: "192.168.1.10",
    macAddress: "aa:bb:cc:dd:ee:01",
    deviceType: "Computer",
    friendlyName: null,
    mdnsServices: [],
    ssdpDeviceType: null,
    ssdpDescriptionUrl: null,
    likelyCategory: "Computer",
    likelyBrand: "Apple",
    identificationConfidence: "high",
    identificationReasons: ["Manufacturer is Apple"],
    identificationDisplayName: "Likely Apple Computer",
    online: true,
    discoverySources: ["ARP"],
    firstSeenAt: "2026-07-23T00:00:00.000Z",
    lastSeenAt: "2026-07-23T00:00:00.000Z",
    importedDeviceId: null,
    matchConfirmedAt: null,
    ignoredAt: null,
    recognitionStatus: "pending",
    recognitionReviewedAt: null,
    recognitionSuggestion: {
      friendlyName: "Likely Apple Computer",
      manufacturer: "Apple",
      model: null,
      category: "Computer",
      deviceTypeKey: "computer",
      confidenceScore: 92,
      reason: "Manufacturer is Apple",
    },
    matchConfidence: null,
    matchReason: null,
    matchedDeviceId: null,
    ...overrides,
  };
}

describe("computeDiscoveryStats", () => {
  it("returns reusable Home Pulse counts", () => {
    const stats = computeDiscoveryStats({
      devices: [
        summary({
          id: "1",
          matchStatus: "matched",
        }),
        summary({
          id: "2",
          matchStatus: "possible_match",
        }),
        summary({
          id: "3",
          matchStatus: "new",
        }),
        summary({
          id: "4",
          matchStatus: "ignored",
          online: false,
        }),
      ],
      totalVaultDevices: 12,
      onlineVaultDevices: 8,
    });

    assert.equal(stats.totalDiscovered, 4);
    assert.equal(stats.matchedDevices, 1);
    assert.equal(stats.needsReview, 1);
    assert.equal(stats.newDevices, 1);
    assert.equal(stats.ignoredDevices, 1);
    assert.equal(stats.totalDevices, 12);
    assert.equal(stats.onlineDevices, 8);
    assert.equal(stats.recentlyDetected, 3);
  });
});
