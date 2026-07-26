import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";

import { loadActivePlanGrantForUser } from "@/lib/plan-grants/loadActiveGrant";
import { isGrantProvidingAccess } from "@/lib/plan-grants/grantAccess";
import { loadHouseholdMembershipForUser } from "@/lib/permissions/householdMembership";
import { resolveHouseholdOwnerBilling } from "@/lib/permissions/householdOwnerBilling";
import { normalizeSubscriptionPlan } from "@/lib/permissions/subscriptionAccess";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { IosApiError } from "@/lib/ios-api/errors";

export type IosAccessRole = "owner" | "admin" | "member" | "viewer" | "none";
export type IosAccessPlan = "free" | "pro" | "family";
export type IosSubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "expired"
  | "unknown";

export type IosConnectorAccess = {
  plan: IosAccessPlan;
  subscription_status: IosSubscriptionStatus;
  role: IosAccessRole;
  can_view: boolean;
  can_pair: boolean;
  can_revoke: boolean;
  can_trigger_scan: boolean;
  can_import_devices: boolean;
  can_manage_notifications?: boolean;
};

export type IosHouseholdContext = {
  admin: SupabaseClient;
  user: User;
  userId: string;
  householdId: string;
  role: IosAccessRole;
  access: IosConnectorAccess;
};

function parseBearerToken(request: Request) {
  const header = request.headers.get("authorization");
  const match = header?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function normalizeStatus(value: string | null | undefined): IosSubscriptionStatus {
  const normalized = value?.trim().toLowerCase();

  if (
    normalized === "active" ||
    normalized === "trialing" ||
    normalized === "past_due" ||
    normalized === "canceled" ||
    normalized === "incomplete" ||
    normalized === "expired"
  ) {
    return normalized;
  }

  return "unknown";
}

function isActivePaidStatus(status: IosSubscriptionStatus) {
  return status === "active" || status === "trialing";
}

function normalizeRole(value: string | null | undefined): IosAccessRole {
  const normalized = value?.trim().toLowerCase();

  if (normalized === "owner" || normalized === "admin") {
    return normalized;
  }

  if (normalized === "member" || normalized === "viewer") {
    return normalized;
  }

  return "none";
}

export async function requireIosUser(request: Request, admin: SupabaseClient) {
  const token = parseBearerToken(request);

  if (token) {
    const { data, error } = await admin.auth.getUser(token);

    if (error || !data.user) {
      throw new IosApiError(
        "SESSION_EXPIRED",
        "Your session has expired. Please sign in again.",
        401
      );
    }

    return data.user;
  }

  const cookieClient = await createClient();
  const { data, error } = await cookieClient.auth.getUser();

  if (error || !data.user) {
    throw new IosApiError(
      "NOT_AUTHENTICATED",
      "Sign in is required.",
      401
    );
  }

  return data.user;
}

async function resolveAccess(input: {
  admin: SupabaseClient;
  userId: string;
  householdId: string;
}) {
  const membership = await loadHouseholdMembershipForUser(
    input.admin,
    input.userId,
    input.householdId
  );

  if (!membership.membership || membership.householdId !== input.householdId) {
    throw new IosApiError(
      "HOUSEHOLD_ACCESS_DENIED",
      "You do not have access to this household.",
      403
    );
  }

  const { data: household, error: householdError } = await input.admin
    .from("households")
    .select("id, owner_id")
    .eq("id", input.householdId)
    .maybeSingle();

  if (householdError) {
    throw householdError;
  }

  if (!household) {
    throw new IosApiError("HOUSEHOLD_ACCESS_DENIED", "Household not found.", 403);
  }

  const [ownerBilling, personalGrant] = await Promise.all([
    resolveHouseholdOwnerBilling(input.admin, household.owner_id),
    loadActivePlanGrantForUser(input.admin, input.userId),
  ]);

  let plan = normalizeSubscriptionPlan(ownerBilling.ownerPlan) as IosAccessPlan;
  let status = normalizeStatus(ownerBilling.ownerStatus);

  if (!isActivePaidStatus(status) || plan === "free") {
    if (personalGrant && isGrantProvidingAccess(personalGrant)) {
      plan = normalizeSubscriptionPlan(personalGrant.plan) as IosAccessPlan;
      status = "active";
    } else {
      plan = "free";
    }
  }

  const paid = (plan === "pro" || plan === "family") && isActivePaidStatus(status);
  const role = normalizeRole(membership.rawHouseholdRole ?? membership.membership.role);
  const isAdmin = role === "owner" || role === "admin";
  const isMutator = isAdmin || role === "member";

  const access: IosConnectorAccess = {
    plan,
    subscription_status: status,
    role,
    can_view: paid && role !== "none",
    can_pair: paid && isAdmin,
    can_revoke: paid && isAdmin,
    can_trigger_scan: paid && isAdmin,
    can_import_devices: paid && isMutator,
    can_manage_notifications: paid && role !== "none",
  };

  return { access, role };
}

export async function requireIosHouseholdContext(
  request: Request,
  householdIdInput: string | null | undefined,
  options?: {
    requirePaid?: boolean;
    requireAdmin?: boolean;
    requireMutator?: boolean;
  }
): Promise<IosHouseholdContext> {
  const householdId = householdIdInput?.trim();

  if (!householdId) {
    throw new IosApiError(
      "HOUSEHOLD_REQUIRED",
      "A household_id is required.",
      400
    );
  }

  const admin = createAdminClient();
  const user = await requireIosUser(request, admin);
  const { access, role } = await resolveAccess({
    admin,
    userId: user.id,
    householdId,
  });

  if (options?.requirePaid && !access.can_view) {
    throw new IosApiError(
      access.plan === "free" ? "PAID_PLAN_REQUIRED" : "SUBSCRIPTION_INACTIVE",
      "Smart Connector requires an active Pro or Family plan.",
      403,
      { access }
    );
  }

  if (options?.requireAdmin && !access.can_pair) {
    throw new IosApiError(
      "ROLE_NOT_ALLOWED",
      "Household admin permission is required.",
      403,
      { access }
    );
  }

  if (options?.requireMutator && !access.can_import_devices) {
    throw new IosApiError(
      "ROLE_NOT_ALLOWED",
      "Household edit permission is required.",
      403,
      { access }
    );
  }

  return {
    admin,
    user,
    userId: user.id,
    householdId,
    role,
    access,
  };
}
