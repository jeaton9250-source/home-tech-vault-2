export type AuthUserReferenceTarget = {
  table: string;
  column: string;
  strategy: "reassign" | "null";
};

/**
 * Non-cascade auth.users foreign keys cleared before auth.admin.deleteUser.
 * Verified against supabase/migrations (20260721210000 through 20260724235900).
 */
export const AUTH_USER_REFERENCE_TARGETS: AuthUserReferenceTarget[] =
  [
    {
      table: "connector_installations",
      column: "created_by_user_id",
      strategy: "reassign",
    },
    {
      table: "connector_pairing_sessions",
      column: "created_by_user_id",
      strategy: "reassign",
    },
    {
      table: "discovered_devices",
      column: "match_confirmed_by",
      strategy: "null",
    },
    {
      table: "discovered_devices",
      column: "recognition_reviewed_by",
      strategy: "null",
    },
    {
      table: "device_identity_confirmations",
      column: "confirmed_by",
      strategy: "null",
    },
    {
      table: "support_tickets",
      column: "assigned_to",
      strategy: "null",
    },
    {
      table: "platform_founding_members",
      column: "enrolled_by",
      strategy: "reassign",
    },
    {
      table: "platform_founding_members",
      column: "removed_by",
      strategy: "null",
    },
    {
      table: "admin_account_deletion_jobs",
      column: "requested_by",
      strategy: "reassign",
    },
    {
      table: "admin_account_deletion_jobs",
      column: "processor_actor_id",
      strategy: "null",
    },
    {
      table: "admin_account_deletion_jobs",
      column: "canceled_by",
      strategy: "null",
    },
    {
      table: "profiles",
      column: "deactivated_by",
      strategy: "null",
    },
    {
      table: "profiles",
      column: "reactivated_by",
      strategy: "null",
    },
    {
      table: "platform_plan_grants",
      column: "revoked_by",
      strategy: "null",
    },
    {
      table: "platform_program_settings",
      column: "updated_by",
      strategy: "null",
    },
    {
      table: "platform_email_deliveries",
      column: "created_by",
      strategy: "null",
    },
  ];

/** Final irreversible steps — profile must precede auth (profiles.id → auth.users). */
export const ACCOUNT_DELETION_FINAL_STEPS = [
  "delete_profile",
  "delete_auth_user",
] as const;

export type AccountDeletionFinalStep =
  (typeof ACCOUNT_DELETION_FINAL_STEPS)[number];

export function shouldDeleteProfileBeforeAuthUser(): boolean {
  return (
    ACCOUNT_DELETION_FINAL_STEPS.indexOf(
      "delete_profile"
    ) <
    ACCOUNT_DELETION_FINAL_STEPS.indexOf(
      "delete_auth_user"
    )
  );
}

export function resolveRetryStartingStep(
  status: string,
  currentStep: string | null | undefined
): string {
  if (status === "failed") {
    return "queued";
  }

  return currentStep?.trim() || "queued";
}

const DELETION_STEP_LABELS: Record<string, string> = {
  queued: "Queued",
  validate: "Validation",
  transfer_household: "Household ownership transfer",
  delete_household_data: "Household data removal",
  cleanup_storage: "Storage cleanup",
  delete_application_data: "Application data cleanup",
  detach_auth_references: "Authentication reference cleanup",
  delete_profile: "Profile removal",
  delete_auth_user: "Authentication account removal",
  completed: "Completed",
  blocked: "Blocked",
  canceled: "Canceled",
};

export function formatDeletionStepLabel(
  step: string | null | undefined
): string | null {
  if (!step?.trim()) {
    return null;
  }

  const normalized = step.trim();

  if (normalized === "failed") {
    return "Failed";
  }

  return (
    DELETION_STEP_LABELS[normalized] ??
    normalized.replaceAll("_", " ")
  );
}

export function sanitizeDeletionErrorMessage(
  message: string
): string {
  return message
    .replace(
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
      "[redacted]"
    )
    .replace(
      /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
      "[redacted]"
    )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 280);
}

