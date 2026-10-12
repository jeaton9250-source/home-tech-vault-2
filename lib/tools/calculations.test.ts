import test from "node:test";
import assert from "node:assert/strict";
import { ageInYears, depreciatedValue, addMonths } from "./calculations";
import { isPublicMarketingPath } from "../marketing/routes";
test("age rejects future and missing dates and accepts a new purchase", () => {
  assert.equal(ageInYears("2027-01-01", "2026-10-12"), null);
  assert.equal(ageInYears("", "2026-10-12"), null);
  assert.equal(ageInYears("2026-10-12", "2026-10-12"), 0);
});
test("depreciation compounds and applies condition without inventing a minimum value", () => {
  assert.equal(depreciatedValue(1000, 20, 2, .85), 544.0000000000001);
  assert.equal(depreciatedValue(1000, 100, 1, 1), 0);
  assert.equal(depreciatedValue(1000, 0, 3, 1), 1000);
  assert.equal(depreciatedValue(-1, 20, 2, 1), null);
  assert.equal(depreciatedValue(1000, 101, 2, 1), null);
});
test("maintenance due dates clamp month ends and preserve leap years", () => {
  assert.equal(addMonths("2026-01-31", 1), "2026-02-28");
  assert.equal(addMonths("2024-01-31", 1), "2024-02-29");
  assert.equal(addMonths("2024-02-29", 12), "2025-02-28");
});
test("tool pages bypass the signed-in app shell", () => {
  for (const path of ["/tools", "/tools/home-maintenance-planner", "/tools/appliance-lifespan-calculator", "/tools/electronics-depreciation-calculator"]) assert.equal(isPublicMarketingPath(path), true);
  assert.equal(isPublicMarketingPath("/tools-private"), false);
});
