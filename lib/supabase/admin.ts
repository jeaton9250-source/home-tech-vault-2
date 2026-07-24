import "server-only";

import { createClient } from "@supabase/supabase-js";

import {
  resolveSupabaseAdminKey,
} from "@/lib/supabase/resolveAdminKey";

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const { key: supabaseSecretKey } =
    resolveSupabaseAdminKey();

  if (!supabaseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL environment variable."
    );
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
