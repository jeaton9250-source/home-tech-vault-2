import type { EmailOtpType } from "@supabase/supabase-js";

import { getSiteUrl } from "@/lib/marketing/site";

export function buildAuthConfirmUrl(input: {
  tokenHash: string;
  type: EmailOtpType;
  next?: string | null;
}) {
  const confirmUrl = new URL(
    "/auth/confirm",
    getSiteUrl()
  );

  confirmUrl.searchParams.set(
    "token_hash",
    input.tokenHash.trim()
  );
  confirmUrl.searchParams.set("type", input.type);

  if (input.next?.trim()) {
    confirmUrl.searchParams.set(
      "next",
      input.next.trim()
    );
  }

  return confirmUrl.toString();
}
