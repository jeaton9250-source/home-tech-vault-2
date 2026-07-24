import "server-only";

import { absoluteUrl } from "@/lib/marketing/site";

export function buildCreateAccountInviteCallbackUrl() {
  return absoluteUrl("/auth/callback");
}

export function buildJoinHouseholdInviteCallbackUrl() {
  const next = encodeURIComponent("/set-password");

  return absoluteUrl(`/auth/callback?next=${next}`);
}

/** @deprecated Use buildCreateAccountInviteCallbackUrl or buildJoinHouseholdInviteCallbackUrl */
export function buildInviteAuthCallbackUrl() {
  return buildJoinHouseholdInviteCallbackUrl();
}
