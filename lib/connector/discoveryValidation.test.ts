import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DiscoveryValidationError,
  parseDiscoverySyncPayload,
} from "./discoveryValidation";

describe("parseDiscoverySyncPayload", () => {
  const nowIso = "2026-07-23T04:00:00.000Z";

  it("accepts private IP addresses", () => {
    const payload = parseDiscoverySyncPayload(
      {
        scannedAt: nowIso,
        devices: [
          {
            localFingerprint: "mac:aa:bb:cc:dd:ee:ff",
            ipAddress: "192.168.1.20",
            macAddress: "aa:bb:cc:dd:ee:ff",
            discoverySource: "ARP",
          },
        ],
      },
      nowIso
    );

    assert.equal(payload.devices.length, 1);
    assert.equal(
      payload.devices[0]?.ipAddress,
      "192.168.1.20"
    );
  });

  it("rejects public IP addresses", () => {
    assert.throws(
      () =>
        parseDiscoverySyncPayload(
          {
            scannedAt: nowIso,
            devices: [
              {
                localFingerprint: "ip:8.8.8.8",
                ipAddress: "8.8.8.8",
              },
            ],
          },
          nowIso
        ),
      (error: unknown) =>
        error instanceof DiscoveryValidationError
    );
  });

  it("enforces batch size limits", () => {
    const devices = Array.from(
      { length: 501 },
      (_, index) => ({
        localFingerprint: `mac:test:${index}`,
        ipAddress: "192.168.1.10",
        macAddress: "aa:bb:cc:dd:ee:ff",
      })
    );

    assert.throws(
      () =>
        parseDiscoverySyncPayload(
          {
            scannedAt: nowIso,
            devices,
          },
          nowIso
        ),
      (error: unknown) =>
        error instanceof DiscoveryValidationError
    );
  });
});
