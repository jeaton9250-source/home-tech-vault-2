import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CONNECTOR_OFFLINE_THRESHOLD_MS,
  CONNECTOR_ONLINE_THRESHOLD_MS,
  connectorPresenceLabel,
  deriveConnectorPresence,
} from "./presence";

describe("deriveConnectorPresence", () => {
  const now = Date.UTC(2026, 6, 23, 12, 0, 0);

  it("returns revoked for revoked installations", () => {
    assert.equal(
      deriveConnectorPresence(
        "revoked",
        new Date(now).toISOString(),
        now
      ),
      "revoked"
    );
  });

  it("returns pending for pending installations", () => {
    assert.equal(
      deriveConnectorPresence(
        "pending",
        null,
        now
      ),
      "pending"
    );
  });

  it("returns online within 10 minutes", () => {
    assert.equal(
      deriveConnectorPresence(
        "active",
        new Date(
          now - CONNECTOR_ONLINE_THRESHOLD_MS + 1000
        ).toISOString(),
        now
      ),
      "online"
    );
  });

  it("returns recently seen between 10 and 60 minutes", () => {
    assert.equal(
      deriveConnectorPresence(
        "active",
        new Date(
          now - CONNECTOR_ONLINE_THRESHOLD_MS - 1000
        ).toISOString(),
        now
      ),
      "recently_seen"
    );
  });

  it("returns offline after 60 minutes", () => {
    assert.equal(
      deriveConnectorPresence(
        "active",
        new Date(
          now - CONNECTOR_OFFLINE_THRESHOLD_MS - 1000
        ).toISOString(),
        now
      ),
      "offline"
    );
  });

  it("returns offline when no heartbeat exists", () => {
    assert.equal(
      deriveConnectorPresence(
        "active",
        null,
        now
      ),
      "offline"
    );
  });

  it("labels presence states", () => {
    assert.equal(
      connectorPresenceLabel("online"),
      "Online"
    );
    assert.equal(
      connectorPresenceLabel("recently_seen"),
      "Recently seen"
    );
  });
});
