import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  computeExpirationFromDuration,
  isGrantLogicallyExpired,
  isGrantProvidingAccess,
} from "@/lib/plan-grants/grantAccess";
import type {
  ActivePlanGrant,
  AdminGrantPlan,
  PlanGrantReason,
} from "@/lib/plan-grants/types";
import {
  loadActivePlanGrantForUser,
  loadLatestPlanGrantForUser,
} from "@/lib/plan-grants/loadActiveGrant";
import { mapGrantRow } from "@/lib/plan-grants/grantAccess";
import { PLAN_GRANT_REASONS } from "@/lib/plan-grants/types";

export class PlanGrantValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlanGrantValidationError";
  }
}

export type CreatePlanGrantInput = {
  targetUserId: string;
  actorId: string;
  plan: AdminGrantPlan;
  durationId: string;
  customExpiresAt?: string | null;
  reason: string;
  notes?: string | null;
  confirm: boolean;
};

export type RevokePlanGrantInput = {
  targetUserId: string;
  actorId: string;
  revocationReason?: string | null;
  confirm: boolean;
};

function assertValidReason(reason: string) {
  const trimmed = reason.trim();

  if (!trimmed) {
    throw new PlanGrantValidationError(
      "A reason is required."
    );
  }

  if (
    !PLAN_GRANT_REASONS.includes(
      trimmed as PlanGrantReason
    )
  ) {
    throw new PlanGrantValidationError(
      "Invalid grant reason."
    );
  }
}

async function insertGrantEvent(
  client: SupabaseClient,
  event: {
    grantId: string | null;
    userId: string;
    eventType:
      | "created"
      | "replaced"
      | "revoked"
      | "expired";
    plan: AdminGrantPlan;
    actorId: string | null;
    reason: string | null;
    expiresAt: string | null;
    metadata?: Record<string, unknown>;
  }
) {
  const { error } = await client
    .from("platform_plan_grant_events")
    .insert({
      grant_id: event.grantId,
      user_id: event.userId,
      event_type: event.eventType,
      plan: event.plan,
      actor_id: event.actorId,
      reason: event.reason,
      expires_at: event.expiresAt,
      metadata: event.metadata ?? {},
    });

  if (error) {
    throw error;
  }
}

async function revokeActiveGrant(
  client: SupabaseClient,
  options: {
    userId: string;
    actorId: string;
    revocationReason?: string | null;
    eventType: "replaced" | "revoked";
  }
): Promise<ActivePlanGrant | null> {
  const activeGrant =
    await loadActivePlanGrantForUser(
      client,
      options.userId
    );

  if (!activeGrant) {
    const latestGrant =
      await loadLatestPlanGrantForUser(
        client,
        options.userId
      );

    if (
      latestGrant &&
      isGrantLogicallyExpired(latestGrant)
    ) {
      const expiredGrantId = latestGrant.id;

      const { data, error } = await client
        .from("platform_plan_grants")
        .update({
          status: "expired",
        })
        .eq("id", expiredGrantId)
        .select(
          "id, user_id, plan, status, starts_at, expires_at, reason, notes, granted_by, revoked_at, created_at"
        )
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        await insertGrantEvent(client, {
          grantId: data.id,
          userId: options.userId,
          eventType: "expired",
          plan: latestGrant.plan,
          actorId: null,
          reason: latestGrant.reason,
          expiresAt: latestGrant.expiresAt,
        });
      }
    }

    return null;
  }

  const now = new Date().toISOString();

  const { data, error } = await client
    .from("platform_plan_grants")
    .update({
      status: "revoked",
      revoked_at: now,
      revoked_by: options.actorId,
      revocation_reason:
        options.revocationReason?.trim() ||
        null,
    })
    .eq("id", activeGrant.id)
    .select(
      "id, user_id, plan, status, starts_at, expires_at, reason, notes, granted_by, revoked_at, created_at"
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    await insertGrantEvent(client, {
      grantId: data.id,
      userId: options.userId,
      eventType: options.eventType,
      plan: activeGrant.plan,
      actorId: options.actorId,
      reason: activeGrant.reason,
      expiresAt: activeGrant.expiresAt,
      metadata: {
        revocationReason:
          options.revocationReason ?? null,
      },
    });
  }

  return data ? mapGrantRow(data) : null;
}

export async function createPlatformPlanGrant(
  client: SupabaseClient,
  input: CreatePlanGrantInput
): Promise<ActivePlanGrant> {
  if (!input.confirm) {
    throw new PlanGrantValidationError(
      "Confirmation is required."
    );
  }

  assertValidReason(input.reason);

  const expiresAt =
    computeExpirationFromDuration({
      durationId: input.durationId,
      customExpiresAt:
        input.customExpiresAt,
    });

  if (
    input.durationId === "custom" &&
    !expiresAt
  ) {
    throw new PlanGrantValidationError(
      "Custom expiration is required."
    );
  }

  if (expiresAt) {
    const expirationDate = new Date(expiresAt);

    if (
      Number.isNaN(expirationDate.getTime()) ||
      expirationDate.getTime() <= Date.now()
    ) {
      throw new PlanGrantValidationError(
        "Expiration must be in the future."
      );
    }
  }

  const hadActiveGrant =
    await loadActivePlanGrantForUser(
      client,
      input.targetUserId
    );

  if (hadActiveGrant) {
    await revokeActiveGrant(client, {
      userId: input.targetUserId,
      actorId: input.actorId,
      revocationReason:
        "Replaced by a new admin grant.",
      eventType: "replaced",
    });
  }

  const { data, error } = await client
    .from("platform_plan_grants")
    .insert({
      user_id: input.targetUserId,
      plan: input.plan,
      status: "active",
      starts_at: new Date().toISOString(),
      expires_at: expiresAt,
      reason: input.reason.trim(),
      notes: input.notes?.trim() || null,
      granted_by: input.actorId,
    })
    .select(
      "id, user_id, plan, status, starts_at, expires_at, reason, notes, granted_by, revoked_at, created_at"
    )
    .single();

  if (error) {
    throw error;
  }

  const grant = mapGrantRow(data);

  await insertGrantEvent(client, {
    grantId: grant.id,
    userId: input.targetUserId,
    eventType: hadActiveGrant
      ? "replaced"
      : "created",
    plan: grant.plan,
    actorId: input.actorId,
    reason: grant.reason,
    expiresAt: grant.expiresAt,
    metadata: {
      notes: grant.notes,
    },
  });

  return grant;
}

export async function revokePlatformPlanGrant(
  client: SupabaseClient,
  input: RevokePlanGrantInput
): Promise<ActivePlanGrant | null> {
  if (!input.confirm) {
    throw new PlanGrantValidationError(
      "Confirmation is required."
    );
  }

  return revokeActiveGrant(client, {
    userId: input.targetUserId,
    actorId: input.actorId,
    revocationReason:
      input.revocationReason,
    eventType: "revoked",
  });
}
