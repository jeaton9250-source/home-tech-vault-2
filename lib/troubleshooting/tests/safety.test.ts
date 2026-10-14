import { test } from "node:test";
import assert from "node:assert/strict";
import {
  urgentHelp,
  warrantyInfo,
} from "../../../mobile/src/lib/troubleshooting-contract";
import { parseHelp } from "../schema";

test("high-risk reports stop repair advice", () => {
  for (const question of [
    "I smell gas",
    "gas leak",
    "CO alarm is beeping",
    "carbon monoxide detector",
    "There is smoke",
    "A fire in the kitchen",
    "sparking outlet",
    "water near an electrical outlet",
    "exposed wiring",
    "major leak",
    "rotten eggs by furnace",
    "burning smell",
  ]) {
    const result = urgentHelp(question);
    assert.equal(result?.urgency, "emergency", question);
    assert.deepEqual(result?.steps, []);
  }
});
test("routine issues remain available", () => {
  for (const question of [
    "My Wi-Fi drops",
    "Washer shows E24",
    "What maintenance is coming up?",
    "TV will not turn on",
    "My Fire TV will not turn on",
    "Fire Stick keeps buffering",
  ])
    assert.equal(urgentHelp(question), null);
});
test("warranty claims derive from saved dates, not AI guesses", () => {
  const now = new Date("2026-10-14T12:00:00Z");
  assert.equal(warrantyInfo(null, now).state, "unknown");
  assert.equal(warrantyInfo("bad", now).state, "unknown");
  assert.equal(warrantyInfo("2026-02-31", now).state, "unknown");
  assert.equal(warrantyInfo("2027-01-01", now).state, "appears_active");
  assert.equal(warrantyInfo("2026-10-14", now).state, "appears_active");
  assert.equal(warrantyInfo("2026-10-13", now).state, "date_passed");
  assert.match(warrantyInfo("2027-01-01", now).message, /confirm/);
});
test("invalid AI output fails closed", () => {
  assert.throws(() => parseHelp("This is not JSON"));
  assert.throws(() => parseHelp('{"summary":"Take apart the panel"}'));
  assert.throws(() =>
    parseHelp(
      JSON.stringify({
        summary: "test",
        urgency: "routine",
        steps: Array(6).fill("step"),
        nextQuestion: "",
        safety: "",
      }),
    ),
  );
});
test("professional and emergency responses never render repair steps", () => {
  for (const urgency of ["professional", "emergency"]) {
    const result = parseHelp(
      JSON.stringify({
        summary: "Call for help",
        urgency,
        steps: ["Open the panel"],
        nextQuestion: "",
        safety: "Stay safe",
      }),
    );
    assert.deepEqual(result.steps, []);
  }
});
test("unsafe routine output is changed to professional handling", () => {
  const result = parseHelp(
    JSON.stringify({
      summary: "test",
      urgency: "routine",
      steps: ["Bypass the safety switch"],
      nextQuestion: "",
      safety: "",
    }),
  );
  assert.equal(result.urgency, "professional");
  assert.deepEqual(result.steps, []);
});

test("native-compatible timeout aborts requests without AbortSignal.timeout", async () => {
  const { fetchWithTimeout } =
    await import("../../../mobile/src/lib/request-timeout");
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async (_url, init) =>
    new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () =>
        reject(new Error("Aborted")),
      );
    });
  try {
    await assert.rejects(
      fetchWithTimeout("https://example.com", {}, 10),
      /timed out/,
    );
  } finally {
    globalThis.fetch = previousFetch;
  }
});
