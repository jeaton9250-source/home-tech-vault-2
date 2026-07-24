import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { identifyDevice } from "./identifyDevice";
import {
  isLocallyAdministeredMac,
  normalizeMacAddress,
  isStableMacForIdentity,
} from "./macAddress";
import { classifyNetworkArtifact } from "./rejectArtifacts";
import { lookupMacVendorSync } from "./vendorLookup";
import { analyzeHostname } from "./hostnameRules";
import { confidenceLabel } from "./classifyConfidence";

describe("macAddress", () => {
  it("normalizes common MAC formats", () => {
    assert.equal(
      normalizeMacAddress("AA-BB-CC-DD-EE-FF"),
      "aa:bb:cc:dd:ee:ff"
    );
    assert.equal(
      normalizeMacAddress("aabb.ccdd.eeff"),
      "aa:bb:cc:dd:ee:ff"
    );
    assert.equal(
      normalizeMacAddress("aabbccddeeff"),
      "aa:bb:cc:dd:ee:ff"
    );
  });

  it("detects private/locally administered MACs", () => {
    assert.equal(
      isLocallyAdministeredMac("86:eb:52:28:4c:ee"),
      true
    );
    assert.equal(
      isStableMacForIdentity("86:eb:52:28:4c:ee"),
      false
    );
    assert.equal(
      isLocallyAdministeredMac("28:f0:76:12:34:56"),
      false
    );
  });
});

describe("vendorLookup", () => {
  it("looks up a stable Apple OUI", () => {
    const result = lookupMacVendorSync("28:f0:76:12:34:56");
    assert.equal(result.vendor, "Apple");
    assert.equal(result.isPrivateMac, false);
    assert.notEqual(result.confidence, "none");
  });

  it("does not assign vendor for private Apple-device MAC", () => {
    const result = lookupMacVendorSync("86:eb:52:28:4c:ee");
    assert.equal(result.vendor, null);
    assert.equal(result.isPrivateMac, true);
    assert.equal(result.confidence, "none");
  });
});

describe("rejectArtifacts", () => {
  it("rejects broadcast addresses", () => {
    const artifact = classifyNetworkArtifact({
      ipAddress: "192.168.1.255",
      macAddress: "ff:ff:ff:ff:ff:ff",
    });
    assert.ok(artifact);
    assert.equal(artifact.visibleToCustomer, false);
  });

  it("rejects 0.0.0.0", () => {
    const artifact = classifyNetworkArtifact({
      ipAddress: "0.0.0.0",
    });
    assert.ok(artifact);
  });
});

describe("hostnameRules", () => {
  it("treats mac.lan as a soft Apple Mac suggestion", () => {
    const analysis = analyzeHostname("mac.lan");
    assert.equal(analysis.suggestedManufacturer, "Apple");
    assert.equal(analysis.specificity, "generic");
    assert.equal(analysis.suggestedName, "Possible Apple Mac");
  });

  it("recognizes levoit purifier hostnames", () => {
    const analysis = analyzeHostname("levoit-core300s");
    assert.equal(analysis.suggestedManufacturer, "Levoit");
    assert.equal(analysis.suggestedCategory, "air_purifier");
  });
});

