import assert from "node:assert/strict";
import test from "node:test";

import { getConnectorDownloadOptions } from "./downloadOptions";

test("download options expose macOS and Windows entries", () => {
  const options = getConnectorDownloadOptions();

  assert.equal(options.macos.label, "macOS");
  assert.equal(options.windows.label, "Windows");
  assert.ok(
    options.windows.unavailableMessage?.includes("coming soon")
  );
});
