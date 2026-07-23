import assert from "node:assert/strict";
import test from "node:test";

import {
  buildNetworkHeaderSummary,
  buildNetworkSummary,
  computeReviewCount,
} from "./summary";

import type { DiscoveryStatsSummary } from "@/lib/connector/discoveryTypes";

test("computeReviewCount combines new devices and possible matches", () => {
  const stats: DiscoveryStatsSummary = {
    totalDevices: 0,
    onlineDevices: 0,
    recentlyDetected: 2,
    needsReview: 2,
    newDevices: 3,
    ignoredDevices: 1,
    matchedDevices: 4,
    totalDiscovered: 10,
  };

  assert.equal(computeReviewCount(stats), 5);
});

test("buildNetworkHeaderSummary avoids fake values while loading", () => {
  const summary = buildNetworkSummary({
    connectors: [],
    devices: [],
    stats: null,
    monitoringEnabled: false,
  });

  assert.equal(buildNetworkHeaderSummary(summary, true), null);
});

test("buildNetworkHeaderSummary uses real connector and discovery values", () => {
  const summary = buildNetworkSummary({
    connectors: [
      {
        id: "c1",
        householdId: "h1",
        name: "Office Mac",
        platform: "macos",
        status: "active",
        appVersion: "0.1.0",
        lastSeenAt: new Date().toISOString(),
        lastScanAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        revokedAt: null,
      },
    ],
    devices: [],
    stats: {
      totalDevices: 0,
      onlineDevices: 0,
      recentlyDetected: 4,
      needsReview: 1,
      newDevices: 3,
      ignoredDevices: 0,
      matchedDevices: 5,
      totalDiscovered: 9,
    },
    monitoringEnabled: true,
  });

  const header = buildNetworkHeaderSummary(summary, false);

  assert.match(header ?? "", /Connector connected/i);
  assert.match(header ?? "", /9 devices discovered/i);
  assert.match(header ?? "", /4 need review/i);
});
