import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function formatSupabaseError(
  error: unknown
) {
  if (!error || typeof error !== "object") {
    return { message: String(error) };
  }

  const record = error as Record<
    string,
    unknown
  >;

  return {
    message: record.message,
    code: record.code,
    details: record.details,
    hint: record.hint,
  };
}