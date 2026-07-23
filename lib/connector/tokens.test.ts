import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import { describe, it } from "node:test";

function hashConnectorToken(token: string): string {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

describe("connector token hashing contract", () => {
  it("uses sha256 hex without pairing pepper", () => {
    const token = "example-connector-token-value";
    const hash = hashConnectorToken(token);

    assert.match(hash, /^[a-f0-9]{64}$/);
    assert.notEqual(
      hash,
      createHash("sha256")
        .update(`pepper:${token}`)
        .digest("hex")
    );
  });

  it("matches confirm and heartbeat hash inputs", () => {
    const token = randomBytes(32).toString(
      "base64url"
    );
    const storedHash = hashConnectorToken(token);

    assert.equal(
      hashConnectorToken(token),
      storedHash
    );
    assert.notEqual(
      hashConnectorToken(`${token} `),
      storedHash
    );
  });
});
