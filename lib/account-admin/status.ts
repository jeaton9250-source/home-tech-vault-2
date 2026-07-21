import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { recordPlatformAdminAudit } from "@/lib/account-admin/audit";

import type { AccountStatus } from "@/lib/account-admin/types";

const LONG_BAN_DURATION = "876600h";

export type ProfileAccountRecord = {
  id: string;
  account_status: AccountStatus;
  is_admin: boolean;
  full_name: string | null;
};

export async function loadProfileAccountRecord(
  admin: SupabaseClient,
  userId: string
): Promise<ProfileAccountRecord | null> {
  const { data, error } = await admin
    .from("profiles")
    .select(
      "id, account_status, is_admin, full_name"
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    account_status:
      data.account_status === "deactivated"
        ? "deactivated"
        : "active",
    is_admin: data.is_admin === true,
    full_name: data.full_name ?? null,
  };
}

export async function isAccountDeactivated(
  admin: SupabaseClient,
  userId: string
): Promise<boolean> {
  const profile =
    await loadProfileAccountRecord(
      admin,
      userId
    );

  return (
    profile?.account_status ===
    "deactivated"
  );
}

export async function deactivateAccount(
  admin: SupabaseClient,
  options: {
    targetUserId: string;
    actorId: string;
    reason: string;
    notes?: string | null;
    targetEmail?: string | null;
  }
) {
  const now = new Date().toISOString();

  const { error: profileError } = await admin
    .from("profiles")
    .upsert(
      {
        id: options.targetUserId,
        account_status: "deactivated",
        deactivated_at: now,
        deactivated_by: options.actorId,
        deactivation_reason:
          options.reason.trim(),
        deactivation_notes:
          options.notes?.trim() || null,
        reactivated_at: null,
        reactivated_by: null,
      },
      { onConflict: "id" }
    );

  if (profileError) {
    throw profileError;
  }

  const { error: banError } =
    await admin.auth.admin.updateUserById(
      options.targetUserId,
      {
        ban_duration: LONG_BAN_DURATION,
      }
    );

  if (banError) {
    throw banError;
  }

  await recordPlatformAdminAudit(admin, {
    eventType: "account_deactivated",
    actorId: options.actorId,
    targetUserId: options.targetUserId,
    targetEmailSnapshot:
      options.targetEmail ?? null,
    reason: options.reason,
    notes: options.notes ?? null,
  });
}

export async function reactivateAccount(
  admin: SupabaseClient,
  options: {
    targetUserId: string;
    actorId: string;
    notes?: string | null;
    targetEmail?: string | null;
  }
) {
  const now = new Date().toISOString();

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      account_status: "active",
      reactivated_at: now,
      reactivated_by: options.actorId,
    })
    .eq("id", options.targetUserId);

  if (profileError) {
    throw profileError;
  }

  const { error: unbanError } =
    await admin.auth.admin.updateUserById(
      options.targetUserId,
      {
        ban_duration: "none",
      }
    );

  if (unbanError) {
    throw unbanError;
  }

  await recordPlatformAdminAudit(admin, {
    eventType: "account_reactivated",
    actorId: options.actorId,
    targetUserId: options.targetUserId,
    targetEmailSnapshot:
      options.targetEmail ?? null,
    notes: options.notes ?? null,
  });
}

export { DEACTIVATED_USER_MESSAGE } from "@/lib/auth/accountStatusMessage";
