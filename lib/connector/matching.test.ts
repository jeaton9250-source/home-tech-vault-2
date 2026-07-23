import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildDeviceNetworkEnrichmentUpdate,
} from "./deviceEnrichment";
import {
  isDuplicateImportCandidate,
  matchDiscoveredDevice,
  shouldAutoLinkMatch,
} from "./matching";
import {
  computeStableFingerprint,
  normalizeMacAddress,
} from "./network";

import type {
  DiscoveredForMatching,
  VaultDeviceForMatching,
} from "./discoveryTypes";

const HOUSEHOLD_A = "household-a";
const HOUSEHOLD_B = "household-b";

function vaultDevice(
  overrides: Partial<VaultDeviceForMatching> &
    Pick<VaultDeviceForMatching, "id">
): VaultDeviceForMatching {
  return {
    householdId: HOUSEHOLD_A,
    deviceName: "Living Room TV",
    brand: "Samsung",
    manufacturer: "Samsung",
    modelNumber: "QN65Q80",
    serialNumber: "SN-12345",
    macAddress: "aa:bb:cc:dd:ee:ff",
    networkFingerprint: "mac:aa:bb:cc:dd:ee:ff",
    category: "TV & Streaming",
    ipAddress: "192.168.1.20",
    hostname: "living-room-tv",
    firstSeenAt: "2026-07-01T12:00:00.000Z",
    discoverySource: "Manual Entry",
    ...overrides,
  };
}

function discovered(
  overrides: Partial<DiscoveredForMatching> &
    Pick<
      DiscoveredForMatching,
      "localFingerprint"
    >
): DiscoveredForMatching {
  return {
    householdId: HOUSEHOLD_A,
    hostname: "living-room-tv",
    manufacturer: "Samsung",
    model: "QN65Q80",
    serialNumber: null,
    ipAddress: "192.168.1.20",
    macAddress: "aa:bb:cc:dd:ee:ff",
    deviceType: "TV & Streaming",
    importedDeviceId: null,
    matchConfirmedAt: null,
    ignoredAt: null,
    ...overrides,
  };
}

