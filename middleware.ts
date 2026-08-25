import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  anonKeyLooksLikeJwt,
  resolveSupabaseAnonKey,
} from "@/lib/supabase/resolveAnonKey";

const PUBLIC_AUTH_PATHS = new Set([
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/set-password",
  "/auth/callback",
  "/auth/confirm",
  "/auth/error",
  "/invite/setup",
  "/onboarding/create-household",
]);

const PUBLIC_MARKETING_PREFIXES = [
  "/",
  "/pricing",
  "/about",
  "/features",
  "/how-it-works",
  "/faq",
  "/contact",
  "/privacy",
  "/terms",
  "/trust",
  "/security",
  "/demo",
  "/new-homeowners",
  "/knowledge",
  "/guides",
  "/compare",
];

function normalizePathname(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

function isPublicAuthPath(pathname: string) {
  const path = normalizePathname(pathname);

  if (PUBLIC_AUTH_PATHS.has(path)) {
    return true;
  }

  for (const route of PUBLIC_AUTH_PATHS) {
    if (path.startsWith(`${route}/`)) {
      return true;
    }
  }

  return false;
}

function isPublicMarketingPath(pathname: string) {
  const path = normalizePathname(pathname);

  if (path === "/") {
    return true;
  }

  return PUBLIC_MARKETING_PREFIXES.some(
    (prefix) =>
      prefix !== "/" &&
      (path === prefix || path.startsWith(`${prefix}/`))
  );
}

/**
 * Refresh the Supabase auth session on every matched request.
 * Public auth routes (including /auth/confirm) are never redirected away —
 * they must remain reachable without a session.
 */
export async function middleware(request: NextRequest) {
  const pathname = normalizePathname(request.nextUrl.pathname);
  const publicAuth = isPublicAuthPath(pathname);

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const anonKey = resolveSupabaseAnonKey();

    if (supabaseUrl && anonKey) {
      const supabase = createServerClient(
        supabaseUrl,
        anonKey,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },

            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => {
                request.cookies.set(name, value);
              });

              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              });

              cookiesToSet.forEach(
                ({ name, value, options }) => {
                  response.cookies.set(name, value, options);
                }
              );
            },
          },

          ...(anonKeyLooksLikeJwt(anonKey)
            ? {
                global: {
                  headers: {
                    Authorization: `Bearer ${anonKey}`,
                  },
                },
              }
            : {}),
        }
      );

      // Refresh session cookies.
      // This does NOT require a user to be signed in.
      await supabase.auth.getUser();
    }
  } catch (error) {
    console.error("Middleware session refresh failed:", error);
  }

  // Only protected/app routes get private cache headers.
  if (!publicAuth && !isPublicMarketingPath(pathname)) {
    response.headers.set(
      "Cache-Control",
      "private, no-store"
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on all paths except static assets and SEO metadata endpoints.
     * Keeping /sitemap.xml and /robots.txt out of middleware avoids
     * unnecessary auth cookie work and private cache headers.
     */
    "/((?!_next/static|_next/image|favicon.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