describe("identifyDevice", () => {
  it("keeps stable Apple MAC + hostname at honest confidence", () => {
    const result = identifyDevice({
      macAddress: "28:f0:76:12:34:56",
      hostname: "macbook-pro.local",
      ipAddress: "192.168.1.50",
    });

    assert.ok(result.bestCandidate);
    assert.equal(result.bestCandidate?.manufacturer, "Apple");
    assert.ok(
      ["medium", "high", "exact"].includes(result.confidence)
    );
    assert.notEqual(result.confidence, "exact");
  });

  it("does not invent vendor certainty for private MAC + mac.lan", () => {
    const result = identifyDevice({
      macAddress: "86:eb:52:28:4c:ee",
      hostname: "mac.lan",
      ipAddress: "192.168.1.51",
    });

    assert.ok(result.bestCandidate);
    assert.ok(
      result.bestCandidate?.evidence.some(
        (item) => item.type === "private_mac"
      )
    );
    assert.ok(
      ["low", "medium", "unknown"].includes(result.confidence)
    );
    assert.notEqual(result.confidence, "exact");
    assert.notEqual(result.confidence, "high");
  });

  it("identifies Apple TV with AirPlay evidence", () => {
    const result = identifyDevice({
      hostname: "main-tv.local",
      macAddress: "a4:b1:97:11:22:33",
      mdnsServices: [
        "_airplay._tcp.local",
        "_companion-link._tcp.local",
        "_appletv-v2._tcp.local",
      ],
      ipAddress: "192.168.1.157",
    });

    assert.ok(result.bestCandidate);
    assert.match(
      result.bestCandidate!.suggestedName,
      /Apple TV|Apple Mac/i
    );
    assert.ok(
      ["high", "medium", "exact"].includes(result.confidence)
    );
  });

  it("identifies Chromecast via _googlecast._tcp", () => {
    const result = identifyDevice({
      mdnsServices: ["_googlecast._tcp.local"],
      hostname: "living-room-chromecast",
      ipAddress: "192.168.1.80",
    });

    assert.ok(result.bestCandidate);
    assert.match(
      result.bestCandidate!.suggestedName,
      /Chromecast|Google/i
    );
  });

  it("identifies Philips Hue Bridge", () => {
    const result = identifyDevice({
      hostname: "philips-hue",
      mdnsServices: ["_hue._tcp.local"],
      ipAddress: "192.168.1.90",
    });

    assert.ok(result.bestCandidate);
    assert.match(
      result.bestCandidate!.suggestedName,
      /Hue/i
    );
  });

  it("identifies Sonos speaker services", () => {
    const result = identifyDevice({
      hostname: "sonos-roam",
      mdnsServices: ["_sonos._tcp.local"],
      macAddress: "b8:e9:37:01:02:03",
      ipAddress: "192.168.1.91",
    });

    assert.ok(result.bestCandidate);
    assert.equal(result.bestCandidate?.manufacturer, "Sonos");
  });

  it("rejects broadcast as unknown / no auto-match", () => {
    const result = identifyDevice({
      ipAddress: "192.168.1.255",
      macAddress: "ff:ff:ff:ff:ff:ff",
    });

    assert.equal(result.bestCandidate, null);
    assert.equal(result.shouldAutoMatch, false);
    assert.match(result.identificationSource, /artifact/i);
  });

  it("uses connector host identity as exact when provided", () => {
    const result = identifyDevice({
      hostname: "Jason’s MacBook Pro",
      ipAddress: "192.168.1.20",
      macAddress: "28:f0:76:aa:bb:cc",
      connectorHostIdentity: {
        modelName: "MacBook Pro",
        modelFamily: "MacBook Pro",
        computerName: "Jason’s MacBook Pro",
      },
    });

    assert.equal(result.confidence, "exact");
    assert.equal(result.shouldAutoMatch, true);
  });

  it("preserves previous confirmation as exact", () => {
    const result = identifyDevice({
      hostname: "unknown-plug",
      manufacturer: "Espressif",
      previousConfirmation: true,
      matchedVaultDeviceId: "device-123",
      ipAddress: "192.168.1.77",
    });

    assert.equal(result.confidence, "exact");
    assert.equal(result.matchedVaultDeviceId, "device-123");
  });

  it("keeps unknown devices honestly unknown", () => {
    const result = identifyDevice({
      ipAddress: "192.168.1.200",
      macAddress: "02:00:00:00:00:01",
    });

    assert.ok(
      result.confidence === "unknown" ||
        result.confidence === "low"
    );
    assert.equal(result.shouldAutoMatch, false);
  });

  it("exposes honest confidence labels", () => {
    assert.equal(confidenceLabel("exact"), "Exact identity");
    assert.equal(
      confidenceLabel("low"),
      "Low-confidence suggestion"
    );
    assert.equal(confidenceLabel("unknown"), "Unknown device");
  });
});
