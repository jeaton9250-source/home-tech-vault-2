import { describe, expect, it } from "vitest";

import {
  credentialStoreLabel,
  defaultConnectorDeviceLabel,
  detectConnectorOsPlatform,
} from "./platform";

describe("platform helpers", () => {
  it("returns platform-specific defaults", () => {
    expect(defaultConnectorDeviceLabel("macos")).toBe("My Mac");
    expect(defaultConnectorDeviceLabel("windows")).toBe("My PC");
    expect(credentialStoreLabel("windows")).toContain("Credential Manager");
    expect(credentialStoreLabel("macos")).toBe("Keychain");
  });

  it("detects a platform enum", () => {
    expect(["macos", "windows", "other"]).toContain(
      detectConnectorOsPlatform()
    );
  });
});
