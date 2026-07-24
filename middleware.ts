import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

export function middleware(request: NextRequest) {
  const pathname = normalizePathname(
    request.nextUrl.pathname
  );

  const publicRoute = isPublicAuthPath(pathname);

  console.info("Auth route guard", {
    pathname,
    publicRoute,
  });

  if (publicRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
