import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  dedupeDiscoveredDevicesForDisplay,
  isPrivateOrRandomizedMac,
  pickExistingDiscoveredCandidate,
} from "./discoveryIdentity";

import type { DiscoveredDeviceSummary } from "./discoveryTypes";

function candidate(overrides: Partial<{
  id: string;
  connector_id: string;
  local_fingerprint: string;
  hostname: string | null;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  mac_address: string | null;
  imported_device_id: string | null;
  recognition_status: string | null;
  recognition_reviewed_at: string | null;
  match_confirmed_at: string | null;
  friendly_name: string | null;
  identification_display_name: string | null;
  last_seen_at: string | null;
}> = {}) {
  return {
    id: "row-1",
    connector_id: "connector-1",
    local_fingerprint: "mac:aa:bb:cc:dd:ee:01",
    hostname: "living-room-tv",
    manufacturer: "Sony",
    model: "BRAVIA-7F31",
    serial_number: null,
    mac_address: "08:bb:cc:dd:ee:01",
    imported_device_id: null,
    recognition_status: "pending",
    recognition_reviewed_at: null,
    match_confirmed_at: null,
    friendly_name: null,
    identification_display_name: null,
    last_seen_at: "2026-07-25T00:00:00.000Z",
    ...overrides,
  };
}

function summary(overrides: Partial<DiscoveredDeviceSummary> = {}): DiscoveredDeviceSummary {
  return {
    id: "d-1",
    connectorId: "connector-1",
    localFingerprint: "mac:aa:bb:cc:dd:ee:01",
    hostname: "living-room-tv.local",
    manufacturer: "Sony",
    model: "BRAVIA-7F31",
    serialNumber: null,
    ipAddress: "192.168.1.44",
    macAddress: "08:bb:cc:dd:ee:01",
    deviceType: "TV",
    friendlyName: null,
    mdnsServices: [],
    ssdpDeviceType: null,
    ssdpDescriptionUrl: null,
    likelyCategory: "TV",
    likelyBrand: "Sony",
    identificationConfidence: "high",
    identificationReasons: [],
    identificationDisplayName: "Living Room TV",
    online: true,
    discoverySources: ["ARP"],
    firstSeenAt: "2026-07-20T00:00:00.000Z",
    lastSeenAt: "2026-07-25T00:00:00.000Z",
    importedDeviceId: null,
    matchConfirmedAt: null,
    ignoredAt: null,
    recognitionStatus: "pending",
    recognitionReviewedAt: null,
    recognitionSuggestion: {
      friendlyName: "Living Room TV",
      manufacturer: "Sony",
      model: "BRAVIA-7F31",
      category: "TV",
      deviceTypeKey: "television",
      confidenceScore: 92,
      reason: "Hostname",
    },
    matchStatus: "new",
    matchConfidence: null,
    matchReason: null,
    matchedDeviceId: null,
    matchedDevice: null,
    ...overrides,
  };
}

