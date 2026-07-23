import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isPrivateIpAddress } from "./privateNetwork";

describe("isPrivateIpAddress", () => {
  it("accepts RFC1918 addresses", () => {
    assert.equal(
      isPrivateIpAddress("192.168.1.20"),
      true
    );
    assert.equal(
      isPrivateIpAddress("10.0.0.5"),
      true
    );
    assert.equal(
      isPrivateIpAddress("172.16.4.2"),
      true
    );
  });

  it("rejects public addresses", () => {
    assert.equal(
      isPrivateIpAddress("8.8.8.8"),
      false
    );
    assert.equal(
      isPrivateIpAddress("142.250.80.46"),
      false
    );
  });
});
