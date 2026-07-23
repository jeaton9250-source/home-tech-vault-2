import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getLatestTimestamp,
  mergePresenceFromDiscovery,
  pickFreshestDiscoveryPresence,
} from "./deviceNetworkTimestamps";

describe("getLatestTimestamp", () => {
  it("returns the newest valid ISO timestamp", () => {
    assert.equal(
      getLatestTimestamp(
        "2026-07-10T12:00:00.000Z",
        "2026-07-23T01:15:00.000Z"
      ),
      "2026-07-23T01:15:00.000Z"
    );
  });

  it("ignores empty values", () => {
    assert.equal(
      getLatestTimestamp(null, "2026-07-23T01:15:00.000Z"),
      "2026-07-23T01:15:00.000Z"
    );
  });
});

describe("mergePresenceFromDiscovery", () => {
  it("prefers fresher discovery online state and timestamp", () => {
    const merged = mergePresenceFromDiscovery(
      {
        online: false,
        last_seen_at: "2026-07-10T12:00:00.000Z",
        network_updated_at: "2026-07-10T12:00:00.000Z",
      },
      {
        online: true,
        last_seen_at: "2026-07-23T01:15:00.000Z",
      }
    );

    assert.equal(merged.online, true);
    assert.equal(merged.last_seen_at, "2026-07-23T01:15:00.000Z");
    assert.equal(
      merged.network_updated_at,
      "2026-07-23T01:15:00.000Z"
    );
  });
});

describe("pickFreshestDiscoveryPresence", () => {
  it("selects the newest discovery observation", () => {
    const best = pickFreshestDiscoveryPresence([
      {
        online: false,
        last_seen_at: "2026-07-10T12:00:00.000Z",
      },
      {
        online: true,
        last_seen_at: "2026-07-23T01:15:00.000Z",
      },
    ]);

    assert.equal(best?.online, true);
    assert.equal(best?.last_seen_at, "2026-07-23T01:15:00.000Z");
  });
});
