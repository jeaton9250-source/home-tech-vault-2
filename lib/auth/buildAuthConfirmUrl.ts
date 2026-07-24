import type { EmailOtpType } from "@supabase/supabase-js";

import { absoluteUrl } from "@/lib/marketing/site";

export function buildAuthConfirmUrl(input: {
  tokenHash: string;
  type: EmailOtpType;
  next?: string | null;
}) {
  const params = new URLSearchParams({
    token_hash: input.tokenHash,
    type: input.type,
  });

  if (input.next?.trim()) {
    params.set("next", input.next.trim());
  }

  return absoluteUrl(
    `/auth/confirm?${params.toString()}`
  );
}
