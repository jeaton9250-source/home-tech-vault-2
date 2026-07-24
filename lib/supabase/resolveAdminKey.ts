import "server-only";

export type SupabaseAdminKeySource =
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "SUPABASE_SECRET_KEY";

export type ResolvedSupabaseAdminKey = {
  key: string;
  source: SupabaseAdminKeySource;
};

function normalizeEnv(value: string | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function isLikelySupabaseApiKey(value: string) {
  if (value.startsWith("eyJ")) {
    return true;
  }

  if (value.startsWith("sb_secret_")) {
    return true;
  }

  return false;
}

export function resolveSupabaseAdminKey(): ResolvedSupabaseAdminKey {
  const candidates: Array<
    [SupabaseAdminKeySource, string | null]
  > = [
    [
      "SUPABASE_SERVICE_ROLE_KEY",
      normalizeEnv(
        process.env.SUPABASE_SERVICE_ROLE_KEY
      ),
    ],
    [
      "SUPABASE_SECRET_KEY",
      normalizeEnv(process.env.SUPABASE_SECRET_KEY),
    ],
  ];

  for (const [source, value] of candidates) {
    if (value && isLikelySupabaseApiKey(value)) {
      return { key: value, source };
    }
  }

  const configuredSources = candidates
    .filter(([, value]) => value)
    .map(([source]) => source);

  if (configuredSources.length > 0) {
    throw new Error(
      `Supabase admin key env var(s) ${configuredSources.join(", ")} are set but do not look like valid Supabase API keys. Copy the current service_role secret from Supabase Dashboard → Settings → API.`
    );
  }

  throw new Error(
    "Missing SUPABASE_SERVICE_ROLE_KEY environment variable."
  );
}

export function isSupabaseJwtConfigurationError(
  message: string
) {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("invalid jwt") ||
    normalized.includes("unrecognized jwt kid") ||
    normalized.includes(
      "signing method hs256 is invalid"
    ) ||
    normalized.includes("token is unverifiable")
  );
}

export function formatSupabaseJwtConfigurationError(
  source?: SupabaseAdminKeySource
) {
  const sourceHint = source
    ? ` The server used ${source}.`
    : "";

  return `Supabase server credentials are out of date or misconfigured.${sourceHint} In Vercel, set SUPABASE_SERVICE_ROLE_KEY to the current service_role secret from Supabase Dashboard → Settings → API, remove any incorrect SUPABASE_SECRET_KEY value, redeploy, then resend the invitation.`;
}
