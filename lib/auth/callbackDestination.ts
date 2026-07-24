import type { User } from "@supabase/supabase-js";

import {
  INVITATION_TYPE_CREATE_ACCOUNT,
  INVITATION_TYPE_JOIN_HOUSEHOLD,
  isUuid,
  normalizeInvitationType,
} from "@/lib/admin/invitationTypes";

const ALLOWED_NEXT_PATHS = new Set([
  "/invite/setup",
  "/onboarding/create-household",
  "/set-password",
  "/onboarding",
  "/dashboard",
]);

function isAllowedNextPath(path: string) {
  if (ALLOWED_NEXT_PATHS.has(path)) {
    return true;
  }

  return /^\/family\/accept\/[0-9a-f-]{36}$/i.test(path);
}

export function resolveInviteNextPath(
  requestedNext: string | null,
  metadata: Record<string, unknown> | undefined
) {
  const invitationType = normalizeInvitationType(
    metadata?.invitation_type
  );

  if (invitationType === INVITATION_TYPE_CREATE_ACCOUNT) {
    return "/invite/setup";
  }

  if (invitationType === INVITATION_TYPE_JOIN_HOUSEHOLD) {
    const token = metadata?.invitation_token;

    if (typeof token === "string" && isUuid(token)) {
      return `/family/accept/${token}`;
    }

    if (
      requestedNext &&
      isAllowedNextPath(requestedNext)
    ) {
      return requestedNext;
    }

    return "/set-password";
  }

  if (
    requestedNext &&
    isAllowedNextPath(requestedNext)
  ) {
    return requestedNext;
  }

  if (
    metadata?.onboarding_mode === "create_household"
  ) {
    return "/invite/setup";
  }

  return "/invite/setup";
}

export function resolveInviteNextPathFromUser(
  requestedNext: string | null,
  user: Pick<User, "user_metadata"> | null | undefined
) {
  return resolveInviteNextPath(
    requestedNext,
    (user?.user_metadata ?? undefined) as
      | Record<string, unknown>
      | undefined
  );
}