describe("matchDiscoveredDevice", () => {
  it("matches a previously confirmed discovered-device link", () => {
    const result = matchDiscoveredDevice(
      discovered({
        localFingerprint: "mac:aa:bb:cc:dd:ee:ff",
        importedDeviceId: "device-1",
        matchConfirmedAt:
          "2026-07-20T12:00:00.000Z",
        macAddress: "11:22:33:44:55:66",
      }),
      [
        vaultDevice({
          id: "device-1",
          macAddress: "aa:bb:cc:dd:ee:ff",
        }),
      ]
    );

    assert.equal(result.matchStatus, "matched");
    assert.equal(result.matchConfidence, "exact");
    assert.equal(result.matchedDeviceId, "device-1");
    assert.match(
      result.matchReason ?? "",
      /previous confirmation/i
    );
  });

  it("matches on exact MAC address", () => {
    const result = matchDiscoveredDevice(
      discovered({
        localFingerprint: "mac:aa:bb:cc:dd:ee:ff",
        macAddress: "AA-BB-CC-DD-EE-FF",
      }),
      [vaultDevice({ id: "device-1" })]
    );

    assert.equal(result.matchStatus, "matched");
    assert.equal(result.matchConfidence, "exact");
    assert.equal(result.matchReason, "Matched by MAC address");
    assert.equal(result.matchedDeviceId, "device-1");
    assert.equal(shouldAutoLinkMatch(result), true);
  });

  it("matches on exact stable network fingerprint", () => {
    const result = matchDiscoveredDevice(
      discovered({
        localFingerprint: "mac:aa:bb:cc:dd:ee:ff",
        macAddress: null,
      }),
      [
        vaultDevice({
          id: "device-1",
          macAddress: null,
          networkFingerprint:
            "mac:aa:bb:cc:dd:ee:ff",
        }),
      ]
    );

    assert.equal(result.matchStatus, "matched");
    assert.equal(result.matchConfidence, "exact");
    assert.equal(
      result.matchReason,
      "Matched by stable network fingerprint"
    );
  });

  it("requires review for manufacturer and model without auto-link", () => {
    const result = matchDiscoveredDevice(
      discovered({
        localFingerprint: "host:living-room-tv|mfg:samsung|model:qn65q80",
        macAddress: null,
        serialNumber: null,
      }),
      [
        vaultDevice({
          id: "device-1",
          macAddress: null,
          networkFingerprint: null,
          serialNumber: null,
        }),
      ]
    );

    assert.equal(result.matchStatus, "possible_match");
    assert.equal(result.matchConfidence, "high");
    assert.equal(
      result.matchReason,
      "Matched by manufacturer and model"
    );
    assert.equal(shouldAutoLinkMatch(result), false);
  });

  it("does not match when only IP address overlaps", () => {
    const result = matchDiscoveredDevice(
      discovered({
        localFingerprint:
          "host:guest-ipad|mfg:apple|model:ipad",
        ipAddress: "192.168.1.20",
        macAddress: "11:22:33:44:55:66",
        hostname: "guest-ipad",
        manufacturer: "Apple",
        model: "iPad",
        deviceType: "Mobile",
      }),
      [vaultDevice({ id: "device-1" })]
    );

    assert.notEqual(result.matchStatus, "matched");
  });

  it("does not match on hostname alone", () => {
    const result = matchDiscoveredDevice(
      discovered({
        localFingerprint:
          "host:living-room-tv-2|mfg:unknown|model:unknown",
        macAddress: null,
        serialNumber: null,
        manufacturer: null,
        model: null,
        deviceType: null,
        hostname: "living-room-tv-2",
      }),
      [
        vaultDevice({
          id: "device-1",
          hostname: "living-room-tv",
          deviceName: "Living Room TV",
          macAddress: null,
          networkFingerprint: null,
          serialNumber: null,
        }),
      ]
    );

    assert.equal(result.matchStatus, "new");
    assert.equal(result.matchedDeviceId, null);
    assert.equal(shouldAutoLinkMatch(result), false);
  });

  it("flags manufacturer and hostname as possible match", () => {
    const result = matchDiscoveredDevice(
      discovered({
        localFingerprint: "host:living-room-tv-2|mfg:samsung",
        macAddress: null,
        manufacturer: "Samsung",
        model: null,
        hostname: "living-room-tv",
      }),
      [
        vaultDevice({
          id: "device-1",
          manufacturer: "Samsung",
          hostname: "living-room-tv",
          macAddress: null,
          networkFingerprint: null,
        }),
      ]
    );

    assert.equal(result.matchStatus, "possible_match");
    assert.match(
      result.matchReason ?? "",
      /manufacturer and hostname/i
    );
  });

  it("never matches devices across households", () => {
    const result = matchDiscoveredDevice(
      discovered({
        localFingerprint: "mac:aa:bb:cc:dd:ee:ff",
        householdId: HOUSEHOLD_B,
      }),
      [vaultDevice({ id: "device-1" })]
    );

    assert.equal(result.matchStatus, "new");
    assert.equal(result.matchedDeviceId, null);
  });

  it("keeps ignored devices ignored", () => {
    const result = matchDiscoveredDevice(
      discovered({
        localFingerprint: "mac:aa:bb:cc:dd:ee:ff",
        ignoredAt: "2026-07-21T12:00:00.000Z",
      }),
      [vaultDevice({ id: "device-1" })]
    );

    assert.equal(result.matchStatus, "ignored");
    assert.equal(result.matchedDeviceId, null);
  });
});

