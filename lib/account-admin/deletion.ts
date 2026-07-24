import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { recordPlatformAdminAudit } from "@/lib/account-admin/audit";
import {
  buildDeletionJobView,
  canCancelDeletionJob,
  DELETION_JOB_LEASE_SECONDS,
  type DeletionJobRecord,
  type DeletionJobView,
  isActiveDeletionStatus,
  isDeletionJobStale,
  mapDeletionJobRow,
} from "@/lib/account-admin/deletionJobState";
import { cleanupUserStorage } from "@/lib/account-admin/storageCleanup";
import { buildDeletionPreview } from "@/lib/account-admin/validation";

import type { DeletionJobStatus } from "@/lib/account-admin/types";

const DELETION_JOB_SELECT =
  "id, target_user_id, target_email_snapshot, requested_by, reason, notes, transfer_owner_user_id, delete_household_data, status, current_step, safe_error_code, safe_error_message, retry_count, started_at, completed_at, failed_at, canceled_at, canceled_by, processor_started_at, processor_lease_expires_at, processor_actor_id, last_heartbeat_at, created_at, updated_at";

type ClaimResult = {
  claimed: boolean;
  job: DeletionJobRecord | null;
};

async function loadDeletionJobById(
  admin: SupabaseClient,
  jobId: string
): Promise<DeletionJobRecord | null> {
  const { data, error } = await admin
    .from("admin_account_deletion_jobs")
    .select(DELETION_JOB_SELECT)
    .eq("id", jobId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapDeletionJobRow(data) : null;
}

async function updateJob(
  admin: SupabaseClient,
  jobId: string,
  patch: Record<string, unknown>
) {
  const heartbeatPatch = {
    ...patch,
    last_heartbeat_at: new Date().toISOString(),
  };

  const { error } = await admin
    .from("admin_account_deletion_jobs")
    .update(heartbeatPatch)
    .eq("id", jobId);

  if (error) {
    throw error;
  }
}

async function extendProcessorLease(
  admin: SupabaseClient,
  jobId: string,
  actorId: string
) {
  const leaseUntil = new Date(
    Date.now() +
      DELETION_JOB_LEASE_SECONDS * 1000
  ).toISOString();

  await updateJob(admin, jobId, {
    processor_lease_expires_at: leaseUntil,
    processor_actor_id: actorId,
  });
}

export async function markDeletionJobFailed(
  admin: SupabaseClient,
  options: {
    jobId: string;
    actorId: string;
    safeErrorCode: string;
    safeErrorMessage: string;
    currentStep?: string | null;
    incrementRetry?: boolean;
    job?: DeletionJobRecord | null;
  }
) {
  const job =
    options.job ??
    (await loadDeletionJobById(
      admin,
      options.jobId
    ));

  if (!job) {
    return null;
  }

  await updateJob(admin, options.jobId, {
    status: "failed",
    current_step:
      options.currentStep ?? "failed",
    failed_at: new Date().toISOString(),
    safe_error_code: options.safeErrorCode,
    safe_error_message:
      options.safeErrorMessage,
    processor_started_at: null,
    processor_lease_expires_at: null,
    processor_actor_id: null,
    retry_count: options.incrementRetry
      ? job.retry_count + 1
      : job.retry_count,
  });

  await recordPlatformAdminAudit(admin, {
    eventType: "deletion_failed",
    actorId: options.actorId,
    targetUserId: job.target_user_id,
    targetEmailSnapshot:
      job.target_email_snapshot,
    metadata: {
      jobId: options.jobId,
      safeErrorCode: options.safeErrorCode,
      safeErrorMessage:
        options.safeErrorMessage,
    },
  });

  return loadDeletionJobById(
    admin,
    options.jobId
  );
}

export async function reconcileStaleDeletionJob(
  admin: SupabaseClient,
  job: DeletionJobRecord,
  actorId: string
): Promise<DeletionJobRecord> {
  if (!isDeletionJobStale(job)) {
    return job;
  }

  const failedJob = await markDeletionJobFailed(
    admin,
    {
      jobId: job.id,
      actorId,
      safeErrorCode: "PROCESSOR_TIMEOUT",
      safeErrorMessage:
        "The deletion process stopped before completing. You can safely retry this job.",
      currentStep: job.current_step,
      incrementRetry: false,
      job,
    }
  );

  return failedJob ?? job;
}

export async function reconcileActiveDeletionJobsForUser(
  admin: SupabaseClient,
  targetUserId: string,
  actorId: string
) {
  const { data, error } = await admin
    .from("admin_account_deletion_jobs")
    .select(DELETION_JOB_SELECT)
    .eq("target_user_id", targetUserId)
    .in("status", [
      "pending",
      "validating",
      "processing",
    ]);

  if (error) {
    throw error;
  }

  for (const row of data ?? []) {
    const job = mapDeletionJobRow(row);

    if (isDeletionJobStale(job)) {
      await reconcileStaleDeletionJob(
        admin,
        job,
        actorId
      );
    }
  }
}

async function claimDeletionJob(
  admin: SupabaseClient,
  jobId: string,
  actorId: string
): Promise<ClaimResult> {
  const { data, error } = await admin.rpc(
    "claim_deletion_job",
    {
      p_job_id: jobId,
      p_actor_id: actorId,
      p_lease_seconds:
        DELETION_JOB_LEASE_SECONDS,
    }
  );

  if (error) {
    if (
      error.message.includes(
        "claim_deletion_job"
      ) ||
      error.code === "PGRST202"
    ) {
      return claimDeletionJobFallback(
        admin,
        jobId,
        actorId
      );
    }

    throw error;
  }

  const row = Array.isArray(data)
    ? data[0]
    : data;

  if (!row?.job_id) {
    const existing = await loadDeletionJobById(
      admin,
      jobId
    );

    return {
      claimed: false,
      job: existing,
    };
  }

  const job = await loadDeletionJobById(
    admin,
    row.job_id as string
  );

  return {
    claimed: row.claimed === true,
    job,
  };
}

async function claimDeletionJobFallback(
  admin: SupabaseClient,
  jobId: string,
  actorId: string
): Promise<ClaimResult> {
  const job = await loadDeletionJobById(
    admin,
    jobId
  );

  if (!job) {
    return { claimed: false, job: null };
  }

  if (
    job.status === "completed" ||
    job.status === "canceled" ||
    job.status === "blocked"
  ) {
    return { claimed: false, job };
  }

  const now = Date.now();
  const leaseActive =
    job.status === "processing" &&
    job.processor_lease_expires_at &&
    Date.parse(
      job.processor_lease_expires_at
    ) > now;

  if (leaseActive) {
    return { claimed: false, job };
  }

  const leaseUntil = new Date(
    now + DELETION_JOB_LEASE_SECONDS * 1000
  ).toISOString();

  const { data, error } = await admin
    .from("admin_account_deletion_jobs")
    .update({
      status: "processing",
      current_step:
        job.current_step ?? "queued",
      started_at:
        job.started_at ??
        new Date().toISOString(),
      failed_at: null,
      safe_error_code: null,
      safe_error_message: null,
      processor_started_at:
        new Date().toISOString(),
      processor_lease_expires_at:
        leaseUntil,
      processor_actor_id: actorId,
      last_heartbeat_at:
        new Date().toISOString(),
      retry_count:
        job.status === "failed"
          ? job.retry_count + 1
          : job.retry_count,
    })
    .eq("id", jobId)
    .in("status", [
      "pending",
      "validating",
      "processing",
      "failed",
    ])
    .select(DELETION_JOB_SELECT)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    const latest = await loadDeletionJobById(
      admin,
      jobId
    );
    return { claimed: false, job: latest };
  }

  if (job.status === "failed") {
    await recordPlatformAdminAudit(admin, {
      eventType: "deletion_retried",
      actorId,
      targetUserId: job.target_user_id,
      targetEmailSnapshot:
        job.target_email_snapshot,
      metadata: { jobId },
    });
  }

  return {
    claimed: true,
    job: mapDeletionJobRow(data),
  };
}

