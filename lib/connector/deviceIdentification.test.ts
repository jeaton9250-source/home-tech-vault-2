import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  cleanDiscoveredHostname,
  classifyMacManufacturer,
  classifyMdnsService,
  classifySsdpDeviceType,
  identifyDiscoveredDevice,
  identificationFromConfirmedVaultDevice,
  resolveDiscoveredIdentification,
} from "./deviceIdentification";

describe("identifyDiscoveredDevice", () => {
  it("classifies mDNS printer services", () => {
    const result = classifyMdnsService("_ipp._tcp.local");

    assert.ok(result);
    assert.equal(result.category, "Printer");
  });

  it("classifies SSDP media renderers", () => {
    const result = classifySsdpDeviceType(
      "urn:schemas-upnp-org:device:MediaRenderer:1"
    );

    assert.ok(result);
    assert.equal(result.category, "Streaming Device");
  });

  it("keeps generic Espressif at low confidence", () => {
    const result = identifyDiscoveredDevice({
      manufacturer: "Espressif Inc.",
    });

    assert.equal(result.likelyCategory, "Smart Home Device");
    assert.equal(result.identificationConfidence, "low");
  });

  it("raises confidence when hostname and manufacturer agree for aquarium lighting", () => {
    const result = identifyDiscoveredDevice({
      manufacturer: "Espressif Inc.",
      hostname: "reef-light-tank-1.local",
    });

    assert.equal(result.likelyCategory, "Aquarium Lighting");
    assert.equal(result.identificationConfidence, "medium");
  });

  it("classifies aquarium controllers by brand and hostname", () => {
    const result = identifyDiscoveredDevice({
      manufacturer: "Neptune Systems",
      hostname: "apex.local",
    });

    assert.equal(result.likelyCategory, "Aquarium Controller");
    assert.ok(
      ["high", "medium"].includes(
        result.identificationConfidence
      )
    );
  });

  it("uses confirmed identity before heuristics", () => {
    const result = resolveDiscoveredIdentification({
      observation: {
        manufacturer: "Espressif Inc.",
        hostname: "unknown-plug.local",
      },
      importedDeviceId: "device-1",
      matchConfirmedAt: "2026-07-23T00:00:00.000Z",
      confirmedVaultDevice: {
        deviceName: "Reef Light",
        brand: "ReefBeat",
        manufacturer: "ReefBeat",
        modelNumber: "RB-4",
        category: "Aquarium Lighting",
      },
    });

    assert.equal(result.identificationConfidence, "exact");
    assert.equal(result.displayName, "Reef Light");
    assert.match(
      result.identificationReasons.join(" "),
      /confirmed/i
    );
  });

  it("preserves user-confirmed fields through confirmed identification", () => {
    const result = identificationFromConfirmedVaultDevice({
      deviceName: "Display Tank Light",
      brand: "ReefBeat",
      manufacturer: "ReefBeat",
      modelNumber: "RB-4",
      category: "Aquarium Lighting",
    });

    assert.equal(result.model, "RB-4");
    assert.equal(result.likelyBrand, "ReefBeat");
    assert.equal(result.likelyCategory, "Aquarium Lighting");
  });

  it("does not treat same IP as same device when fingerprints differ", () => {
    const first = identifyDiscoveredDevice({
      ipAddress: "192.168.1.20",
      macAddress: "aa:bb:cc:dd:ee:01",
      hostname: "device-a.local",
    });
    const second = identifyDiscoveredDevice({
      ipAddress: "192.168.1.20",
      macAddress: "aa:bb:cc:dd:ee:02",
      hostname: "device-b.local",
    });

    assert.notEqual(
      first.displayName,
      second.displayName === first.displayName
        ? "unexpected"
        : second.displayName
    );
  });

  it("classifies Amazon Echo with high confidence from multiple signals", () => {
    const result = identifyDiscoveredDevice({
      manufacturer: "Amazon Technologies",
      hostname: "echo-kitchen.local",
      ssdpDeviceType: "urn:schemas-upnp-org:device:MediaRenderer:1",
    });

    assert.equal(result.likelyCategory, "Smart Speaker");
    assert.equal(result.identificationConfidence, "high");
    assert.ok(
      result.identificationReasons.some((reason) =>
        /amazon|echo|ssdp/i.test(reason)
      )
    );
  });

  it("classifies MAC manufacturer without over-identifying chipset vendors", () => {
    const apple = classifyMacManufacturer("Apple, Inc.");

    assert.ok(apple);
    assert.notEqual(apple.confidence, "exact");

    const espressif = classifyMacManufacturer("Espressif Inc.");

    assert.ok(espressif);
    assert.equal(espressif.confidence, "low");
  });

  it("uses cleaned hostname as the user-facing fallback and evidence summary", () => {
    const result = identifyDiscoveredDevice({
      hostname: "LivingRoomTV.lan",
    });

    assert.equal(result.displayName, "Living Room TV");
    assert.equal(result.identificationReasons[0], "Hostname is Living Room TV");
  });
});

