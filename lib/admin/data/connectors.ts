import "server-only";

import { loadAdminPendingInvitations } from "@/lib/admin/invitations";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminConnectorRow } from "@/lib/admin/controlCenterTypes";

function resolveConnectorPresence(
  lastSeenAt: string | null,
  status: string | null,
  revokedAt: string | null
): AdminConnectorRow["status"] {
  if (revokedAt || status === "revoked") {
    return "revoked";
  }

  if (!lastSeenAt) {
    return "offline";
  }

  const lastSeenMs = new Date(lastSeenAt).getTime();
  const ageMs = Date.now() - lastSeenMs;

  if (ageMs <= 5 * 60 * 1000) {
    return "online";
  }

  if (ageMs <= 60 * 60 * 1000) {
    return "idle";
  }

  return "offline";
}

export async function loadAdminConnectors(options?: {
  q?: string;
  status?: string;
  limit?: number;
}): Promise<AdminConnectorRow[]> {
  const admin = createAdminClient();
  const limit = options?.limit ?? 100;

  const { data, error } = await admin
    .from("connector_installations")
    .select(
      "id, household_id, name, platform, app_version, status, last_seen_at, last_scan_at, revoked_at, created_at"
    )
    .order("last_seen_at", {
      ascending: false,
      nullsFirst: false,
    })
    .limit(limit);

  if (error) {
    if (
      error.message.includes(
        "connector_installations"
      )
    ) {
      return [];
    }

    throw error;
  }

  const householdIds = [
    ...new Set(
      (data ?? []).map((row) => row.household_id)
    ),
  ];

  const { data: households } =
    householdIds.length > 0
      ? await admin
          .from("households")
          .select("id, name")
          .in("id", householdIds)
      : { data: [] as Array<{ id: string; name: string | null }> };

  const householdMap = new Map(
    (households ?? []).map((row) => [
      row.id,
      row.name,
    ])
  );

  let rows: AdminConnectorRow[] = (data ?? []).map(
    (row) => ({
      id: row.id,
      householdId: row.household_id,
      householdName:
        householdMap.get(row.household_id) ??
        null,
      name: row.name,
      platform: row.platform,
      appVersion: row.app_version,
      status: resolveConnectorPresence(
        row.last_seen_at,
        row.status,
        row.revoked_at
      ),
      lastSeenAt: row.last_seen_at,
      lastScanAt: row.last_scan_at,
      createdAt: row.created_at,
    })
  );

  if (options?.status?.trim()) {
    rows = rows.filter(
      (row) => row.status === options.status
    );
  }

  if (options?.q?.trim()) {
    const term = options.q.trim().toLowerCase();

    rows = rows.filter(
      (row) =>
        row.name.toLowerCase().includes(term) ||
        row.householdName?.toLowerCase().includes(term) ||
        row.platform?.toLowerCase().includes(term)
    );
  }

  return rows;
}

export async function loadAdminNotifications() {
  const admin = createAdminClient();

  const [
    recentProfiles,
    recentUpgrades,
    offlineConnectors,
    invitations,
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("id, full_name, created_at")
      .order("created_at", { ascending: false })
      .limit(5),

    admin
      .from("user_subscriptions")
      .select("user_id, plan, status, updated_at")
      .in("plan", ["pro", "family"])
      .order("updated_at", {
        ascending: false,
        nullsFirst: false,
      })
      .limit(5),

    admin
      .from("connector_installations")
      .select("id, name, last_seen_at")
      .eq("status", "active")
      .is("revoked_at", null)
      .order("last_seen_at", {
        ascending: true,
        nullsFirst: true,
      })
      .limit(5),

    loadAdminPendingInvitations(admin),
  ]);

  const notifications = [];

  for (const profile of recentProfiles.data ?? []) {
    const createdAt = profile.created_at;

    if (
      !createdAt ||
      Date.now() -
        new Date(createdAt).getTime() >
        7 * 24 * 60 * 60 * 1000
    ) {
      continue;
    }

    notifications.push({
      id: `signup-${profile.id}`,
      kind: "signup" as const,
      title: "New signup",
      description:
        profile.full_name?.trim() ||
        "A new user joined the platform.",
      href: `/admin/users?selected=${profile.id}`,
      createdAt,
      read: false,
    });
  }

  for (const upgrade of recentUpgrades.data ?? []) {
    if (!upgrade.updated_at) {
      continue;
    }

    notifications.push({
      id: `upgrade-${upgrade.user_id}-${upgrade.updated_at}`,
      kind: "upgrade" as const,
      title: "Pro upgrade",
      description: `${upgrade.plan} subscription is now ${upgrade.status}.`,
      href: `/admin/subscriptions`,
      createdAt: upgrade.updated_at,
      read: false,
    });
  }

  for (const connector of offlineConnectors.data ?? []) {
    if (
      connector.last_seen_at &&
      Date.now() -
        new Date(connector.last_seen_at).getTime() <
        60 * 60 * 1000
    ) {
      continue;
    }

    notifications.push({
      id: `connector-${connector.id}`,
      kind: "connector_offline" as const,
      title: "Connector offline",
      description: `${connector.name} has not checked in recently.`,
      href: "/admin/connectors",
      createdAt:
        connector.last_seen_at ??
        new Date().toISOString(),
      read: false,
    });
  }

  for (const invitation of invitations.slice(0, 5)) {
    notifications.push({
      id: `invite-${invitation.id}`,
      kind: "invitation_accepted" as const,
      title: "Pending invitation",
      description: `${invitation.email} has not finished setup yet.`,
      href: "/admin/users",
      createdAt: invitation.createdAt,
      read: false,
    });
  }

  return notifications
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime()
    )
    .slice(0, 12);
}
