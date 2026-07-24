import "server-only";

import { absoluteUrl } from "@/lib/marketing/site";

export function buildInviteAuthCallbackUrl() {
  const next = encodeURIComponent("/set-password");

  return absoluteUrl(`/auth/callback?next=${next}`);
}
