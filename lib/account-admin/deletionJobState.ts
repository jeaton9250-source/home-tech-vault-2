import "server-only";

import {
  buildFailedDeletionJobMessage,
  formatDeletionStepLabel,
} from "@/lib/account-admin/deletionHelpers";
import type { DeletionJobStatus } from "@/lib/account-admin/types";

export const DELETION_JOB_STALE_THRESHOLD_MS =
  10 * 60 * 1000;

export const DELETION_JOB_LEASE_SECONDS = 300;

export const ACTIVE_DELETION_JOB_STATUSES = [
  "pending",
  "validating",
  "processing",
] as const;

export type ActiveDeletionJobStatus =
  (typeof ACTIVE_DELETION_JOB_STATUSES)[number];

export const IRREVERSIBLE_DELETION_STEPS = new Set([
  "delete_profile",
  "delete_auth_user",
  "completed",
]);

export type DeletionJobRecord = {
  id: string;
  target_user_id: string;
  target_email_snapshot: string;
  requested_by: string;
  reason: string;
  notes: string | null;
  transfer_owner_user_id: string | null;
  delete_household_data: boolean;
  status: DeletionJobStatus | "canceled";
  current_step: string | null;
  safe_error_code: string | null;
  safe_error_message: string | null;
  retry_count: number;
  started_at: string | null;
  completed_at: string | null;
  failed_at: string | null;
  canceled_at: string | null;
  canceled_by: string | null;
  processor_started_at: string | null;
  processor_lease_expires_at: string | null;
  processor_actor_id: string | null;
  last_heartbeat_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DeletionJobView = {
  jobId: string;
  status: DeletionJobRecord["status"];
  currentStep: string | null;
  failedStepLabel: string | null;
  safeErrorCode: string | null;
  safeErrorMessage: string | null;
  canRetry: boolean;
  canCancel: boolean;
  canResume: boolean;
  isStale: boolean;
  isActive: boolean;
  retryCount: number;
  startedAt: string | null;
  updatedAt: string;
  completedAt: string | null;
  failedAt: string | null;
  canceledAt: string | null;
  message: string;
};

export function isActiveDeletionStatus(
  status: string | null | undefined
): status is ActiveDeletionJobStatus {
  return ACTIVE_DELETION_JOB_STATUSES.includes(
    status as ActiveDeletionJobStatus
  );
}

export function isDeletionJobStale(
  job: Pick<
    DeletionJobRecord,
    | "status"
    | "updated_at"
    | "processor_lease_expires_at"
    | "last_heartbeat_at"
  >,
  now = Date.now()
) {
  if (!isActiveDeletionStatus(job.status)) {
    return false;
  }

  const referenceTime = Date.parse(
    job.last_heartbeat_at ||
      job.updated_at
  );

  if (Number.isNaN(referenceTime)) {
    return false;
  }

  const ageMs = now - referenceTime;

  if (ageMs < DELETION_JOB_STALE_THRESHOLD_MS) {
    return false;
  }

  if (
    job.status === "processing" &&
    job.processor_lease_expires_at
  ) {
    const leaseExpiry = Date.parse(
      job.processor_lease_expires_at
    );

    if (
      !Number.isNaN(leaseExpiry) &&
      leaseExpiry > now
    ) {
      return false;
    }
  }

  return true;
}

export function canCancelDeletionJob(
  job: Pick<
    DeletionJobRecord,
    "status" | "current_step"
  >
) {
  if (
    job.status === "completed" ||
    job.status === "canceled"
  ) {
    return false;
  }

  if (
    job.status === "blocked" ||
    job.status === "failed" ||
    job.status === "pending" ||
    job.status === "validating"
  ) {
    return true;
  }

  if (job.status === "processing") {
    if (
      job.current_step &&
      IRREVERSIBLE_DELETION_STEPS.has(
        job.current_step
      )
    ) {
      return false;
    }

    return true;
  }

  return false;
}

export function canRetryDeletionJob(
  job: Pick<
    DeletionJobRecord,
    "status" | "current_step"
  >,
  options?: { isStale?: boolean }
) {
  if (job.status === "completed") {
    return false;
  }

  if (
    job.status === "failed" ||
    options?.isStale
  ) {
    return true;
  }

  if (
    job.status === "pending" ||
    job.status === "validating"
  ) {
    return true;
  }

  if (job.status === "processing") {
    return options?.isStale === true;
  }

  return false;
}

export function buildDeletionJobMessage(
  job: Pick<
    DeletionJobRecord,
    | "status"
    | "current_step"
    | "safe_error_code"
    | "safe_error_message"
  >,
  options?: { isStale?: boolean }
): string {
  if (options?.isStale) {
    return "The deletion process stopped before completing.";
  }

  switch (job.status) {
    case "pending":
    case "validating":
    case "processing":
      return "Account deletion is in progress.";
    case "blocked":
      return "Deletion requires attention.";
    case "failed":
      return buildFailedDeletionJobMessage(
        job.current_step
      );
    case "completed":
      return "Account deletion completed.";
    case "canceled":
      return "Deletion request was canceled.";
    default:
      return "Deletion job status unavailable.";
  }
}

export function buildDeletionJobView(
  job: DeletionJobRecord
): DeletionJobView {
  const isStale = isDeletionJobStale(job);
  const isActive =
    isActiveDeletionStatus(job.status) &&
    !isStale;
  const canRetry = canRetryDeletionJob(job, {
    isStale,
  });
  const canCancel = canCancelDeletionJob(job);
  const canResume =
    canRetry &&
    (job.status === "pending" ||
      job.status === "validating" ||
      isStale ||
      job.status === "failed");

  return {
    jobId: job.id,
    status: job.status,
    currentStep: job.current_step,
    failedStepLabel: formatDeletionStepLabel(
      job.status === "failed"
        ? job.current_step
        : null
    ),
    safeErrorCode: job.safe_error_code,
    safeErrorMessage: job.safe_error_message,
    canRetry,
    canCancel,
    canResume,
    isStale,
    isActive,
    retryCount: job.retry_count,
    startedAt: job.started_at,
    updatedAt: job.updated_at,
    completedAt: job.completed_at,
    failedAt: job.failed_at,
    canceledAt: job.canceled_at,
    message: buildDeletionJobMessage(job, {
      isStale,
    }),
  };
}

export function mapDeletionJobRow(
  row: Record<string, unknown>
): DeletionJobRecord {
  return row as DeletionJobRecord;
}
