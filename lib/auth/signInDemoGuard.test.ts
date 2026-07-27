import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  AUTH_ROUTES_THAT_CLEAR_DEMO,
  isAuthRouteThatClearsDemo,
} from "@/lib/demo/demoModeStorage";
import {
  MARKETING_ROUTES,
  isPublicAuthPath,
} from "@/lib/marketing/routes";

describe("Sign In and auth route demo exclusions", () => {
  it("Sign In target is always /login", () => {
    assert.equal(MARKETING_ROUTES.login, "/login");
    assert.notEqual(MARKETING_ROUTES.login, "/demo");
  });

  it("demo entry remains an explicit /demo route", () => {
    assert.equal(MARKETING_ROUTES.demo, "/demo");
  });

  it("required public auth paths clear demo and stay public", () => {
    for (const route of AUTH_ROUTES_THAT_CLEAR_DEMO) {
      assert.equal(
        isPublicAuthPath(route),
        true,
        `${route} must be a public auth path`
      );
      assert.equal(
        isAuthRouteThatClearsDemo(route),
        true
      );
    }
  });

  it("protected and demo routes do not clear demo by path alone", () => {
    assert.equal(
      isAuthRouteThatClearsDemo("/dashboard"),
      false
    );
    assert.equal(
      isAuthRouteThatClearsDemo("/demo"),
      false
    );
    assert.equal(isPublicAuthPath("/demo"), false);
  });
});
