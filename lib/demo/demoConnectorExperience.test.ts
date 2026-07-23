import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildDemoDiscoveredDevices,
  buildDemoDiscoveryStats,
  buildDemoNetworkPagePayload,
} from "./demoConnectorExperience";
import { applyDemoDeviceNetworkFields, getDemoDeviceNetworkProfile } from "./demoDeviceNetworkProfiles";
import { formatDemoRelativeTime } from "./demoNetworkTime";

describe("buildDemoNetworkPagePayload", () => {
  it("returns stable connector and discovery fixtures", () => {
    const first = buildDemoNetworkPagePayload();
    const second = buildDemoNetworkPagePayload();

    assert.deepEqual(first.stats, second.stats);
    assert.equal(first.connectors[0]?.name, "Morgan Home Mac");
    assert.equal(first.connectors[0]?.appVersion, "0.1.0 Demo");
    assert.ok(first.devices.length > 0);
    assert.ok(first.stats.matchedDevices > 0);
    assert.ok(first.stats.needsReview > 0);
  });

  it("does not expose production-style connector tokens", () => {
    const payload = buildDemoNetworkPagePayload();
    const serialized = JSON.stringify(payload);

    assert.doesNotMatch(serialized, /connectorToken/i);
    assert.doesNotMatch(serialized, /github\.com.*releases/i);
    assert.match(payload.connectors[0]?.id ?? "", /^demo-/);
  });
});

describe("applyDemoDeviceNetworkFields", () => {
  it("keeps LG Washer network data stable", () => {
    const profile = getDemoDeviceNetworkProfile("demo-lg-washer");

    assert.equal(profile?.ipAddress, "192.168.1.42");
    assert.equal(profile?.hostname, "lg-washer.local");
    assert.equal(profile?.manufacturer, "LG Electronics");
    assert.equal(profile?.discoverySource, "ARP + mDNS");

    const device = applyDemoDeviceNetworkFields({
      id: "demo-lg-washer",
      device_name: "LG Washer",
      brand: "LG",
      category: "Appliance",
      model_number: "WM4000HWA",
      serial_number: "LG-WM4000-2201",
      purchase_date: "2022-11-05",
      warranty_date: "2027-11-05",
      purchase_price: 1099,
      location: "Laundry Room",
      notes: "Demo washer",
      online: false,
      last_seen_at: "",
      ip_address: "",
      mac_address: "",
      manufacturer: "LG",
      discovery_source: "",
      photo_url: "",
      demo_image: "",
    });

    assert.equal(formatDemoRelativeTime(device.last_seen_at), "3 minutes ago");
  });
});

describe("buildDemoDiscoveryStats", () => {
  it("derives review counts from grouped demo devices", () => {
    const devices = buildDemoDiscoveredDevices();
    const stats = buildDemoDiscoveryStats(devices);

    assert.equal(stats.totalDiscovered, devices.length);
    assert.ok(stats.needsReview >= 2);
    assert.equal(
      stats.needsReview,
      devices.filter((device) => device.matchStatus === "possible_match")
        .length +
        devices.filter(
          (device) =>
            (device.identificationConfidence === "unknown" ||
              device.identificationConfidence === "medium") &&
            device.matchStatus !== "matched" &&
            device.matchStatus !== "ignored"
        ).length
    );
  });
});
