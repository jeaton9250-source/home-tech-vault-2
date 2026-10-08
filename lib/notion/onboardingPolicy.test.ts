import test from "node:test";
import assert from "node:assert/strict";
import { deriveOnboardingStatus, eligibleOnboardingAccount, emailStateFromHistory } from "./onboardingPolicy";

test("all core signals reach Complete; maintenance alone reaches Activated", () => {
  assert.equal(deriveOnboardingStatus({ device: true, paperwork: true, maintenance: true, needsHelp: false }), "Complete");
  assert.equal(deriveOnboardingStatus({ device: false, paperwork: false, maintenance: true, needsHelp: false }), "Activated");
});
test("support resolution returns to product status", () => {
  const signals = { device: true, paperwork: true, maintenance: true, needsHelp: true };
  assert.equal(deriveOnboardingStatus(signals), "Needs Attention");
  assert.equal(deriveOnboardingStatus({ ...signals, needsHelp: false }), "Complete");
});
test("signup boundary, realtor exclusions, claimed gifts, and inactive accounts", () => {
  const user = { createdAt: "2026-10-01T00:00:00Z", email: "customer@example.com", realtor: false, giftRecipient: false, inactive: false, deletionRequested: false };
  assert.equal(eligibleOnboardingAccount(user), true);
  assert.equal(eligibleOnboardingAccount({ ...user, createdAt: "2026-09-19T00:00:00Z" }), false);
  assert.equal(eligibleOnboardingAccount({ ...user, realtor: true }), false);
  assert.equal(eligibleOnboardingAccount({ ...user, realtor: true, giftRecipient: true }), true);
  for (const patch of [{ inactive: true }, { deletionRequested: true }, { email: null }, { bannedUntil: "2099-01-01T00:00:00Z" }]) {
    assert.equal(eligibleOnboardingAccount({ ...user, ...patch }), false);
  }
});
test("old activation delivery prevents duplicate completion and any prior reminder prevents further reminders", () => {
  const state = emailStateFromHistory(new Set(["welcome", "milestone_activated", "no_device_24h"]));
  assert.equal(state["Welcome Sent"], true);
  assert.equal(state["Activation Sent"], true);
  assert.equal(state["Completion Sent"], true);
  assert.equal(state["Reminder Sent"], true);
  assert.equal(emailStateFromHistory(new Set(["onboarding_reminder"]))["Reminder Sent"], true);
});
