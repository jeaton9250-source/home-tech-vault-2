import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export function getSupportAdminClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl) {
    return {
      ok: false as const,
      code: "missing_supabase_url" as const,
    };
  }

  if (!serviceRoleKey) {
    return {
      ok: false as const,
      code: "missing_service_role_key" as const,
    };
  }

  return {
    ok: true as const,
    admin: createAdminClient(),
  };
}
