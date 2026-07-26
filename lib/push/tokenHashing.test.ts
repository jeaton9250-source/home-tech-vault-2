import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { hashPushToken, normalizeApnsToken, redactPushToken } from "./tokenHashing";

describe("push token hashing", () => {
  it("normalizes APNs tokens before hashing", () => {
    const formatted = "<AA BB CC DD>";
    const compact = "aabbccdd";

    assert.equal(normalizeApnsToken(formatted), compact);
    assert.equal(hashPushToken(formatted), hashPushToken(compact));
  });

  it("redacts tokens for logs", () => {
    assert.equal(redactPushToken("abcdef1234567890"), "abcd…7890");
  });
});
