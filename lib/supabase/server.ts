import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import {
  anonKeyLooksLikeJwt,
  resolveSupabaseAnonKey,
} from "@/lib/supabase/resolveAnonKey";

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL environment variable."
    );
  }

  return url;
}

function createCookieHandlers(
  cookieStore: Awaited<ReturnType<typeof cookies>>
) {
  return {
    getAll() {
      return cookieStore.getAll();
    },

    setAll(
      cookiesToSet: Array<{
        name: string;
        value: string;
        options?: Parameters<
          typeof cookieStore.set
        >[2];
      }>
    ) {
      try {
        cookiesToSet.forEach(
          ({ name, value, options }) => {
            cookieStore.set(name, value, options);
          }
        );
      } catch {
        // Cookie updates may be handled by proxy/middleware.
      }
    },
  };
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getSupabaseUrl(),
    resolveSupabaseAnonKey(),
    {
      cookies: createCookieHandlers(cookieStore),
    }
  );
}

/**
 * OTP verification must not inherit a stale browser session JWT as
 * Authorization Bearer. Pin the anon/publishable key for verify calls
 * while still writing the new session back to cookies.
 */
export async function createAuthVerificationClient() {
  const cookieStore = await cookies();
  const anonKey = resolveSupabaseAnonKey();
  const globalHeaders: Record<string, string> = {};

  if (anonKeyLooksLikeJwt(anonKey)) {
    globalHeaders.Authorization = `Bearer ${anonKey}`;
  }

  return createServerClient(
    getSupabaseUrl(),
    anonKey,
    {
      cookies: createCookieHandlers(cookieStore),
      global: {
        headers: globalHeaders,
      },
    }
  );
}