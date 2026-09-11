import "server-only";

import { permanentlyDeleteUser } from "@/lib/account-admin/deletion";
import { createAdminClient } from "@/lib/supabase/admin";

type RequestRow = {
  id: string;
  user_id: string | null;
  user_email: string;
};

export async function processAccountDeletionRequests() {
  const admin = createAdminClient();
  const { data: adminProfile, error: adminError } = await admin
    .from("profiles")
    .select("id")
    .eq("is_admin", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (adminError || !adminProfile) {
    throw new Error("No platform administrator is available to process account deletion requests.");
  }

  const { data, error } = await admin
    .from("account_deletion_requests")
    .select("id, user_id, user_email")
    .eq("status", "pending")
    .lte("scheduled_for", new Date().toISOString())
    .order("scheduled_for", { ascending: true })
    .limit(10);

  if (error) throw error;

  let completed = 0;
  let failed = 0;

  for (const request of (data ?? []) as RequestRow[]) {
    if (!request.user_id) {
      await admin.from("account_deletion_requests").update({
        status: "completed",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", request.id);
      completed += 1;
      continue;
    }

    await admin.from("account_deletion_requests").update({
      status: "processing",
      last_error: null,
      updated_at: new Date().toISOString(),
    }).eq("id", request.id).eq("status", "pending");

    try {
      const result = await permanentlyDeleteUser(admin, {
        targetUserId: request.user_id,
        actorId: adminProfile.id,
        reason: "User-requested account erasure",
        notes: `Mobile deletion request ${request.id}`,
        confirmText: "DELETE",
      });

      if (!result.ok) {
        throw new Error(result.message || "Permanent account deletion was blocked.");
      }

      await admin.from("account_deletion_requests").update({
        status: "completed",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", request.id);
      completed += 1;
    } catch (processingError) {
      const message = processingError instanceof Error
        ? processingError.message.slice(0, 500)
        : "Permanent account deletion failed.";
      console.error("[account-deletion-request] processing failed", { requestId: request.id, message });
      await admin.from("account_deletion_requests").update({
        status: "failed",
        last_error: message,
        updated_at: new Date().toISOString(),
      }).eq("id", request.id);
      failed += 1;
    }
  }

  return { scanned: data?.length ?? 0, completed, failed };
}
