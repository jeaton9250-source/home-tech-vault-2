import { getSiteUrl } from "@/lib/marketing/site";

const TOKEN_HASH_CONFIRM_PREFIX =
  "/auth/confirm?token_hash=";

export function assertCreateAccountSecureActionUrl(
  secureActionUrl: string
) {
  if (secureActionUrl.includes("/login")) {
    throw new Error(
      "Create-account invitation attempted to use a login URL."
    );
  }

  let parsed: URL;

  try {
    parsed = new URL(secureActionUrl);
  } catch {
    throw new Error(
      "Create-account invitation email URL is invalid."
    );
  }

  const expectedHost = new URL(getSiteUrl()).host;

  if (parsed.host !== expectedHost) {
    throw new Error(
      `Create-account invitation email URL must use ${expectedHost}.`
    );
  }

  if (
    !parsed.pathname.endsWith("/auth/confirm") ||
    !parsed.searchParams.get("token_hash") ||
    parsed.searchParams.get("type") !== "invite"
  ) {
    throw new Error(
      "Create-account invitation email URL must use the TokenHash auth confirm route."
    );
  }
}

export function logCreateAccountEmailLinkType(input: {
  route: string;
  secureActionUrl: string;
}) {
  let host: string | null = null;

  try {
    host = new URL(input.secureActionUrl).host;
  } catch {
    host = null;
  }

  console.info("Create account email link type", {
    route: input.route,
    usesTokenHash:
      input.secureActionUrl.includes(
        TOKEN_HASH_CONFIRM_PREFIX
      ),
    host,
  });
}

export function usesTokenHashConfirmUrl(
  secureActionUrl: string
) {
  return secureActionUrl.includes(
    TOKEN_HASH_CONFIRM_PREFIX
  );
}
