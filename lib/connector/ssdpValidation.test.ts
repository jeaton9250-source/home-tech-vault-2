import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  extractSsdpDescriptionUrl,
  isMalformedSsdpPayload,
  parseSsdpHeaders,
  redirectTargetIsPrivate,
  validateSsdpDescriptionUrl,
} from "./ssdpValidation";

describe("validateSsdpDescriptionUrl", () => {
  it("accepts private description URLs", () => {
    const validated = validateSsdpDescriptionUrl(
      "http://192.168.1.20/description.xml"
    );

    assert.equal(validated.host, "192.168.1.20");
  });

  it("rejects public description URLs", () => {
    assert.throws(
      () =>
        validateSsdpDescriptionUrl(
          "http://8.8.8.8/description.xml"
        ),
      /private local address/i
    );
  });

  it("rejects malformed description URLs", () => {
    assert.throws(
      () => validateSsdpDescriptionUrl("not-a-url"),
      /malformed/i
    );
  });
});

describe("SSDP payload safety", () => {
  it("rejects malformed SSDP data", () => {
    assert.equal(isMalformedSsdpPayload(""), true);
    assert.equal(
      isMalformedSsdpPayload("random garbage"),
      true
    );
    assert.equal(
      isMalformedSsdpPayload(
        "NOTIFY * HTTP/1.1\r\nLOCATION: http://192.168.1.20/d.xml\r\n"
      ),
      false
    );
  });

  it("sanitizes SSDP headers and ignores public locations", () => {
    const headers = parseSsdpHeaders(
      "HTTP/1.1 200 OK\r\nLOCATION: http://203.0.113.10/d.xml\r\nST: MediaRenderer\r\n"
    );

    assert.equal(headers.ST, "MediaRenderer");
    assert.equal(extractSsdpDescriptionUrl(headers), null);
    assert.equal(
      redirectTargetIsPrivate("http://192.168.1.20/d.xml"),
      true
    );
    assert.equal(
      redirectTargetIsPrivate("http://203.0.113.10/d.xml"),
      false
    );
  });
});
