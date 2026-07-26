import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { resolveHouseholdOwnerBilling } from "@/lib/permissions/householdOwnerBilling";
import { normalizeSubscriptionPlan } from "@/lib/permissions/subscriptionAccess";

export type TrustedNotificationType =
  | "connector_offline"
  | "connector_restored"
  | "device_offline"
  | "device_restored"
  | "new_device_discovered"
  | "pairing_completed"
  | "connector_attention"
  | "warranty_expiring"
  | "maintenance_due"
  | "maintenance_overdue";

export type TrustedNotificationInput = {
  admin: SupabaseClient;
  householdId: string;
  type: TrustedNotificationType;
  title: string;
  body: string;
  entityType?: string | null;
  entityId?: string | null;
  eventKey: string;
  adminOnly?: boolean;
};

function preferenceColumnForType(type: TrustedNotificationType) {
  switch (type) {
    case "connector_offline":
      return "connector_offline";
    case "connector_restored":
      return "connector_restored";
    case "device_offline":
      return "device_offline";
    case "device_restored":
      return "device_restored";
    case "new_device_discovered":
      return "new_device_discovered";
    case "warranty_expiring":
      return "warranty_reminders";
    case "maintenance_due":
    case "maintenance_overdue":
      return "maintenance_reminders";
    case "pairing_completed":
    case "connector_attention":
      return "connector_restored";
  }
}

function activePaid(plan: string | null, status: string | null) {
  const normalizedPlan = normalizeSubscriptionPlan(plan);
  const normalizedStatus = status?.trim().toLowerCase();
  return (
    (normalizedPlan === "pro" || normalizedPlan === "family") &&
    (normalizedStatus === "active" || normalizedStatus === "trialing")
  );
}

export async function createTrustedHouseholdNotification(input: TrustedNotificationInput) {
  const { data: household, error: householdError } = await input.admin
    .from("households")
    .select("id, owner_id")
    .eq("id", input.householdId)
    .maybeSingle();

  if (householdError || !household) {
    if (householdError) {
      console.error("[notifications] household lookup failed:", householdError.message);
    }
    return { created: 0 };
  }

  const billing = await resolveHouseholdOwnerBilling(input.admin, household.owner_id);
  if (!activePaid(billing.ownerPlan, billing.ownerStatus)) {
    return { created: 0 };
  }

  const { data: members, error: membersError } = await input.admin
    .from("household_members")
    .select("user_id, role")
    .eq("household_id", input.householdId);

  if (membersError) {
    console.error("[notifications] member lookup failed:", membersError.message);
    return { created: 0 };
  }

  const recipients = new Map<string, string>();
  recipients.set(household.owner_id, "owner");

  for (const member of members ?? []) {
    const role = String(member.role ?? "viewer").toLowerCase();
    if (input.adminOnly && role !== "owner" && role !== "admin") {
      continue;
    }
    recipients.set(String(member.user_id), role);
  }

  let created = 0;
  const preferenceColumn = preferenceColumnForType(input.type);

  for (const userId of recipients.keys()) {
    const { data: preference } = await input.admin
      .from("notification_preferences")
      .select(`${preferenceColumn}, in_app_enabled`)
      .eq("household_id", input.householdId)
      .eq("user_id", userId)
      .maybeSingle();

    const preferenceRow = preference as Record<
      string,
      boolean | null
    > | null;

    if (
      preferenceRow &&
      (preferenceRow.in_app_enabled === false ||
        preferenceRow[preferenceColumn] === false)
    ) {
      continue;
    }

    const { error } = await input.admin.from("notifications").insert({
      household_id: input.householdId,
      user_id: userId,
      type: input.type,
      title: input.title,
      body: input.body,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      event_key: `${input.eventKey}:${userId}`,
    });

    if (!error) {
      created += 1;
      continue;
    }

    if (!error.message.toLowerCase().includes("duplicate")) {
      console.error("[notifications] insert failed:", error.message);
    }
  }

  return { created };
}
