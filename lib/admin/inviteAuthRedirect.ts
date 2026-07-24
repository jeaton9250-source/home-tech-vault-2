import "server-only";

import { absoluteUrl } from "@/lib/marketing/site";

export function buildCreateAccountInviteCallbackUrl() {
  return absoluteUrl("/auth/callback");
}

export function buildJoinHouseholdInviteCallbackUrl() {
  return absoluteUrl("/auth/callback");
}

/** @deprecated Use buildCreateAccountInviteCallbackUrl or buildJoinHouseholdInviteCallbackUrl */
export function buildInviteAuthCallbackUrl() {
  return buildJoinHouseholdInviteCallbackUrl();
}
