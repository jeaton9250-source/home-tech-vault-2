import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { loadAdminPendingInvitations } from "@/lib/admin/invitations";
import type { AdminActivityEvent } from "@/lib/admin/controlCenterTypes";

const AUDIT_LABELS: Record<string, string> = {
  account_deactivated: "User suspended",
  account_reactivated: "User reactivated",
  deletion_requested: "User deletion requested",
  deletion_blocked: "User deletion blocked",
  deletion_started: "User deletion started",
  deletion_completed: "User deleted",
  deletion_failed: "User deletion failed",
  household_ownership_transferred:
    "Household ownership transferred",
  founding_member_enrolled: "Founding member enrolled",
  founding_member_removed: "Founding member removed",
  plan_grant_created: "Plan grant created",
  plan_grant_revoked: "Plan grant revoked",
};

function mapAuditKind(
  eventType: string
): AdminActivityEvent["kind"] {
  if (eventType.includes("deletion")) {
    return "user_deleted";
  }

  if (
    eventType === "account_deactivated"
  ) {
    return "user_suspended";
  }

  if (
    eventType === "account_reactivated"
  ) {
    return "user_reactivated";
  }

  return "admin_action";
}

export async function loadAdminActivityEvents(options?: {
  q?: string;
  kind?: string;
  limit?: number;
}): Promise<AdminActivityEvent[]> {
  const admin = createAdminClient();
  const limit = options?.limit ?? 100;
  const events: AdminActivityEvent[] = [];

  const [
    auditResult,
    recentProfiles,
    invitations,
    connectors,
    recentSubscriptions,
  ] = await Promise.all([
    admin
      .from("platform_admin_audit_events")
      .select(
        "id, event_type, actor_id, target_user_id, target_email_snapshot, reason, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(limit),

    admin
      .from("profiles")
      .select("id, full_name, created_at")
      .order("created_at", { ascending: false })
      .limit(25),

    loadAdminPendingInvitations(admin),

    admin
      .from("connector_installations")
      .select(
        "id, name, household_id, platform, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(25),

    admin
      .from("user_subscriptions")
      .select("user_id, plan, status, updated_at")
      .in("plan", ["pro", "family"])
      .order("updated_at", {
        ascending: false,
        nullsFirst: false,
      })
      .limit(25),
  ]);

  for (const row of auditResult.data ?? []) {
    events.push({
      id: `audit-${row.id}`,
      kind: mapAuditKind(row.event_type),
      title:
        AUDIT_LABELS[row.event_type] ??
        row.event_type.replace(/_/g, " "),
      description:
        row.reason?.trim() ||
        row.target_email_snapshot ||
        "Platform admin action recorded.",
      actorLabel: row.actor_id,
      targetLabel:
        row.target_email_snapshot ||
        row.target_user_id,
      createdAt: row.created_at,
    });
  }

  for (const profile of recentProfiles.data ?? []) {
    events.push({
      id: `signup-${profile.id}`,
      kind: "user_created",
      title: "User created",
      description:
        profile.full_name?.trim() ||
        "New account registered.",
      actorLabel: null,
      targetLabel: profile.full_name,
      createdAt: profile.created_at ?? new Date().toISOString(),
    });
  }

  for (const invitation of invitations) {
    events.push({
      id: `invite-${invitation.id}`,
      kind: "invitation_sent",
      title: "Invitation sent",
      description: `${invitation.email} · ${invitation.invitationType.replace("_", " ")}`,
      actorLabel:
        invitation.invitedByName ||
        invitation.invitedByEmail,
      targetLabel: invitation.email,
      createdAt: invitation.createdAt,
    });
  }

  for (const connector of connectors.data ?? []) {
    events.push({
      id: `connector-${connector.id}`,
      kind: "connector_installed",
      title: "Connector installed",
      description: `${connector.name}${connector.platform ? ` · ${connector.platform}` : ""}`,
      actorLabel: null,
      targetLabel: connector.household_id,
      createdAt: connector.created_at,
    });
  }

  for (const subscription of recentSubscriptions.data ?? []) {
    events.push({
      id: `upgrade-${subscription.user_id}-${subscription.updated_at}`,
      kind: "subscription_upgraded",
      title: "Subscription upgraded",
      description: `${subscription.plan} · ${subscription.status}`,
      actorLabel: null,
      targetLabel: subscription.user_id,
      createdAt:
        subscription.updated_at ??
        new Date().toISOString(),
    });
  }

  let filtered = events.sort(
    (left, right) =>
      new Date(right.createdAt).getTime() -
      new Date(left.createdAt).getTime()
  );

  if (options?.kind?.trim()) {
    filtered = filtered.filter(
      (event) => event.kind === options.kind
    );
  }

  if (options?.q?.trim()) {
    const term = options.q.trim().toLowerCase();

    filtered = filtered.filter(
      (event) =>
        event.title.toLowerCase().includes(term) ||
        event.description.toLowerCase().includes(term) ||
        event.targetLabel?.toLowerCase().includes(term)
    );
  }

  return filtered.slice(0, limit);
}
