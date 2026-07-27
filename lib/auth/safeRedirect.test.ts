import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isSafeInternalPath,
  resolveSafeAuthRedirect,
} from "@/lib/auth/safeRedirect";

describe("safe auth redirect helpers", () => {
  it("accepts internal next paths", () => {
    assert.equal(isSafeInternalPath("/dashboard"), true);
    assert.equal(
      isSafeInternalPath("/devices/abc"),
      true
    );
  });

  it("rejects external and unsafe paths", () => {
    assert.equal(
      isSafeInternalPath("https://evil.com"),
      false
    );
    assert.equal(
      isSafeInternalPath("//evil.com"),
      false
    );
    assert.equal(
      isSafeInternalPath("/\\evil.com"),
      false
    );
    assert.equal(
      isSafeInternalPath("dashboard"),
      false
    );
  });

  it("prefers next over redirect", () => {
    const params = new URLSearchParams(
      "next=/dashboard&redirect=/devices"
    );

    assert.equal(
      resolveSafeAuthRedirect(params),
      "/dashboard"
    );
  });

  it("falls back to redirect when next is missing", () => {
    const params = new URLSearchParams(
      "redirect=/network"
    );

    assert.equal(
      resolveSafeAuthRedirect(params),
      "/network"
    );
  });

  it("rejects unsafe next and uses fallback", () => {
    const params = new URLSearchParams(
      "next=https://evil.example"
    );

    assert.equal(
      resolveSafeAuthRedirect(params, "/dashboard"),
      "/dashboard"
    );
  });
});
