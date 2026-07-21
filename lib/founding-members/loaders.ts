import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  FOUNDING_MEMBERS_DEFAULT_CAPACITY,
  FOUNDING_MEMBERS_DEFAULT_PUBLIC_MESSAGE,
  FOUNDING_MEMBERS_PROGRAM_KEY,
} from "@/lib/founding-members/constants";
import type {
  FoundingMemberRecord,
  FoundingProgramAvailability,
  FoundingProgramSettings,
  PublicFoundingProgramSummary,
} from "@/lib/founding-members/types";

function mapSettingsRow(row: {
  program_key: string;
  enabled: boolean;
  capacity: number;
  default_plan: string;
  default_duration: string;
  public_message: string;
  updated_at: string;
  updated_by: string | null;
}): FoundingProgramSettings {
  return {
    programKey: row.program_key,
    enabled: row.enabled,
    capacity: row.capacity,
    defaultPlan:
      row.default_plan === "family"
        ? "family"
        : "pro",
    defaultDuration: row.default_duration,
    publicMessage: row.public_message,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

function mapMemberRow(row: {
  id: string;
  user_id: string;
  plan_grant_id: string | null;
  member_number: number;
  status: string;
  benefit_mode: string;
  enrolled_at: string;
  enrolled_by: string;
  removed_at: string | null;
  removed_by: string | null;
  removal_reason: string | null;
  notes: string | null;
}): FoundingMemberRecord {
  return {
    id: row.id,
    userId: row.user_id,
    planGrantId: row.plan_grant_id,
    memberNumber: row.member_number,
    status:
      row.status === "removed"
        ? "removed"
        : "active",
    benefitMode:
      row.benefit_mode as FoundingMemberRecord["benefitMode"],
    enrolledAt: row.enrolled_at,
    enrolledBy: row.enrolled_by,
    removedAt: row.removed_at,
    removedBy: row.removed_by,
    removalReason: row.removal_reason,
    notes: row.notes,
  };
}

export function resolveProgramAvailability(options: {
  enabled: boolean;
  capacity: number;
  enrolledCount: number;
}): FoundingProgramAvailability {
  if (!options.enabled) {
    return "paused";
  }

  if (options.enrolledCount >= options.capacity) {
    return "full";
  }

  return "open";
}

export async function loadFoundingProgramSettings(
  admin: SupabaseClient
): Promise<FoundingProgramSettings> {
  const { data, error } = await admin
    .from("platform_program_settings")
    .select(
      "program_key, enabled, capacity, default_plan, default_duration, public_message, updated_at, updated_by"
    )
    .eq("program_key", FOUNDING_MEMBERS_PROGRAM_KEY)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return {
      programKey: FOUNDING_MEMBERS_PROGRAM_KEY,
      enabled: true,
      capacity: FOUNDING_MEMBERS_DEFAULT_CAPACITY,
      defaultPlan: "pro",
      defaultDuration: "none",
      publicMessage:
        FOUNDING_MEMBERS_DEFAULT_PUBLIC_MESSAGE,
      updatedAt: new Date().toISOString(),
      updatedBy: null,
    };
  }

  return mapSettingsRow(data);
}

export async function countFoundingMemberSlotsUsed(
  admin: SupabaseClient
) {
  const { count, error } = await admin
    .from("platform_founding_members")
    .select("id", {
      count: "exact",
      head: true,
    });

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function countActiveFoundingMembers(
  admin: SupabaseClient
) {
  const { count, error } = await admin
    .from("platform_founding_members")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("status", "active");

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function loadPublicFoundingProgramSummary(
  admin: SupabaseClient
): Promise<PublicFoundingProgramSummary> {
  const settings =
    await loadFoundingProgramSettings(admin);
  const enrolledCount =
    await countFoundingMemberSlotsUsed(admin);

  const remainingSpots = Math.max(
    settings.capacity - enrolledCount,
    0
  );

  return {
    programName: "Home Tech Vault Founding Members",
    availability: resolveProgramAvailability({
      enabled: settings.enabled,
      capacity: settings.capacity,
      enrolledCount,
    }),
    capacity: settings.capacity,
    enrolledCount,
    remainingSpots,
    publicMessage: settings.publicMessage,
  };
}

export async function loadFoundingMemberForUser(
  admin: SupabaseClient,
  userId: string
): Promise<FoundingMemberRecord | null> {
  const { data, error } = await admin
    .from("platform_founding_members")
    .select(
      "id, user_id, plan_grant_id, member_number, status, benefit_mode, enrolled_at, enrolled_by, removed_at, removed_by, removal_reason, notes"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapMemberRow(data) : null;
}

export async function getNextAvailableMemberNumber(
  admin: SupabaseClient,
  capacity: number
): Promise<number | null> {
  const { data, error } = await admin
    .from("platform_founding_members")
    .select("member_number");

  if (error) {
    throw error;
  }

  const used = new Set(
    (data ?? []).map((row) => row.member_number)
  );

  for (let number = 1; number <= capacity; number += 1) {
    if (!used.has(number)) {
      return number;
    }
  }

  return null;
}

export { mapMemberRow, mapSettingsRow };
