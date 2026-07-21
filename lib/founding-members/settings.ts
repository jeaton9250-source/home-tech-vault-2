import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { recordPlatformAdminAudit } from "@/lib/account-admin/audit";
import { FOUNDING_MEMBERS_PROGRAM_KEY } from "@/lib/founding-members/constants";
import {
  loadFoundingProgramSettings,
  mapSettingsRow,
} from "@/lib/founding-members/loaders";
import type { FoundingProgramSettings } from "@/lib/founding-members/types";

export class FoundingProgramSettingsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FoundingProgramSettingsError";
  }
}

export async function updateFoundingProgramSettings(
  admin: SupabaseClient,
  options: {
    actorId: string;
    confirm: boolean;
    enabled?: boolean;
    capacity?: number;
    publicMessage?: string;
  }
): Promise<FoundingProgramSettings> {
  if (!options.confirm) {
    throw new FoundingProgramSettingsError(
      "Confirmation is required."
    );
  }

  const current =
    await loadFoundingProgramSettings(admin);
  const update: Record<string, unknown> = {
    updated_by: options.actorId,
  };

  if (typeof options.enabled === "boolean") {
    update.enabled = options.enabled;
  }

  if (typeof options.capacity === "number") {
    if (
      options.capacity < 1 ||
      options.capacity > 50
    ) {
      throw new FoundingProgramSettingsError(
        "Capacity must be between 1 and 50."
      );
    }

    update.capacity = options.capacity;
  }

  if (typeof options.publicMessage === "string") {
    const trimmed =
      options.publicMessage.trim();

    if (!trimmed) {
      throw new FoundingProgramSettingsError(
        "Public message cannot be empty."
      );
    }

    update.public_message = trimmed;
  }

  const { data, error } = await admin
    .from("platform_program_settings")
    .update(update)
    .eq("program_key", FOUNDING_MEMBERS_PROGRAM_KEY)
    .select(
      "program_key, enabled, capacity, default_plan, default_duration, public_message, updated_at, updated_by"
    )
    .single();

  if (error || !data) {
    throw (
      error ||
      new Error(
        "Unable to update program settings."
      )
    );
  }

  if (
    typeof options.enabled === "boolean" &&
    options.enabled !== current.enabled
  ) {
    await recordPlatformAdminAudit(admin, {
      eventType: options.enabled
        ? "founding_program_enabled"
        : "founding_program_paused",
      actorId: options.actorId,
      metadata: {
        previousEnabled: current.enabled,
        enabled: options.enabled,
      },
    });
  }

  if (
    typeof options.capacity === "number" &&
    options.capacity !== current.capacity
  ) {
    await recordPlatformAdminAudit(admin, {
      eventType:
        "founding_program_capacity_changed",
      actorId: options.actorId,
      metadata: {
        previousCapacity: current.capacity,
        capacity: options.capacity,
      },
    });
  }

  return mapSettingsRow(data);
}
