import test from "node:test";
import assert from "node:assert/strict";

import {
  isSemanticVersion,
  parseHeartbeatPayload,
  HeartbeatValidationError,
} from "./heartbeatValidation";

import {
  checkConnectorHeartbeatRateLimit,
  resetConnectorHeartbeatRateLimitForTests,
} from "./heartbeatRateLimit";

test("parseHeartbeatPayload accepts valid macOS payload", () => {
  const payload = parseHeartbeatPayload({
    appVersion: "0.1.0",
    platform: "macos",
    deviceName: "Jason's MacBook",
  });

  assert.equal(payload.appVersion, "0.1.0");
  assert.equal(payload.platform, "macos");
  assert.equal(payload.deviceName, "Jason's MacBook");
});

test("parseHeartbeatPayload accepts valid Windows payload", () => {
  const payload = parseHeartbeatPayload({
    appVersion: "0.1.0",
    platform: "windows",
    deviceName: "Office PC",
  });

  assert.equal(payload.platform, "windows");
});

test("parseHeartbeatPayload rejects unsupported platform", () => {
  assert.throws(
    () =>
      parseHeartbeatPayload({
        appVersion: "0.1.0",
        platform: "linux",
        deviceName: "Server",
      }),
    HeartbeatValidationError
  );
});

test("parseHeartbeatPayload rejects invalid semver", () => {
  assert.throws(
    () =>
      parseHeartbeatPayload({
        appVersion: "beta",
        platform: "macos",
        deviceName: "Mac",
      }),
    HeartbeatValidationError
  );
});

test("isSemanticVersion accepts prerelease versions", () => {
  assert.equal(
    isSemanticVersion("1.2.3-beta.1"),
    true
  );
});

test("heartbeat rate limit blocks rapid repeats", () => {
  resetConnectorHeartbeatRateLimitForTests();

  const connectorId =
    "11111111-1111-1111-1111-111111111111";

  assert.equal(
    checkConnectorHeartbeatRateLimit(
      connectorId
    ),
    true
  );
  assert.equal(
    checkConnectorHeartbeatRateLimit(
      connectorId
    ),
    false
  );
});
