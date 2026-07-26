import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { mapConnectorStatus, connectorCodeHint } from "./connectors";

describe("iOS connector compatibility helpers", () => {
  const now = Date.now();

  it("maps active connectors to online/stale/offline", () => {
    assert.equal(
      mapConnectorStatus({
        status: "active",
        last_seen_at: new Date(now - 60_000).toISOString(),
      }),
      "online"
    );

    assert.equal(
      mapConnectorStatus({
        status: "active",
        last_seen_at: new Date(now - 20 * 60_000).toISOString(),
      }),
      "stale"
    );

    assert.equal(
      mapConnectorStatus({
        status: "active",
        last_seen_at: new Date(now - 2 * 60 * 60_000).toISOString(),
      }),
      "offline"
    );
  });

  it("maps pending and revoked states", () => {
    assert.equal(
      mapConnectorStatus({ status: "pending", last_seen_at: null }),
      "waiting_for_pairing"
    );
    assert.equal(
      mapConnectorStatus({ status: "revoked", last_seen_at: null }),
      "revoked"
    );
  });

  it("builds non-secret code hints", () => {
    assert.equal(connectorCodeHint("ABCD-1234"), "••1234");
  });
});
