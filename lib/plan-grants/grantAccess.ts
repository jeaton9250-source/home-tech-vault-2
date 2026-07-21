import type {
  ActivePlanGrant,
  AdminGrantPlan,
  PlanGrantInput,
} from "@/lib/plan-grants/types";

export function isGrantProvidingAccess(
  grant: Pick<
    PlanGrantInput,
    "status" | "startsAt" | "expiresAt"
  > | null
): grant is PlanGrantInput {
  if (!grant || grant.status !== "active") {
    return false;
  }

  const startsAt = new Date(grant.startsAt);

  if (
    Number.isNaN(startsAt.getTime()) ||
    startsAt.getTime() > Date.now()
  ) {
    return false;
  }

  if (!grant.expiresAt) {
    return true;
  }

  const expiresAt = new Date(grant.expiresAt);

  return (
    !Number.isNaN(expiresAt.getTime()) &&
    expiresAt.getTime() > Date.now()
  );
}

export function isGrantLogicallyExpired(
  grant: Pick<
    ActivePlanGrant,
    "status" | "expiresAt"
  >
) {
  if (grant.status !== "active") {
    return grant.status === "expired";
  }

  if (!grant.expiresAt) {
    return false;
  }

  const expiresAt = new Date(grant.expiresAt);

  return (
    !Number.isNaN(expiresAt.getTime()) &&
    expiresAt.getTime() <= Date.now()
  );
}

export function getGrantDisplayLabel(
  plan: AdminGrantPlan
) {
  return plan === "family"
    ? "Complimentary Family access"
    : "Complimentary Pro access";
}

export function computeExpirationFromDuration(options: {
  durationId: string;
  customExpiresAt?: string | null;
  startsAt?: Date;
}) {
  const startsAt =
    options.startsAt ?? new Date();

  if (options.durationId === "none") {
    return null;
  }

  if (options.durationId === "custom") {
    const raw =
      options.customExpiresAt?.trim();

    if (!raw) {
      return null;
    }

    const parsed = new Date(raw);

    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed.toISOString();
  }

  const durationMap: Record<string, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "1y": 365,
  };

  const days = durationMap[options.durationId];

  if (!days) {
    return null;
  }

  const expiresAt = new Date(startsAt);
  expiresAt.setUTCDate(
    expiresAt.getUTCDate() + days
  );

  return expiresAt.toISOString();
}

export function toSafeGrantSummary(
  grant: ActivePlanGrant | null
) {
  if (!grant || !isGrantProvidingAccess(grant)) {
    return null;
  }

  return {
    plan: grant.plan,
    expiresAt: grant.expiresAt,
    reason: grant.reason,
  };
}

export function mapGrantRow(row: {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  starts_at: string;
  expires_at: string | null;
  reason: string;
  notes: string | null;
  granted_by: string;
  revoked_at: string | null;
  created_at: string;
}): ActivePlanGrant {
  return {
    id: row.id,
    userId: row.user_id,
    plan: row.plan as ActivePlanGrant["plan"],
    status: row.status as ActivePlanGrant["status"],
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    reason: row.reason,
    notes: row.notes,
    grantedBy: row.granted_by,
    revokedAt: row.revoked_at,
    createdAt: row.created_at,
  };
}
