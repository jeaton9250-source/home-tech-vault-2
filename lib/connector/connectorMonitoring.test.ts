import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildConnectorMonitoringSummary,
  computeNextAutomaticScan,
} from "./connectorMonitoring";

describe("connectorMonitoring", () => {
  it("returns manual mode when monitoring is disabled", () => {
    const summary = buildConnectorMonitoringSummary({
      monitoringEnabled: false,
      lastScanAt: "2026-07-21T12:00:00.000Z",
    });

    assert.equal(summary.mode, "manual");
    assert.equal(summary.label, "Manual scans");
    assert.equal(summary.nextScanLabel, "Automatic scans require Pro");
  });

  it("returns automatic mode with next scan estimate", () => {
    const lastScanAt = "2026-07-21T12:00:00.000Z";
    const now = new Date("2026-07-21T12:10:00.000Z").getTime();

    const summary = buildConnectorMonitoringSummary({
      monitoringEnabled: true,
      lastScanAt,
      now,
    });

    assert.equal(summary.mode, "automatic");
    assert.equal(summary.nextScanAt, "2026-07-21T12:15:00.000Z");
  });

  it("advances next scan when interval has passed", () => {
    const lastScanAt = "2026-07-21T12:00:00.000Z";
    const now = new Date("2026-07-21T12:20:00.000Z").getTime();

    const nextScanAt = computeNextAutomaticScan(lastScanAt, 15, now);

    assert.equal(nextScanAt, "2026-07-21T12:30:00.000Z");
  });
});
