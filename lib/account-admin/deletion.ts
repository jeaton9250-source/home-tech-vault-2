import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { recordPlatformAdminAudit } from "@/lib/account-admin/audit";
import { cleanupUserStorage } from "@/lib/account-admin/storageCleanup";
import { buildDeletionPreview } from "@/lib/account-admin/validation";

import type { DeletionJobStatus } from "@/lib/account-admin/types";

type DeletionJobRow = {
  id: string;
  target_user_id: string;
  target_email_snapshot: string;
  requested_by: string;
  reason: string;
  notes: string | null;
  transfer_owner_user_id: string | null;
  delete_household_data: boolean;
  status: DeletionJobStatus;
  current_step: string | null;
  retry_count: number;
};

async function updateJob(
  admin: SupabaseClient,
  jobId: string,
  patch: Record<string, unknown>
) {
  const { error } = await admin
    .from("admin_account_deletion_jobs")
    .update(patch)
    .eq("id", jobId);

  if (error) {
    throw error;
  }
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

export async function createDeletionJob(
  admin: SupabaseClient,
  options: {
    targetUserId: string;
    actorId: string;
    reason: string;
    notes?: string | null;
    emailConfirmation: string;
    transferOwnerUserId?: string | null;
    deleteHouseholdData?: boolean;
  }
) {
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

  if (
    !preview.email ||
    preview.email.trim().toLowerCase() !==
      options.emailConfirmation
        .trim()
        .toLowerCase()
  ) {
    return {
      ok: false as const,
      code: "EMAIL_MISMATCH",
      message:
        "Email confirmation does not match.",
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
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  await recordPlatformAdminAudit(admin, {
    eventType: "deletion_requested",
    actorId: options.actorId,
    targetUserId: options.targetUserId,
    targetEmailSnapshot: preview.email,
    reason: options.reason,
    notes: options.notes ?? null,
    metadata: { jobId: data.id },
  });

  return {
    ok: true as const,
    job: data as DeletionJobRow,
    preview,
  };
}

export async function processDeletionJob(
  admin: SupabaseClient,
  jobId: string,
  actorId: string
) {
  const { data: job, error } = await admin
    .from("admin_account_deletion_jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!job) {
    return {
      ok: false as const,
      message: "Deletion job not found.",
    };
  }

  if (
    job.status === "completed" ||
    job.status === "blocked"
  ) {
    return {
      ok: true as const,
      job,
    };
  }

  const targetUserId =
    job.target_user_id as string;

  try {
    await updateJob(admin, jobId, {
      status: "processing",
      current_step: "validate",
      started_at:
        job.started_at ??
        new Date().toISOString(),
      failed_at: null,
      safe_error_code: null,
      safe_error_message: null,
    });

    await recordPlatformAdminAudit(admin, {
      eventType: "deletion_started",
      actorId,
      targetUserId,
      targetEmailSnapshot:
        job.target_email_snapshot,
      metadata: { jobId },
    });

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
    );

    if (blockers.length > 0) {
      await updateJob(admin, jobId, {
        status: "blocked",
        current_step: "blocked",
        safe_error_code: blockers[0].code,
        safe_error_message:
          blockers[0].message,
      });

      return {
        ok: false as const,
        job,
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
        await updateJob(admin, jobId, {
          current_step:
            "delete_household_data",
        });

        await deleteHouseholdData(
          admin,
          ownedHouseholdId
        );
      }
    }

    await updateJob(admin, jobId, {
      current_step: "cleanup_storage",
    });

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

    await updateJob(admin, jobId, {
      current_step: "delete_profile",
    });

    await admin
      .from("profiles")
      .delete()
      .eq("id", targetUserId);

    await updateJob(admin, jobId, {
      current_step: "delete_auth_user",
    });

    const { error: authDeleteError } =
      await admin.auth.admin.deleteUser(
        targetUserId
      );

    if (authDeleteError) {
      throw authDeleteError;
    }

    await updateJob(admin, jobId, {
      status: "completed",
      current_step: "completed",
      completed_at: new Date().toISOString(),
    });

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
      job,
    };
  } catch (processingError) {
    const message =
      processingError instanceof Error
        ? processingError.message
        : "Deletion failed.";

    await updateJob(admin, jobId, {
      status: "failed",
      current_step: "failed",
      failed_at: new Date().toISOString(),
      safe_error_code: "PROCESSING_FAILED",
      safe_error_message: message,
      retry_count:
        (job.retry_count ?? 0) + 1,
    });

    await recordPlatformAdminAudit(admin, {
      eventType: "deletion_failed",
      actorId,
      targetUserId,
      targetEmailSnapshot:
        job.target_email_snapshot,
      metadata: {
        jobId,
        message,
      },
    });

    return {
      ok: false as const,
      job,
      message,
    };
  }
}

export async function getLatestDeletionJob(
  admin: SupabaseClient,
  targetUserId: string
) {
  const { data, error } = await admin
    .from("admin_account_deletion_jobs")
    .select("*")
    .eq("target_user_id", targetUserId)
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
