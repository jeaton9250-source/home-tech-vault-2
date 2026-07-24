import "server-only";

import { getSiteUrl } from "@/lib/marketing/site";

/** Post-verification destination passed to Supabase invite APIs. */
export function buildCreateAccountInviteRedirectUrl() {
  return `${getSiteUrl()}/invite/setup`;
}

/** PKCE/OAuth callback — not used for invite email links. */
export function buildAuthCallbackUrl() {
  return `${getSiteUrl()}/auth/callback`;
}

export function buildJoinHouseholdInviteRedirectUrl() {
  return `${getSiteUrl()}/set-password`;
}

/** @deprecated Use buildCreateAccountInviteRedirectUrl */
export function buildCreateAccountInviteCallbackUrl() {
  return buildAuthCallbackUrl();
}

/** @deprecated Use buildJoinHouseholdInviteRedirectUrl */
export function buildJoinHouseholdInviteCallbackUrl() {
  return buildAuthCallbackUrl();
}

/** @deprecated Use buildJoinHouseholdInviteRedirectUrl */
export function buildInviteAuthCallbackUrl() {
  return buildAuthCallbackUrl();
}
