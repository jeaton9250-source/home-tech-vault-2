import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { discoveryDeviceTitle } from "./identificationReasons";

import type { DiscoveredDeviceSummary } from "./discoveryTypes";

function buildDevice(
  overrides: Partial<DiscoveredDeviceSummary> = {}
): DiscoveredDeviceSummary {
  return {
    id: "discovery-1",
    connectorId: "connector-1",
    localFingerprint: "mac:aa:bb:cc:dd:ee:ff",
    hostname: "LivingRoomTV.lan",
    manufacturer: "Sony",
    model: "BRAVIA-7F31",
    serialNumber: null,
    ipAddress: "192.168.1.20",
    macAddress: "aa:bb:cc:dd:ee:ff",
    deviceType: "television",
    friendlyName: null,
    mdnsServices: [],
    ssdpDeviceType: null,
    ssdpDescriptionUrl: null,
    likelyCategory: "TV",
    likelyBrand: "Sony",
    identificationConfidence: "high",
    identificationReasons: ["Hostname is Living Room TV"],
    identificationDisplayName: null,
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
      friendlyName: "Living Room TV",
      manufacturer: "Sony",
      model: "BRAVIA-7F31",
      category: "TV",
      deviceTypeKey: "television",
      confidenceScore: 92,
      reason: "Hostname is Living Room TV",
    },
    matchStatus: "new",
    matchConfidence: null,
    matchReason: null,
    matchedDeviceId: null,
    matchedDevice: null,
    ...overrides,
  };
}

describe("discoveryDeviceTitle", () => {
  it("prefers accepted recognition names first", () => {
    const result = discoveryDeviceTitle(
      buildDevice({
        recognitionStatus: "accepted",
        recognitionSuggestion: {
          friendlyName: "Edited Living Room TV",
          manufacturer: "Sony",
          model: "BRAVIA-7F31",
          category: "TV",
          deviceTypeKey: "television",
          confidenceScore: 92,
          reason: "Edited by user",
        },
        friendlyName: "Old Friendly Name",
        identificationDisplayName: "Old Display Name",
      })
    );

    assert.equal(result, "Edited Living Room TV");
  });

  it("falls back through friendly name, identification display, cleaned hostname, and manufacturer/category", () => {
    assert.equal(
      discoveryDeviceTitle(
        buildDevice({
          friendlyName: "Kitchen TV",
          identificationDisplayName: "Sony Living Room TV.lan",
        })
      ),
      "Kitchen TV"
    );

    assert.equal(
      discoveryDeviceTitle(
        buildDevice({
          friendlyName: null,
          identificationDisplayName: "Likely Streaming Device",
        })
      ),
      "Likely Streaming Device"
    );

    assert.equal(
      discoveryDeviceTitle(
        buildDevice({
          friendlyName: null,
          identificationDisplayName: null,
          hostname: "xbox-series-x.home.arpa",
        })
      ),
      "Xbox Series X"
    );

    assert.equal(
      discoveryDeviceTitle(
        buildDevice({
          friendlyName: null,
          identificationDisplayName: null,
          hostname: null,
          manufacturer: "Roku",
          likelyCategory: "Streaming Device",
        })
      ),
      "Roku Streaming Device"
    );

    assert.equal(
      discoveryDeviceTitle(
        buildDevice({
          friendlyName: null,
          identificationDisplayName: null,
          hostname: null,
          manufacturer: null,
          likelyCategory: null,
        })
      ),
      "Unknown device"
    );
  });

  it("never uses raw hostname directly as the visible title", () => {
    const result = discoveryDeviceTitle(
      buildDevice({
        friendlyName: null,
        identificationDisplayName: null,
        hostname: "BRAVIA-7F31.LAN",
        manufacturer: null,
        likelyCategory: null,
      })
    );

    assert.equal(result, "BRAVIA 7F31");
  });
});
