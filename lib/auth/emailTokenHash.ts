export function tokenLooksLikeJwt(value: string) {
  const normalized = value.trim();

  return (
    normalized.startsWith("eyJ") ||
    normalized.split(".").length === 3
  );
}

export function assertValidEmailTokenHash(
  value: unknown
): asserts value is string {
  if (
    typeof value !== "string" ||
    value.trim().length < 20
  ) {
    throw new Error(
      "Supabase did not return a valid invitation token hash."
    );
  }

  const normalized = value.trim();

  if (tokenLooksLikeJwt(normalized)) {
    throw new Error(
      "Invitation token hash was incorrectly populated with a JWT."
    );
  }
}

export function describeEmailTokenHash(
  value: unknown
) {
  if (typeof value !== "string") {
    return {
      hasTokenHash: false,
      tokenLength: null,
      tokenLooksLikeJwt: null,
    };
  }

  const normalized = value.trim();

  return {
    hasTokenHash: normalized.length > 0,
    tokenLength: normalized.length,
    tokenLooksLikeJwt: tokenLooksLikeJwt(normalized),
  };
}