describe("discovery identity selection", () => {
  it("matches on stable MAC even when IP changes", () => {
    const existing = candidate({
      id: "existing-1",
      mac_address: "aa:bb:cc:dd:ee:01",
      local_fingerprint: "host:old|mfg:sony|model:bravia",
    });

    const resolved = pickExistingDiscoveredCandidate({
      incoming: {
        connectorId: "connector-1",
        localFingerprint: "host:new|mfg:sony|model:bravia",
        hostname: "living-room-tv",
        manufacturer: "Sony",
        model: "BRAVIA-7F31",
        serialNumber: null,
        macAddress: "AA-BB-CC-DD-EE-01",
        importedDeviceId: null,
      },
      candidates: [existing],
    });

    assert.equal(resolved?.id, "existing-1");
  });

  it("does not merge randomized/private MAC devices by MAC alone", () => {
    const existing = candidate({
      id: "existing-private",
      mac_address: "da:bb:cc:dd:ee:01",
    });

    const resolved = pickExistingDiscoveredCandidate({
      incoming: {
        connectorId: "connector-1",
        localFingerprint: "host:iphone|mfg:apple",
        hostname: "iphone",
        manufacturer: "Apple",
        model: "iPhone",
        serialNumber: null,
        macAddress: "da:bb:cc:dd:ee:01",
        importedDeviceId: null,
      },
      candidates: [existing],
    });

    assert.equal(resolved, null);
  });

  it("does not merge two different devices from the same generic manufacturer", () => {
    const first = candidate({
      id: "apple-1",
      manufacturer: "Apple",
      hostname: "living-room-appletv",
      model: "AppleTV14,1",
    });

    const resolved = pickExistingDiscoveredCandidate({
      incoming: {
        connectorId: "connector-1",
        localFingerprint: "host:kitchen-homepod|mfg:apple|model:homepod",
        hostname: "kitchen-homepod",
        manufacturer: "Apple",
        model: "HomePod",
        serialNumber: null,
        macAddress: null,
        importedDeviceId: null,
      },
      candidates: [first],
    });

    assert.equal(resolved, null);
  });

  it("prefers existing imported linkage candidates", () => {
    const imported = candidate({
      id: "linked",
      imported_device_id: "vault-1",
      local_fingerprint: "host:old",
    });

    const nonImported = candidate({
      id: "plain",
      imported_device_id: null,
      local_fingerprint: "host:old",
    });

    const resolved = pickExistingDiscoveredCandidate({
      incoming: {
        connectorId: "connector-1",
        localFingerprint: "host:new",
        hostname: imported.hostname,
        manufacturer: imported.manufacturer,
        model: imported.model,
        serialNumber: imported.serial_number,
        macAddress: imported.mac_address,
        importedDeviceId: "vault-1",
      },
      candidates: [nonImported, imported],
    });

    assert.equal(resolved?.id, "linked");
  });
});

describe("discovery display dedupe", () => {
  it("collapses duplicates to one representative", () => {
    const deduped = dedupeDiscoveredDevicesForDisplay([
      summary({ id: "d-1", localFingerprint: "mac:aa" }),
      summary({ id: "d-2", localFingerprint: "mac:bb", macAddress: "08:bb:cc:dd:ee:01" }),
    ]);

    assert.equal(deduped.length, 1);
  });

  it("keeps accepted recognition representative over pending", () => {
    const deduped = dedupeDiscoveredDevicesForDisplay([
      summary({
        id: "pending",
        localFingerprint: "mac:aa",
        macAddress: "08:bb:cc:dd:ee:01",
        recognitionStatus: "pending",
      }),
      summary({
        id: "accepted",
        localFingerprint: "mac:bb",
        macAddress: "08:bb:cc:dd:ee:01",
        recognitionStatus: "accepted",
      }),
    ]);

    assert.equal(deduped.length, 1);
    assert.equal(deduped[0]?.id, "accepted");
  });

  it("keeps different generic-manufacturer devices separate when identity differs", () => {
    const deduped = dedupeDiscoveredDevicesForDisplay([
      summary({
        id: "a",
        localFingerprint: "host:living-room-appletv",
        macAddress: "da:bb:cc:dd:ee:01",
        hostname: "living-room-appletv",
        manufacturer: "Apple",
        model: "AppleTV14,1",
      }),
      summary({
        id: "b",
        localFingerprint: "host:kitchen-homepod",
        macAddress: "ea:bb:cc:dd:ee:02",
        hostname: "kitchen-homepod",
        manufacturer: "Apple",
        model: "HomePod",
      }),
    ]);

    assert.equal(deduped.length, 2);
  });
});

describe("private MAC detection", () => {
  it("detects locally administered MAC addresses", () => {
    assert.equal(isPrivateOrRandomizedMac("da:bb:cc:dd:ee:01"), true);
    assert.equal(isPrivateOrRandomizedMac("aa:bb:cc:dd:ee:01"), true);
    assert.equal(isPrivateOrRandomizedMac("08:bb:cc:dd:ee:01"), false);
  });
});
