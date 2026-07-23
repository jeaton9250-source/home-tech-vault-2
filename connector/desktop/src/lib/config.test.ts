import { describe, expect, it } from "vitest";

import {
  DEVELOPMENT_API_BASE_URL,
  PRODUCTION_API_BASE_URL,
  resolveApiBaseUrl,
  validateAndNormalizeApiBaseUrl,
} from "./config";

describe("validateAndNormalizeApiBaseUrl", () => {
  it("accepts development localhost HTTP URLs", () => {
    expect(
      validateAndNormalizeApiBaseUrl(
        "http://localhost:3003/",
        false
      )
    ).toBe("http://localhost:3003");
  });

  it("accepts production HTTPS URLs", () => {
    expect(
      validateAndNormalizeApiBaseUrl(
        "https://hometechvault.com/",
        true
      )
    ).toBe("https://hometechvault.com");
  });

  it("rejects production HTTP URLs", () => {
    expect(() =>
      validateAndNormalizeApiBaseUrl(
        "http://localhost:3003",
        true
      )
    ).toThrow(
      "Production builds must use HTTPS for the API base URL."
    );
  });

  it("rejects malformed URLs", () => {
    expect(() =>
      validateAndNormalizeApiBaseUrl(
        "not-a-url",
        false
      )
    ).toThrow('Invalid API base URL: "not-a-url".');
  });

  it("rejects URLs with paths", () => {
    expect(() =>
      validateAndNormalizeApiBaseUrl(
        "http://localhost:3003/api",
        false
      )
    ).toThrow(
      "API base URL must not include a path."
    );
  });
});

describe("resolveApiBaseUrl", () => {
  it("uses the development default when unset", () => {
    expect(
      resolveApiBaseUrl({
        isProduction: false,
      })
    ).toBe(DEVELOPMENT_API_BASE_URL);
  });

  it("uses the production default when unset", () => {
    expect(
      resolveApiBaseUrl({
        isProduction: true,
      })
    ).toBe(PRODUCTION_API_BASE_URL);
  });

  it("accepts configured development HTTP URLs", () => {
    expect(
      resolveApiBaseUrl({
        isProduction: false,
        configured: "http://127.0.0.1:3000/",
      })
    ).toBe("http://127.0.0.1:3000");
  });

  it("accepts configured production HTTPS URLs", () => {
    expect(
      resolveApiBaseUrl({
        isProduction: true,
        configured:
          "https://hometechvault.com/",
      })
    ).toBe("https://hometechvault.com");
  });

  it("rejects configured production HTTP URLs", () => {
    expect(() =>
      resolveApiBaseUrl({
        isProduction: true,
        configured: "http://localhost:3003",
      })
    ).toThrow(
      "Production builds must use HTTPS for the API base URL."
    );
  });

  it("normalizes trailing slashes", () => {
    expect(
      resolveApiBaseUrl({
        isProduction: false,
        configured:
          "http://localhost:3003///",
      })
    ).toBe("http://localhost:3003");
  });
});
