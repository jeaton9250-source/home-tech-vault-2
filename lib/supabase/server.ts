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

function readBearerToken(request: Request) {
  const authorization = request.headers.get("authorization")?.trim();

  if (!authorization) {
    return {
      present: false,
      token: null,
    };
  }

  const match = authorization.match(/^Bearer\s+([^\s]+)$/i);

  return {
    present: true,
    token: match?.[1] ?? null,
  };
}

/**
 * Authenticate either a normal browser-cookie request or a native-app request
 * carrying its Supabase access token. The returned client keeps the same user
 * token on database calls, so existing RLS remains the authorization boundary.
 */
export async function authenticateRequest(request: Request) {
  const cookieStore = await cookies();
  const bearer = readBearerToken(request);
  const globalHeaders: Record<string, string> = {};

  if (bearer.token) {
    globalHeaders.Authorization = `Bearer ${bearer.token}`;
  }

  const client = createServerClient(
    getSupabaseUrl(),
    resolveSupabaseAnonKey(),
    {
      cookies: createCookieHandlers(cookieStore),
      global: {
        headers: globalHeaders,
      },
    }
  );

  if (bearer.present && !bearer.token) {
    return {
      client,
      user: null,
      error: new Error("Invalid Authorization header."),
    };
  }

  const {
    data: { user },
    error,
  } = bearer.token
    ? await client.auth.getUser(bearer.token)
    : await client.auth.getUser();

  return {
    client,
    user,
    error,
  };
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