export function resolveDeletionFailure(
  error: unknown,
  failedStep: string | null | undefined
): {
  safeErrorCode: string;
  safeErrorMessage: string;
  databaseErrorCode: string | null;
  sanitizedMessage: string | null;
} {
  const rawMessage =
    error instanceof Error
      ? error.message
      : "Deletion failed.";
  const databaseErrorCode =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code ===
      "string"
      ? (error as { code: string }).code
      : null;
  const sanitizedMessage =
    sanitizeDeletionErrorMessage(rawMessage);

  if (failedStep === "delete_household_data") {
    return {
      safeErrorCode: "HOUSEHOLD_DATA_DELETE_FAILED",
      safeErrorMessage:
        "Household data could not be fully removed. You can safely retry this job.",
      databaseErrorCode,
      sanitizedMessage,
    };
  }

  if (
    /Household cleanup failed while removing/i.test(
      rawMessage
    )
  ) {
    return {
      safeErrorCode: "HOUSEHOLD_DATA_DELETE_FAILED",
      safeErrorMessage:
        "Household data could not be fully removed. You can safely retry this job.",
      databaseErrorCode,
      sanitizedMessage,
    };
  }

  if (
    /foreign key|violates|still referenced|database error deleting user/i.test(
      rawMessage
    )
  ) {
    return {
      safeErrorCode: "AUTH_REFERENCES_REMAIN",
      safeErrorMessage:
        "Unable to remove the authentication account because related records still reference this user. You can safely retry this job.",
      databaseErrorCode,
      sanitizedMessage,
    };
  }

  if (
    databaseErrorCode?.startsWith("PGRST") ||
    databaseErrorCode?.match(/^[0-9]{2}[A-Z0-9]{3}$/)
  ) {
    if (/storage|bucket/i.test(rawMessage)) {
      return {
        safeErrorCode: "STORAGE_CLEANUP_FAILED",
        safeErrorMessage:
          "Storage cleanup did not complete. You can safely retry this job.",
        databaseErrorCode,
        sanitizedMessage,
      };
    }
  }

  if (/storage|bucket/i.test(rawMessage)) {
    return {
      safeErrorCode: "STORAGE_CLEANUP_FAILED",
      safeErrorMessage:
        "Storage cleanup did not complete. You can safely retry this job.",
      databaseErrorCode,
      sanitizedMessage,
    };
  }

  if (failedStep === "delete_profile") {
    return {
      safeErrorCode: "PROFILE_DELETE_FAILED",
      safeErrorMessage:
        "The profile record could not be removed. You can safely retry this job.",
      databaseErrorCode,
      sanitizedMessage,
    };
  }

  if (failedStep === "delete_auth_user") {
    return {
      safeErrorCode: "AUTH_DELETE_FAILED",
      safeErrorMessage:
        "The authentication account could not be removed. You can safely retry this job.",
      databaseErrorCode,
      sanitizedMessage,
    };
  }

  if (rawMessage === "TARGET_NOT_FOUND") {
    return {
      safeErrorCode: "TARGET_NOT_FOUND",
      safeErrorMessage:
        "The account no longer exists in Home Tech Vault.",
      databaseErrorCode,
      sanitizedMessage,
    };
  }

  if (
    rawMessage.includes(
      "still owns a household with other members"
    )
  ) {
    return {
      safeErrorCode: "HOUSEHOLD_OWNERSHIP_REQUIRED",
      safeErrorMessage:
        "Transfer household ownership or delete household data before removing this account.",
      databaseErrorCode,
      sanitizedMessage,
    };
  }

  return {
    safeErrorCode: databaseErrorCode
      ? `DB_${databaseErrorCode}`
      : "PROCESSING_FAILED",
    safeErrorMessage:
      "Deletion could not be completed. You can safely retry this job.",
    databaseErrorCode,
    sanitizedMessage,
  };
}

/** Tables removed by household_id before devices are deleted. */
export const HOUSEHOLD_SCOPED_TABLE_ORDER = [
  "device_monitor_events",
  "discovered_devices",
  "connector_pairing_sessions",
  "connector_installations",
  "device_documents",
  "device_images",
  "maintenance_tasks",
  "device_identity_confirmations",
  "documents",
  "network_info",
  "subscriptions",
  "household_members",
  "household_invitations",
] as const;

export type HouseholdScopedTable =
  (typeof HOUSEHOLD_SCOPED_TABLE_ORDER)[number];

/**
 * device_events is scoped through devices.id, not household_id.
 * devices must be deleted only after device dependents are removed.
 */
export const HOUSEHOLD_DEVICE_DEPENDENT_TABLES = [
  "device_documents",
  "device_images",
  "maintenance_tasks",
  "device_identity_confirmations",
  "documents",
] as const;

export function devicesMustFollowDependents(
  tables: readonly string[]
): boolean {
  const devicesIndex = tables.indexOf("devices");
  if (devicesIndex === -1) {
    return true;
  }

  return HOUSEHOLD_DEVICE_DEPENDENT_TABLES.every(
    (table) => tables.indexOf(table) < devicesIndex
  );
}

export function buildFailedDeletionJobMessage(
  failedStep: string | null | undefined
): string {
  const stepLabel = formatDeletionStepLabel(failedStep);

  if (stepLabel && failedStep !== "failed") {
    return `Deletion could not be completed during ${stepLabel.toLowerCase()}.`;
  }

  return "Deletion could not be completed.";
}

export type DeletionStepLogEvent =
  | "step_started"
  | "step_failed"
  | "job_failed";

export function buildDeletionStepLogPayload(options: {
  event: DeletionStepLogEvent;
  jobId: string;
  currentStep: string | null | undefined;
  databaseErrorCode?: string | null;
  message?: string | null;
}) {
  return {
    event: options.event,
    jobId: options.jobId,
    currentStep: options.currentStep ?? null,
    databaseErrorCode: options.databaseErrorCode ?? null,
    message: options.message
      ? sanitizeDeletionErrorMessage(options.message)
      : null,
  };
}
