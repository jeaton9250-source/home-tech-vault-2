import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  checkConnectorUpdate,
  compareConnectorVersions,
} from "./updates";

describe("connector updates", () => {
  it("compares semantic versions", () => {
    assert.ok(compareConnectorVersions("0.1.0", "0.2.0") < 0);
    assert.ok(compareConnectorVersions("0.2.0", "0.1.0") > 0);
    assert.equal(compareConnectorVersions("0.1.0", "0.1.0"), 0);
  });

  it("reports update availability", () => {
    assert.equal(
      checkConnectorUpdate("0.0.9", "0.1.0").status,
      "update_available"
    );
    assert.equal(
      checkConnectorUpdate("0.1.0", "0.1.0").status,
      "current"
    );
    assert.equal(checkConnectorUpdate(null, "0.1.0").status, "unknown");
  });
});
