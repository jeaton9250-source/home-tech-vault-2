import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildVaultPresenceUpdateFromScan,
  indexObservedDevicesByMac,
  indexVaultDevicesByMac,
} from "./vaultPresenceFromScan";

describe("vaultPresenceFromScan", () => {
  it("builds presence timestamps from a scan observation", () => {
    const update = buildVaultPresenceUpdateFromScan({
      scannedAt: "2026-07-23T17:00:00.000Z",
      observed: {
        macAddress: "aa:bb:cc:dd:ee:ff",
        ipAddress: "192.168.1.20",
        manufacturer: "Apple",
        online: true,
      },
    });

    assert.equal(update.last_seen_at, "2026-07-23T17:00:00.000Z");
    assert.equal(update.network_updated_at, "2026-07-23T17:00:00.000Z");
    assert.equal(update.online, true);
    assert.equal(update.ip_address, "192.168.1.20");
    assert.equal(update.manufacturer, "Apple");
  });

  it("indexes observed devices by normalized mac", () => {
    const map = indexObservedDevicesByMac([
      {
        macAddress: "AA-BB-CC-DD-EE-FF",
        ipAddress: "10.0.0.2",
      },
    ]);

    assert.equal(map.get("aa:bb:cc:dd:ee:ff")?.ipAddress, "10.0.0.2");
  });

  it("indexes vault devices by normalized mac", () => {
    const map = indexVaultDevicesByMac([
      { id: "1", mac_address: "AA:BB:CC:DD:EE:01" },
      { id: "2", mac_address: "aa-bb-cc-dd-ee-02" },
    ]);

    assert.equal(map.size, 2);
    assert.equal(map.get("aa:bb:cc:dd:ee:01")?.id, "1");
    assert.equal(map.get("aa:bb:cc:dd:ee:02")?.id, "2");
  });
});
