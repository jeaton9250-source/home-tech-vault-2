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

export async function middleware(request: NextRequest) {
  const pathname = normalizePathname(request.nextUrl.pathname);

  const publicAuth = isPublicAuthPath(pathname);
  const publicMarketing = isPublicMarketingPath(pathname);

  let response = NextResponse.next({
    request,
  });

  // Public marketing pages do not need an auth refresh.
  if (!publicMarketing) {
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

              setAll(cookiesToSet, headers) {
                cookiesToSet.forEach(({ name, value }) => {
                  request.cookies.set(name, value);
                });

                response = NextResponse.next({
                  request,
                });

                cookiesToSet.forEach(
                  ({ name, value, options }) => {
                    response.cookies.set(
                      name,
                      value,
                      options
                    );
                  }
                );

                if (headers) {
                  Object.entries(headers).forEach(
                    ([key, value]) => {
                      response.headers.set(key, value);
                    }
                  );
                }
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

        await supabase.auth.getClaims();
      }
    } catch (error) {
      console.error(
        "Middleware session refresh failed:",
        error
      );
    }
  }

  if (!publicAuth && !publicMarketing) {
    response.headers.set(
      "Cache-Control",
      "private, no-store"
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
