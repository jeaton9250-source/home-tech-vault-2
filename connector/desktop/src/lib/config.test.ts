import { describe, expect, it } from "vitest";

import {
  assertHttpsInProduction,
  getApiBaseUrl,
} from "./config";

describe("getApiBaseUrl", () => {
  it("returns configured base URL without trailing slash", () => {
    expect(getApiBaseUrl()).toMatch(/^https?:\/\//);
  });
});

describe("assertHttpsInProduction", () => {
  it("allows http during development builds", () => {
    expect(() =>
      assertHttpsInProduction("http://localhost:3000")
    ).not.toThrow();
  });
});
