import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  computeHomePulseDevicePresenceCounts,
  deriveDeviceNetworkPresence,
  formatDevicePresenceListLine,
  presentDeviceNetworkPresence,
} from "./devicePresence";

describe("deriveDeviceNetworkPresence", () => {
  const now = Date.UTC(2026, 6, 23, 12, 0, 0);

  it("returns unknown when there are no observations", () => {
    assert.equal(
      deriveDeviceNetworkPresence({
        online: true,
        now,
      }),
      "unknown"
    );
  });

  it("does not treat connector-only context as device online", () => {
    assert.equal(
      deriveDeviceNetworkPresence({
        online: null,
        lastSeenAt: null,
        networkUpdatedAt: null,
        now,
      }),
      "unknown"
    );
  });

  it("returns online when the latest scan marked the device online", () => {
    assert.equal(
      deriveDeviceNetworkPresence({
        online: true,
        lastSeenAt: new Date(now - 2 * 60 * 1000).toISOString(),
        networkUpdatedAt: new Date(now - 2 * 60 * 1000).toISOString(),
        now,
      }),
      "online"
    );
  });

  it("does not keep sticky online when last_seen_at is stale", () => {
    assert.equal(
      deriveDeviceNetworkPresence({
        online: true,
        lastSeenAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
        networkUpdatedAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
        now,
      }),
      "not_recently_detected"
    );
  });

  it("returns recently detected within 30 minutes", () => {
    assert.equal(
      deriveDeviceNetworkPresence({
        online: false,
        lastSeenAt: new Date(now - 20 * 60 * 1000).toISOString(),
        networkUpdatedAt: new Date(now - 20 * 60 * 1000).toISOString(),
        now,
      }),
      "recently_detected"
    );
  });

  it("returns not recently detected after 45 minutes", () => {
    assert.equal(
      deriveDeviceNetworkPresence({
        online: false,
        lastSeenAt: new Date(now - 90 * 60 * 1000).toISOString(),
        networkUpdatedAt: new Date(now - 90 * 60 * 1000).toISOString(),
        now,
      }),
      "not_recently_detected"
    );
  });
});

describe("presentDeviceNetworkPresence", () => {
  it("uses homeowner-friendly labels", () => {
    const presentation = presentDeviceNetworkPresence({
      online: false,
      lastSeenAt: "2026-07-22T12:00:00.000Z",
      networkUpdatedAt: "2026-07-22T12:00:00.000Z",
      now: Date.UTC(2026, 6, 23, 12, 0, 0),
    });

    assert.equal(
      presentation.label,
      "Not Recently Detected"
    );
    assert.equal(presentation.listEmoji, "⚪");
  });
});

describe("formatDevicePresenceListLine", () => {
  it("formats list cards without IP addresses", () => {
    const lastSeenAt = new Date(
      Date.now() - 2 * 60 * 1000
    ).toISOString();

    const line = formatDevicePresenceListLine({
      online: true,
      lastSeenAt,
      networkUpdatedAt: lastSeenAt,
    });

    assert.match(line, /^🟢 Online · Active now/);
    assert.doesNotMatch(line, /192\.168\./);
  });
});

describe("computeHomePulseDevicePresenceCounts", () => {
  it("aggregates shared presence states", () => {
    const counts = computeHomePulseDevicePresenceCounts(
      [
        {
          online: true,
          last_seen_at: "2026-07-23T11:59:00.000Z",
          network_updated_at: "2026-07-23T11:59:00.000Z",
        },
        {
          online: false,
          last_seen_at: "2026-07-23T11:40:00.000Z",
          network_updated_at: "2026-07-23T11:40:00.000Z",
        },
        {
          online: false,
          last_seen_at: "2026-07-22T10:00:00.000Z",
          network_updated_at: "2026-07-22T10:00:00.000Z",
        },
        {},
      ],
      Date.UTC(2026, 6, 23, 12, 0, 0)
    );

    assert.equal(counts.online, 1);
    assert.equal(counts.recentlyDetected, 1);
    assert.equal(counts.notRecentlyDetected, 1);
    assert.equal(counts.unknown, 1);
  });
});
