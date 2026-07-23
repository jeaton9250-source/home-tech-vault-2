import assert from "node:assert/strict";
import test from "node:test";

import {
  resolvePublicConnectorDownloadUrl,
  getConnectorMacosDownloadUrl,
} from "./release";

test("resolvePublicConnectorDownloadUrl trims whitespace", () => {
  assert.equal(
    resolvePublicConnectorDownloadUrl(
      "  https://cdn.example.com/connector.dmg  ",
      { requireHttps: true, allowLocalhost: true }
    ),
    "https://cdn.example.com/connector.dmg"
  );
});

test("resolvePublicConnectorDownloadUrl rejects malformed URLs", () => {
  assert.equal(resolvePublicConnectorDownloadUrl("not-a-url"), null);
  assert.equal(resolvePublicConnectorDownloadUrl("ftp://example.com/a.dmg"), null);
});

test("resolvePublicConnectorDownloadUrl requires HTTPS in production", () => {
  assert.equal(
    resolvePublicConnectorDownloadUrl("http://cdn.example.com/connector.dmg", {
      requireHttps: true,
      allowLocalhost: true,
    }),
    null
  );
  assert.equal(
    resolvePublicConnectorDownloadUrl("https://cdn.example.com/connector.dmg", {
      requireHttps: true,
      allowLocalhost: true,
    }),
    "https://cdn.example.com/connector.dmg"
  );
});

test("resolvePublicConnectorDownloadUrl rejects localhost in production", () => {
  assert.equal(
    resolvePublicConnectorDownloadUrl("https://localhost/connector.dmg", {
      requireHttps: true,
      allowLocalhost: false,
    }),
    null
  );
  assert.equal(
    resolvePublicConnectorDownloadUrl("https://127.0.0.1/connector.dmg", {
      requireHttps: true,
      allowLocalhost: false,
    }),
    null
  );
});

test("getConnectorMacosDownloadUrl returns null when env is unset", () => {
  const previousValue = process.env.NEXT_PUBLIC_CONNECTOR_MACOS_DOWNLOAD_URL;

  delete process.env.NEXT_PUBLIC_CONNECTOR_MACOS_DOWNLOAD_URL;
  assert.equal(getConnectorMacosDownloadUrl(), null);

  if (previousValue !== undefined) {
    process.env.NEXT_PUBLIC_CONNECTOR_MACOS_DOWNLOAD_URL = previousValue;
  }
});