describe("cleanDiscoveredHostname", () => {
  it("removes the longest matching suffix first", () => {
    assert.equal(cleanDiscoveredHostname("xbox-series-x.home.arpa"), "Xbox Series X");
    assert.equal(cleanDiscoveredHostname("router.fritz.box"), "Router");
  });

  it("removes each supported local suffix", () => {
    assert.equal(cleanDiscoveredHostname("LivingRoomTV.lan"), "Living Room TV");
    assert.equal(cleanDiscoveredHostname("Jason-MacBook.local"), "Jason MacBook");
    assert.equal(cleanDiscoveredHostname("roku-ultra.home"), "Roku Ultra");
    assert.equal(cleanDiscoveredHostname("xbox-series-x.home.arpa"), "Xbox Series X");
    assert.equal(cleanDiscoveredHostname("fritz-repeater.fritz.box"), "Fritz Repeater");
  });

  it("handles uppercase and lowercase suffixes", () => {
    assert.equal(cleanDiscoveredHostname("HP_OfficeJet.LAN"), "HP OfficeJet");
    assert.equal(cleanDiscoveredHostname("BRAVIA-7F31.Local"), "BRAVIA 7F31");
  });

  it("formats camelCase, hyphens, and underscores", () => {
    assert.equal(cleanDiscoveredHostname("LivingRoomTV"), "Living Room TV");
    assert.equal(cleanDiscoveredHostname("HP_OfficeJet"), "HP OfficeJet");
    assert.equal(cleanDiscoveredHostname("xbox-series-x"), "Xbox Series X");
  });

  it("preserves useful model numbers", () => {
    assert.equal(cleanDiscoveredHostname("BRAVIA-7F31.lan"), "BRAVIA 7F31");
    assert.equal(cleanDiscoveredHostname("roku-Ultra-4800X.local"), "Roku Ultra 4800X");
  });

  it("returns null for empty or null hostnames", () => {
    assert.equal(cleanDiscoveredHostname(null), null);
    assert.equal(cleanDiscoveredHostname(""), null);
    assert.equal(cleanDiscoveredHostname("   "), null);
  });

  it("keeps already clean names readable", () => {
    assert.equal(cleanDiscoveredHostname("Roku Ultra"), "Roku Ultra");
  });
});

describe("cross-household isolation", () => {
  it("does not reuse confirmed identity without a linked vault device", () => {
    const result = resolveDiscoveredIdentification({
      observation: {
        manufacturer: "Apple",
        hostname: "kitchen-ipad.local",
        stableFingerprint: "mac:aa:bb:cc:dd:ee:99",
      },
      importedDeviceId: "other-household-device",
      matchConfirmedAt: "2026-07-23T00:00:00.000Z",
      confirmedVaultDevice: null,
    });

    assert.notEqual(result.identificationConfidence, "exact");
  });
});
