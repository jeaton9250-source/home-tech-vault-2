import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  canPairAnotherConnector,
  connectorLimitLabel,
  resolveConnectorLimits,
} from "./access";

describe("connector access", () => {
  it("allows one connector on free", () => {
    assert.equal(
      canPairAnotherConnector({
        plan: "free",
        isPlatformAdmin: false,
        activeConnectorCount: 0,
      }),
      true
    );

    assert.equal(
      canPairAnotherConnector({
        plan: "free",
        isPlatformAdmin: false,
        activeConnectorCount: 1,
      }),
      false
    );
  });

  it("allows up to three connectors on pro", () => {
    assert.equal(
      canPairAnotherConnector({
        plan: "pro",
        isPlatformAdmin: false,
        activeConnectorCount: 2,
      }),
      true
    );

    assert.equal(
      canPairAnotherConnector({
        plan: "pro",
        isPlatformAdmin: false,
        activeConnectorCount: 3,
      }),
      false
    );
  });

  it("enables monitoring only on pro and family", () => {
    assert.equal(
      resolveConnectorLimits("free", false).canUseMonitoring,
      false
    );
    assert.equal(
      resolveConnectorLimits("pro", false).canUseMonitoring,
      true
    );
    assert.equal(
      resolveConnectorLimits("family", false).canUseMonitoring,
      true
    );
  });

  it("describes connector limits by plan", () => {
    assert.match(connectorLimitLabel("free"), /1 paired connector/);
    assert.match(connectorLimitLabel("pro"), /3/);
    assert.match(connectorLimitLabel("family"), /Unlimited/);
  });
});
