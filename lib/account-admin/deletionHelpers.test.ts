import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  AUTH_USER_REFERENCE_TARGETS,
  ACCOUNT_DELETION_FINAL_STEPS,
  buildDeletionStepLogPayload,
  buildFailedDeletionJobMessage,
  formatDeletionStepLabel,
  HOUSEHOLD_SCOPED_TABLE_ORDER,
  devicesMustFollowDependents,
  resolveDeletionFailure,
  resolveRetryStartingStep,
  sanitizeDeletionErrorMessage,
  shouldDeleteProfileBeforeAuthUser,
} from "@/lib/account-admin/deletionHelpers";

describe("account deletion helpers", () => {
  it("requires profile removal before auth user deletion", () => {
    assert.equal(shouldDeleteProfileBeforeAuthUser(), true);
    assert.deepEqual(ACCOUNT_DELETION_FINAL_STEPS, [
      "delete_profile",
      "delete_auth_user",
    ]);
  });

  it("preserves failed step labels for admin messaging", () => {
    assert.equal(
      formatDeletionStepLabel("delete_auth_user"),
      "Authentication account removal"
    );
    assert.equal(
      buildFailedDeletionJobMessage("delete_auth_user"),
      "Deletion could not be completed during authentication account removal."
    );
  });

  it("does not overwrite failed steps with a generic failed label", () => {
    assert.equal(
      formatDeletionStepLabel("delete_auth_user"),
      "Authentication account removal"
    );
    assert.notEqual(
      formatDeletionStepLabel("delete_auth_user"),
      "Failed"
    );
    assert.match(
      buildFailedDeletionJobMessage("delete_auth_user"),
      /authentication account removal/i
    );
  });

  it("maps foreign-key failures to auth reference cleanup errors", () => {
    const failure = resolveDeletionFailure(
      new Error(
        "Database error deleting user: foreign key constraint violates"
      ),
      "delete_auth_user"
    );

    assert.equal(failure.safeErrorCode, "AUTH_REFERENCES_REMAIN");
    assert.match(
      failure.safeErrorMessage,
      /safely retry/i
    );
  });

  it("sanitizes sensitive content from logged messages", () => {
    const sanitized = sanitizeDeletionErrorMessage(
      "Failed for owner@example.com with token eyJhbGciOiJIUzI1NiIs.abc.def"
    );

    assert.doesNotMatch(sanitized, /owner@example.com/);
    assert.doesNotMatch(sanitized, /eyJ/);
    assert.match(sanitized, /\[redacted\]/);
  });

  it("resets failed jobs to queued on retry", () => {
    assert.equal(resolveRetryStartingStep("failed", "delete_auth_user"), "queued");
    assert.equal(
      resolveRetryStartingStep("processing", "cleanup_storage"),
      "cleanup_storage"
    );
  });

  it("includes discovery recognition and admin job auth references", () => {
    const targets = AUTH_USER_REFERENCE_TARGETS.map(
      (target) => `${target.table}.${target.column}:${target.strategy}`
    );

    assert.ok(
      targets.includes(
        "discovered_devices.recognition_reviewed_by:null"
      )
    );
    assert.ok(
      targets.includes(
        "admin_account_deletion_jobs.requested_by:reassign"
      )
    );
    assert.ok(
      targets.includes(
        "platform_founding_members.enrolled_by:reassign"
      )
    );
  });

  it("builds structured logs without user content fields", () => {
    const payload = buildDeletionStepLogPayload({
      event: "job_failed",
      jobId: "job-123",
      currentStep: "delete_profile",
      databaseErrorCode: "23503",
      message: "user@example.com referenced by profile",
    });

    assert.equal(payload.jobId, "job-123");
    assert.equal(payload.currentStep, "delete_profile");
    assert.equal(payload.databaseErrorCode, "23503");
    assert.doesNotMatch(payload.message ?? "", /user@example.com/);
    assert.notEqual(Object.prototype.hasOwnProperty.call(payload, "email"), true);
    assert.notEqual(Object.prototype.hasOwnProperty.call(payload, "targetUserId"), true);
  });

  it("never manually deletes household membership rows", () => {
    assert.equal(
      HOUSEHOLD_SCOPED_TABLE_ORDER.includes(
        "household_members" as never
      ),
      false
    );
  });

  it("orders household cleanup before device deletion", () => {
    const order = [
      ...HOUSEHOLD_SCOPED_TABLE_ORDER,
      "devices",
    ];

    assert.equal(devicesMustFollowDependents(order), true);
    assert.ok(
      order.indexOf("device_documents") <
        order.indexOf("devices")
    );
    assert.ok(
      order.indexOf("device_identity_confirmations") <
        order.indexOf("devices")
    );
  });

  it("maps household cleanup failures to a dedicated error code", () => {
    const failure = resolveDeletionFailure(
      new Error(
        "Household cleanup failed while removing devices."
      ),
      "delete_household_data"
    );

    assert.equal(
      failure.safeErrorCode,
      "HOUSEHOLD_DATA_DELETE_FAILED"
    );
  });
});