describe("buildDeviceNetworkEnrichmentUpdate", () => {
  it("does not overwrite user-controlled identity fields", () => {
    const update = buildDeviceNetworkEnrichmentUpdate(
      vaultDevice({ id: "device-1" }),
      {
        ipAddress: "192.168.1.88",
        macAddress: "aa:bb:cc:dd:ee:ff",
        hostname: "tv-upstairs",
        manufacturer: "Samsung Electronics",
        model: "QN65Q90",
        online: true,
        firstSeenAt: "2026-07-21T10:00:00.000Z",
        lastSeenAt: "2026-07-21T12:00:00.000Z",
        discoverySource: "Connector Scan",
        connectorId: "connector-1",
        networkFingerprint: "mac:aa:bb:cc:dd:ee:ff",
      },
      {
        existingDiscoverySource: "Manual Entry",
      }
    );

    assert.equal(update.ip_address, "192.168.1.88");
    assert.equal(update.hostname, "tv-upstairs");
    assert.equal(update.online, true);
    assert.equal(
      update.last_seen_at,
      "2026-07-21T12:00:00.000Z"
    );
    assert.equal(update.device_name, undefined);
    assert.equal(update.location, undefined);
    assert.equal(update.notes, undefined);
    assert.equal(update.purchase_date, undefined);
    assert.equal(update.model_number, undefined);
    assert.equal(update.manufacturer, "Samsung Electronics");
  });

  it("updates IP address on an existing matched record", () => {
    const update = buildDeviceNetworkEnrichmentUpdate(
      vaultDevice({
        id: "device-1",
        ipAddress: "192.168.1.20",
      }),
      {
        ipAddress: "192.168.1.44",
        macAddress: "aa:bb:cc:dd:ee:ff",
        hostname: "living-room-tv",
        manufacturer: "Samsung",
        model: "QN65Q80",
        online: true,
        firstSeenAt: "2026-07-01T12:00:00.000Z",
        lastSeenAt: "2026-07-21T12:00:00.000Z",
        discoverySource: "Connector Scan",
        connectorId: "connector-1",
        networkFingerprint: "mac:aa:bb:cc:dd:ee:ff",
      }
    );

    assert.equal(update.ip_address, "192.168.1.44");
  });

  it("fills empty model and brand fields only when missing", () => {
    const update = buildDeviceNetworkEnrichmentUpdate(
      vaultDevice({
        id: "device-1",
        brand: null,
        modelNumber: null,
        manufacturer: null,
      }),
      {
        ipAddress: "192.168.1.20",
        macAddress: "aa:bb:cc:dd:ee:ff",
        hostname: "living-room-tv",
        manufacturer: "Samsung",
        model: "QN65Q80",
        online: true,
        firstSeenAt: "2026-07-21T10:00:00.000Z",
        lastSeenAt: "2026-07-21T12:00:00.000Z",
        discoverySource: "Connector Scan",
        connectorId: "connector-1",
        networkFingerprint: "mac:aa:bb:cc:dd:ee:ff",
      }
    );

    assert.equal(update.manufacturer, "Samsung");
    assert.equal(update.brand, "Samsung");
    assert.equal(update.model_number, "QN65Q80");
  });
});

describe("duplicate import detection", () => {
  it("flags high-confidence candidates as duplicate imports", () => {
    const result = matchDiscoveredDevice(
      discovered({
        localFingerprint: "mac:aa:bb:cc:dd:ee:ff",
      }),
      [vaultDevice({ id: "device-1" })]
    );

    assert.equal(
      isDuplicateImportCandidate(result),
      true
    );
  });

  it("does not flag weak hostname-only review as duplicate import", () => {
    const result = matchDiscoveredDevice(
      discovered({
        localFingerprint:
          "host:living-room-tv-2|mfg:unknown|model:unknown",
        macAddress: null,
        serialNumber: null,
        manufacturer: null,
        model: null,
        deviceType: null,
        hostname: "living-room-tv-2",
      }),
      [
        vaultDevice({
          id: "device-1",
          hostname: "living-room-tv",
          macAddress: null,
          networkFingerprint: null,
          serialNumber: null,
        }),
      ]
    );

    assert.equal(
      isDuplicateImportCandidate(result),
      false
    );
  });
});

describe("computeStableFingerprint", () => {
  it("prefers MAC over IP for fingerprint stability", () => {
    const fingerprint = computeStableFingerprint({
      macAddress: "aa:bb:cc:dd:ee:01",
      hostname: "device",
      manufacturer: "Apple",
      model: "TV",
    });

    assert.equal(
      fingerprint,
      `mac:${normalizeMacAddress("aa:bb:cc:dd:ee:01")}`
    );
  });
});
