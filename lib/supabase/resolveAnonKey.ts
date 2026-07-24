import "server-only";

function normalizeEnv(value: string | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

export function resolveSupabaseAnonKey() {
  const key = normalizeEnv(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (!key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable."
    );
  }

  if (key.startsWith("sb_secret_")) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY must not use a secret key. Use the publishable or anon key from the same Supabase project."
    );
  }

  return key;
}

export function anonKeyLooksLikeJwt(key: string) {
  return key.startsWith("eyJ");
}