async function deleteWhereUserId(
  admin: SupabaseClient,
  table: string,
  userId: string
) {
  const { error } = await admin
    .from(table)
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

async function deleteWhereHouseholdId(
  admin: SupabaseClient,
  table: string,
  householdId: string
) {
  const { error } = await admin
    .from(table)
    .delete()
    .eq("household_id", householdId);

  if (error) {
    throw error;
  }
}

async function transferHouseholdOwnership(
  admin: SupabaseClient,
  options: {
    householdId: string;
    newOwnerId: string;
    actorId: string;
    previousOwnerId: string;
  }
) {
  const { error: householdError } = await admin
    .from("households")
    .update({ owner_id: options.newOwnerId })
    .eq("id", options.householdId);

  if (householdError) {
    throw householdError;
  }

  await admin
    .from("household_members")
    .upsert(
      {
        household_id: options.householdId,
        user_id: options.newOwnerId,
        role: "owner",
      },
      { onConflict: "household_id,user_id" }
    );

  await recordPlatformAdminAudit(admin, {
    eventType:
      "household_ownership_transferred",
    actorId: options.actorId,
    targetUserId: options.previousOwnerId,
    metadata: {
      householdId: options.householdId,
      newOwnerId: options.newOwnerId,
    },
  });
}

async function deleteHouseholdData(
  admin: SupabaseClient,
  householdId: string
) {
  const tables = [
    "devices",
    "documents",
    "device_documents",
    "device_images",
    "maintenance_tasks",
    "network_info",
    "subscriptions",
    "household_members",
    "household_invitations",
  ];

  for (const table of tables) {
    await deleteWhereHouseholdId(
      admin,
      table,
      householdId
    );
  }

  const { error } = await admin
    .from("households")
    .delete()
    .eq("id", householdId);

  if (error) {
    throw error;
  }
}

async function profileExists(
  admin: SupabaseClient,
  userId: string
) {
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  return Boolean(data?.id);
}

async function authUserExists(
  admin: SupabaseClient,
  userId: string
) {
  const { data, error } =
    await admin.auth.admin.getUserById(userId);

  if (error) {
    return false;
  }

  return Boolean(data.user?.id);
}

async function deleteAuthUser(
  admin: SupabaseClient,
  targetUserId: string
) {
  const { data, error } =
    await admin.auth.admin.deleteUser(
      targetUserId
    );

  if (error) {
    console.error("Auth user deletion failed", {
      targetUserId,
      message: error.message,
      status: error.status,
      code: error.code,
    });

    throw error;
  }

  return data;
}

export async function createDeletionJob(
  admin: SupabaseClient,
  options: {
    targetUserId: string;
    actorId: string;
    reason: string;
    notes?: string | null;
    confirmText: string;
    transferOwnerUserId?: string | null;
    deleteHouseholdData?: boolean;
  }
) {
  await reconcileActiveDeletionJobsForUser(
    admin,
    options.targetUserId,
    options.actorId
  );

  const preview = await buildDeletionPreview(
    admin,
    options.targetUserId,
    options.actorId
  );

  if (!preview) {
    return {
      ok: false as const,
      code: "TARGET_NOT_FOUND",
      message: "User not found.",
    };
  }

  if (options.confirmText.trim() !== "DELETE") {
    return {
      ok: false as const,
      code: "CONFIRMATION_MISMATCH",
      message:
        "Type DELETE to confirm permanent deletion.",
    };
  }

  const activeJobBlocker =
    preview.blockers.find(
      (blocker) =>
        blocker.code ===
        "ACTIVE_DELETION_JOB"
    );

  if (activeJobBlocker) {
    const latestJob =
      await getLatestDeletionJob(
        admin,
        options.targetUserId
      );

    return {
      ok: false as const,
      code: "ACTIVE_DELETION_JOB" as const,
      message: activeJobBlocker.message,
      preview,
      job: latestJob,
      jobView: latestJob
        ? buildDeletionJobView(latestJob)
        : null,
    };
  }

  if (
    preview.blockers.some(
      (blocker) =>
        blocker.code ===
        "HOUSEHOLD_HAS_MEMBERS"
    ) &&
    !options.transferOwnerUserId
  ) {
    await recordPlatformAdminAudit(admin, {
      eventType: "deletion_blocked",
      actorId: options.actorId,
      targetUserId: options.targetUserId,
      targetEmailSnapshot: preview.email,
      reason: options.reason,
      notes: options.notes ?? null,
      metadata: {
        blockers: [
          {
            code: "HOUSEHOLD_HAS_MEMBERS",
            message:
              "Transfer household ownership before deletion.",
          },
        ],
      },
    });

    return {
      ok: false as const,
      code: "HOUSEHOLD_HAS_MEMBERS",
      message:
        "Transfer household ownership before deletion.",
      preview,
    };
  }

  if (options.transferOwnerUserId) {
    const ownedHouseholdId =
      preview.householdId &&
      preview.isHouseholdOwner
        ? preview.householdId
        : null;

    if (ownedHouseholdId) {
      const isEligibleMember =
        preview.otherHouseholdMembers.some(
          (member) =>
            member.userId ===
            options.transferOwnerUserId
        );

      if (!isEligibleMember) {
        return {
          ok: false as const,
          code: "HOUSEHOLD_HAS_MEMBERS",
          message:
            "Ownership transfer target must be an existing household member.",
          preview,
        };
      }
    }
  }

  const remainingBlockers =
    preview.blockers.filter(
      (blocker) =>
        blocker.code !==
        "HOUSEHOLD_HAS_MEMBERS"
    );

  if (remainingBlockers.length > 0) {
    await recordPlatformAdminAudit(admin, {
      eventType: "deletion_blocked",
      actorId: options.actorId,
      targetUserId: options.targetUserId,
      targetEmailSnapshot: preview.email,
      reason: options.reason,
      notes: options.notes ?? null,
      metadata: {
        blockers: remainingBlockers,
      },
    });

    return {
      ok: false as const,
      code: remainingBlockers[0].code,
      message: remainingBlockers[0].message,
      preview,
    };
  }

  const { data, error } = await admin
    .from("admin_account_deletion_jobs")
    .insert({
      target_user_id: options.targetUserId,
      target_email_snapshot:
        preview.email ?? options.targetUserId,
      requested_by: options.actorId,
      reason: options.reason.trim(),
      notes: options.notes?.trim() || null,
      transfer_owner_user_id:
        options.transferOwnerUserId ?? null,
      delete_household_data:
        options.deleteHouseholdData === true,
      status: "pending",
      current_step: "queued",
    })
    .select(DELETION_JOB_SELECT)
    .single();

  if (error) {
    if (
      error.message.includes(
        "idx_admin_account_deletion_jobs_one_active"
      )
    ) {
      const latestJob =
        await getLatestDeletionJob(
          admin,
          options.targetUserId
        );

      return {
        ok: false as const,
        code: "ACTIVE_DELETION_JOB" as const,
        message:
          "A deletion job is already in progress for this user.",
        preview,
        job: latestJob,
        jobView: latestJob
          ? buildDeletionJobView(latestJob)
          : null,
      };
    }

    throw error;
  }

  const job = mapDeletionJobRow(data);

  await recordPlatformAdminAudit(admin, {
    eventType: "deletion_requested",
    actorId: options.actorId,
    targetUserId: options.targetUserId,
    targetEmailSnapshot: preview.email,
    reason: options.reason,
    notes: options.notes ?? null,
    metadata: { jobId: job.id },
  });

  return {
    ok: true as const,
    job,
    jobView: buildDeletionJobView(job),
    preview,
  };
}

export async function cancelDeletionJob(
  admin: SupabaseClient,
  options: {
    jobId: string;
    actorId: string;
    confirm: boolean;
    reason?: string | null;
  }
) {
  if (!options.confirm) {
    return {
      ok: false as const,
      message:
        "Confirmation is required to cancel deletion.",
    };
  }

  const job = await loadDeletionJobById(
    admin,
    options.jobId
  );

  if (!job) {
    return {
      ok: false as const,
      message: "Deletion job not found.",
    };
  }

  if (
    job.status === "completed" ||
    job.status === "canceled"
  ) {
    return {
      ok: true as const,
      job,
      jobView: buildDeletionJobView(job),
    };
  }

  if (!canCancelDeletionJob(job)) {
    return {
      ok: false as const,
      message:
        "This deletion job can no longer be canceled because irreversible cleanup has started.",
      job,
      jobView: buildDeletionJobView(job),
    };
  }

  if (
    job.status === "processing" &&
    job.processor_lease_expires_at &&
    Date.parse(
      job.processor_lease_expires_at
    ) > Date.now()
  ) {
    return {
      ok: false as const,
      message:
        "Another administrator is currently processing this deletion job.",
      job,
      jobView: buildDeletionJobView(job),
    };
  }

  await updateJob(admin, job.id, {
    status: "canceled",
    current_step: "canceled",
    canceled_at: new Date().toISOString(),
    canceled_by: options.actorId,
    processor_started_at: null,
    processor_lease_expires_at: null,
    processor_actor_id: null,
    safe_error_code: null,
    safe_error_message: null,
  });

  const updatedJob = await loadDeletionJobById(
    admin,
    job.id
  );

  await recordPlatformAdminAudit(admin, {
    eventType: "deletion_canceled",
    actorId: options.actorId,
    targetUserId: job.target_user_id,
    targetEmailSnapshot:
      job.target_email_snapshot,
    reason: options.reason ?? null,
    metadata: { jobId: job.id },
  });

  return {
    ok: true as const,
    job: updatedJob,
    jobView: updatedJob
      ? buildDeletionJobView(updatedJob)
      : null,
  };
}

export async function getDeletionJobStatusForUser(
  admin: SupabaseClient,
  targetUserId: string,
  actorId: string
): Promise<{
  job: DeletionJobRecord | null;
  jobView: DeletionJobView | null;
}> {
  await reconcileActiveDeletionJobsForUser(
    admin,
    targetUserId,
    actorId
  );

  const job = await getLatestDeletionJob(
    admin,
    targetUserId
  );

  return {
    job,
    jobView: job
      ? buildDeletionJobView(job)
      : null,
  };
}

export async function processDeletionJob(
  admin: SupabaseClient,
  jobId: string,
  actorId: string
) {
  let job = await loadDeletionJobById(
    admin,
    jobId
  );

  if (!job) {
    return {
      ok: false as const,
      message: "Deletion job not found.",
    };
  }

  if (job.status === "completed") {
    return {
      ok: true as const,
      job,
      jobView: buildDeletionJobView(job),
    };
  }

  if (job.status === "canceled") {
    return {
      ok: false as const,
      message: "This deletion request was canceled.",
      job,
      jobView: buildDeletionJobView(job),
    };
  }

  if (job.status === "blocked") {
    return {
      ok: false as const,
      message:
        job.safe_error_message ??
        "Deletion is blocked.",
      job,
      jobView: buildDeletionJobView(job),
    };
  }

  job = await reconcileStaleDeletionJob(
    admin,
    job,
    actorId
  );

  const claim = await claimDeletionJob(
    admin,
    jobId,
    actorId
  );

  if (!claim.claimed || !claim.job) {
    const message =
      claim.job?.status === "processing"
        ? "Another administrator is currently processing this deletion job."
        : "Unable to claim this deletion job for processing.";

    return {
      ok: false as const,
      message,
      job: claim.job,
      jobView: claim.job
        ? buildDeletionJobView(claim.job)
        : null,
    };
  }

  job = claim.job;
  const targetUserId = job.target_user_id;

  try {
    await recordPlatformAdminAudit(admin, {
      eventType: "deletion_started",
      actorId,
      targetUserId,
      targetEmailSnapshot:
        job.target_email_snapshot,
      metadata: { jobId },
    });

    const profileStillExists =
      await profileExists(
        admin,
        targetUserId
      );
    const authStillExists =
      await authUserExists(
        admin,
        targetUserId
      );

    if (!profileStillExists && !authStillExists) {
      await updateJob(admin, jobId, {
        status: "completed",
        current_step: "completed",
        completed_at: new Date().toISOString(),
        processor_started_at: null,
        processor_lease_expires_at: null,
        processor_actor_id: null,
      });

      const completedJob =
        await loadDeletionJobById(
          admin,
          jobId
        );

      await recordPlatformAdminAudit(admin, {
        eventType: "deletion_completed",
        actorId,
        targetUserId: null,
        targetEmailSnapshot:
          job.target_email_snapshot,
        metadata: { jobId },
      });

      return {
        ok: true as const,
        job: completedJob,
        jobView: completedJob
          ? buildDeletionJobView(
              completedJob
            )
          : null,
      };
    }

    await updateJob(admin, jobId, {
      current_step: "validate",
    });
    await extendProcessorLease(
      admin,
      jobId,
      actorId
    );

    const preview = await buildDeletionPreview(
      admin,
      targetUserId,
      actorId
    );

    if (!preview) {
      throw new Error("TARGET_NOT_FOUND");
    }

    const blockers = preview.blockers.filter(
      (blocker) =>
        blocker.code !==
          "HOUSEHOLD_HAS_MEMBERS" ||
        !job.transfer_owner_user_id
    ).filter(
      (blocker) =>
        blocker.code !==
        "ACTIVE_DELETION_JOB"
    );

    if (blockers.length > 0) {
      await updateJob(admin, jobId, {
        status: "blocked",
        current_step: "blocked",
        safe_error_code: blockers[0].code,
        safe_error_message:
          blockers[0].message,
        processor_started_at: null,
        processor_lease_expires_at: null,
        processor_actor_id: null,
      });

      const blockedJob =
        await loadDeletionJobById(
          admin,
          jobId
        );

      return {
        ok: false as const,
        job: blockedJob,
        jobView: blockedJob
          ? buildDeletionJobView(
              blockedJob
            )
          : null,
        message: blockers[0].message,
      };
    }

    const ownedHouseholds = await admin
      .from("households")
      .select("id")
      .eq("owner_id", targetUserId);

    const ownedHouseholdId =
      ownedHouseholds.data?.[0]?.id ?? null;

    if (
      ownedHouseholdId &&
      job.transfer_owner_user_id
    ) {
      await updateJob(admin, jobId, {
        current_step: "transfer_household",
      });
      await extendProcessorLease(
        admin,
        jobId,
        actorId
      );

      const { data: household } = await admin
        .from("households")
        .select("owner_id")
        .eq("id", ownedHouseholdId)
        .maybeSingle();

      if (
        household?.owner_id === targetUserId
      ) {
        await transferHouseholdOwnership(
          admin,
          {
            householdId: ownedHouseholdId,
            newOwnerId:
              job.transfer_owner_user_id,
            actorId,
            previousOwnerId: targetUserId,
          }
        );
      }
    }

    if (
      ownedHouseholdId &&
      job.delete_household_data
    ) {
      const { count } = await admin
        .from("household_members")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq(
          "household_id",
          ownedHouseholdId
        );

      if ((count ?? 0) <= 1) {
        const { data: householdStillExists } =
          await admin
            .from("households")
            .select("id")
            .eq("id", ownedHouseholdId)
            .maybeSingle();

        if (householdStillExists?.id) {
          await updateJob(admin, jobId, {
            current_step:
              "delete_household_data",
          });
          await extendProcessorLease(
            admin,
            jobId,
            actorId
          );

          await deleteHouseholdData(
            admin,
            ownedHouseholdId
          );
        }
      }
    }

    await updateJob(admin, jobId, {
      current_step: "cleanup_storage",
    });
    await extendProcessorLease(
      admin,
      jobId,
      actorId
    );

    await cleanupUserStorage(admin, {
      userId: targetUserId,
      householdIds: ownedHouseholdId
        ? [ownedHouseholdId]
        : preview.householdId
          ? [preview.householdId]
          : [],
    });

    await updateJob(admin, jobId, {
      current_step: "delete_application_data",
    });
    await extendProcessorLease(
      admin,
      jobId,
      actorId
    );

    const userScopedTables = [
      "device_events",
      "network_scans",
      "network_discoveries",
      "devices",
      "documents",
      "device_documents",
      "device_images",
      "maintenance_tasks",
      "network_info",
      "subscriptions",
      "contact_messages",
      "household_members",
      "user_subscriptions",
    ];

    for (const table of userScopedTables) {
      await deleteWhereUserId(
        admin,
        table,
        targetUserId
      );
    }

    await admin
      .from("platform_plan_grants")
      .update({
        status: "revoked",
        revoked_at: new Date().toISOString(),
        revoked_by: actorId,
        revocation_reason:
          "Account deleted by platform admin",
      })
      .eq("user_id", targetUserId)
      .eq("status", "active");

    await admin
      .from("support_tickets")
      .update({ user_id: null })
      .eq("user_id", targetUserId);

    await admin
      .from("support_ticket_notes")
      .delete()
      .eq("author_id", targetUserId);

    if (await authUserExists(admin, targetUserId)) {
      await updateJob(admin, jobId, {
        current_step: "delete_auth_user",
      });
      await extendProcessorLease(
        admin,
        jobId,
        actorId
      );

      await deleteAuthUser(
        admin,
        targetUserId
      );
    }

    if (await profileExists(admin, targetUserId)) {
      await updateJob(admin, jobId, {
        current_step: "delete_profile",
      });
      await extendProcessorLease(
        admin,
        jobId,
        actorId
      );

      const { error: profileDeleteError } =
        await admin
          .from("profiles")
          .delete()
          .eq("id", targetUserId);

      if (profileDeleteError) {
        console.error(
          "Profile cleanup after auth deletion failed",
          {
            targetUserId,
            message:
              profileDeleteError.message,
            code: profileDeleteError.code,
          }
        );
      }
    }

    await updateJob(admin, jobId, {
      status: "completed",
      current_step: "completed",
      completed_at: new Date().toISOString(),
      processor_started_at: null,
      processor_lease_expires_at: null,
      processor_actor_id: null,
    });

    const completedJob =
      await loadDeletionJobById(
        admin,
        jobId
      );

    await recordPlatformAdminAudit(admin, {
      eventType: "deletion_completed",
      actorId,
      targetUserId: null,
      targetEmailSnapshot:
        job.target_email_snapshot,
      metadata: {
        jobId,
        action: "user_permanently_deleted",
        deletionMode: job.delete_household_data
          ? "delete_user_and_empty_household"
          : "remove_user_preserve_household",
        householdImpact:
          job.delete_household_data
            ? "household_deleted"
            : job.transfer_owner_user_id
              ? "ownership_transferred"
              : "membership_removed",
      },
    });

    return {
      ok: true as const,
      job: completedJob,
      jobView: completedJob
        ? buildDeletionJobView(
            completedJob
          )
        : null,
    };
  } catch (processingError) {
    const message =
      processingError instanceof Error
        ? processingError.message
        : "Deletion failed.";

    const failedJob = await markDeletionJobFailed(
      admin,
      {
        jobId,
        actorId,
        safeErrorCode: "PROCESSING_FAILED",
        safeErrorMessage:
          "Deletion could not be completed. You can retry this job safely.",
        currentStep: "failed",
        incrementRetry: true,
        job,
      }
    );

    return {
      ok: false as const,
      job: failedJob,
      jobView: failedJob
        ? buildDeletionJobView(failedJob)
        : null,
      message,
    };
  }
}

export async function permanentlyDeleteUser(
  admin: SupabaseClient,
  options: {
    targetUserId: string;
    actorId: string;
    reason: string;
    notes?: string | null;
    confirmText: string;
    transferOwnerUserId?: string | null;
    deleteHouseholdData?: boolean;
  }
) {
  const createResult = await createDeletionJob(
    admin,
    options
  );

  if (!createResult.ok) {
    return {
      ok: false as const,
      stage: "authorization" as const,
      code: createResult.code,
      message: createResult.message,
      preview: createResult.preview ?? null,
      job: createResult.job ?? null,
      jobView: createResult.jobView ?? null,
    };
  }

  const processResult = await processDeletionJob(
    admin,
    createResult.job.id,
    options.actorId
  );

  if (
    !processResult.ok ||
    processResult.job?.status !== "completed"
  ) {
    return {
      ok: false as const,
      stage:
        processResult.job?.current_step ===
        "delete_auth_user"
          ? ("auth_deletion" as const)
          : ("application_cleanup" as const),
      message:
        processResult.message ??
        "Deletion could not be completed.",
      preview: createResult.preview ?? null,
      job: processResult.job ?? createResult.job,
      jobView:
        processResult.jobView ??
        createResult.jobView ??
        null,
    };
  }

  const authStillExists = await authUserExists(
    admin,
    options.targetUserId
  );

  if (authStillExists) {
    return {
      ok: false as const,
      stage: "auth_deletion" as const,
      message:
        "The application cleanup finished, but the Supabase Auth user still exists. Retry deletion or repair the account manually.",
      preview: createResult.preview ?? null,
      job: processResult.job,
      jobView: processResult.jobView ?? null,
    };
  }

  return {
    ok: true as const,
    deleted: true as const,
    preview: createResult.preview ?? null,
    job: processResult.job,
    jobView: processResult.jobView ?? null,
  };
}

export async function getLatestDeletionJob(
  admin: SupabaseClient,
  targetUserId: string
): Promise<DeletionJobRecord | null> {
  const { data, error } = await admin
    .from("admin_account_deletion_jobs")
    .select(DELETION_JOB_SELECT)
    .eq("target_user_id", targetUserId)
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapDeletionJobRow(data) : null;
}

export type { DeletionJobView };
