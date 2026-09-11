import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { normalizeObservation } from "./normalizeObservation";
import { scoreCandidates } from "./scoreCandidates";

describe("conflict-aware candidate scoring", () => {
  it("penalizes Google candidate when device reports Samsung", () => {
    const observation = normalizeObservation({
      manufacturer: "Samsung",
      hostname: "living-room-chromecast",
      mdnsServices: [
        "_googlecast._tcp.local",
      ],
      ipAddress: "192.168.1.82",
    });

    const candidates =
      scoreCandidates(observation);

    const googleCandidate =
      candidates.find(
        (candidate) =>
          candidate.manufacturer === "Google"
      );

    assert.ok(
      googleCandidate,
      "Expected a Google candidate"
    );

    assert.ok(
      googleCandidate.conflictingEvidence.some(
        (item) =>
          item.type === "upnp_manufacturer"
      ),
      "Expected manufacturer conflict"
    );

    assert.ok(
      googleCandidate.score < 55,
      `Expected conflicted Google score below medium threshold, got ${googleCandidate.score}`
    );

    assert.ok(
      ["unknown", "low"].includes(
        googleCandidate.confidence
      ),
      `Unexpected confidence: ${googleCandidate.confidence}`
    );
  });

  it("allows agreeing Google signals to score higher", () => {
    const agreeing =
      scoreCandidates(
        normalizeObservation({
          manufacturer: "Google",
          hostname: "living-room-chromecast",
          mdnsServices: [
            "_googlecast._tcp.local",
          ],
          ipAddress: "192.168.1.83",
        })
      ).find(
        (candidate) =>
          candidate.manufacturer === "Google"
      );

    const conflicting =
      scoreCandidates(
        normalizeObservation({
          manufacturer: "Samsung",
          hostname: "living-room-chromecast",
          mdnsServices: [
            "_googlecast._tcp.local",
          ],
          ipAddress: "192.168.1.84",
        })
      ).find(
        (candidate) =>
          candidate.manufacturer === "Google"
      );

    assert.ok(agreeing);
    assert.ok(conflicting);

    assert.ok(
      agreeing.score > conflicting.score,
      `Expected agreeing score ${agreeing.score} to exceed conflicting score ${conflicting.score}`
    );

    assert.equal(
      agreeing.conflictingEvidence.length,
      0
    );

    assert.ok(
      conflicting.conflictingEvidence.length >
        0
    );
  });
});
