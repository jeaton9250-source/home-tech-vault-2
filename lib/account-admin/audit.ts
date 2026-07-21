import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { AdminAuditEventType } from "@/lib/account-admin/types";

export async function recordPlatformAdminAudit(
  admin: SupabaseClient,
  event: {
    eventType: AdminAuditEventType;
    actorId: string;
    targetUserId?: string | null;
    targetEmailSnapshot?: string | null;
    reason?: string | null;
    notes?: string | null;
    metadata?: Record<string, unknown>;
  }
) {
  const { error } = await admin
    .from("platform_admin_audit_events")
    .insert({
      event_type: event.eventType,
      actor_id: event.actorId,
      target_user_id:
        event.targetUserId ?? null,
      target_email_snapshot:
        event.targetEmailSnapshot ?? null,
      reason: event.reason ?? null,
      notes: event.notes ?? null,
      metadata: event.metadata ?? {},
    });

  if (error) {
    console.error(
      "Unable to record platform admin audit event:",
      error
    );
  }
}
