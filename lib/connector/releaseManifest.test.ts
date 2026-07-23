import assert from "node:assert/strict";
import test from "node:test";

import { buildConnectorReleaseManifest } from "./releaseManifest";

test("release manifest includes private testing label", () => {
  const manifest = buildConnectorReleaseManifest();

  assert.equal(manifest.privateTestingOnly, true);
  assert.equal(typeof manifest.version, "string");
  assert.ok(Array.isArray(manifest.assets));
});
