import assert from "node:assert/strict";
import test from "node:test";

import {
  buildConnectorDownloadOptions,
  formatConnectorVersionLabel,
} from "./downloadOptions";

test("download options expose macOS and Windows entries", () => {
  const options = buildConnectorDownloadOptions();

  assert.equal(options.macos.label, "macOS");
  assert.equal(options.windows.label, "Windows");
  assert.equal(
    options.macos.versionLabel,
    formatConnectorVersionLabel("macOS", options.macos.version)
  );
  assert.ok(
    options.windows.unavailableMessage?.includes("coming soon")
  );
});

test("macOS download option reflects env URL when configured", () => {
  const previousValue = process.env.NEXT_PUBLIC_CONNECTOR_MACOS_DOWNLOAD_URL;

  process.env.NEXT_PUBLIC_CONNECTOR_MACOS_DOWNLOAD_URL =
    "https://cdn.example.com/Home-Tech-Vault-Connector.dmg";

  const options = buildConnectorDownloadOptions();

  assert.equal(options.macos.available, true);
  assert.equal(
    options.macos.downloadUrl,
    "https://cdn.example.com/Home-Tech-Vault-Connector.dmg"
  );
  assert.equal(
    options.macos.versionLabel,
    "Home Tech Vault Connector 0.1.0 for macOS"
  );

  if (previousValue !== undefined) {
    process.env.NEXT_PUBLIC_CONNECTOR_MACOS_DOWNLOAD_URL = previousValue;
  } else {
    delete process.env.NEXT_PUBLIC_CONNECTOR_MACOS_DOWNLOAD_URL;
  }
});
