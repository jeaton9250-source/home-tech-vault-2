import {
  PUBLIC_AUTH_PATHS,
  PUBLIC_MARKETING_PATHS,
  PUBLIC_METADATA_PATHS,
  PUBLIC_STATIC_PREFIXES,
  PUBLIC_UPGRADE_PATHS,
} from "@/lib/marketing/routes";

const CHROME_FREE_PREFIX_ROUTES = [
  ...PUBLIC_MARKETING_PATHS.filter(
    (path) => path !== "/"
  ),
  ...PUBLIC_AUTH_PATHS,
  ...PUBLIC_METADATA_PATHS,
] as const;

export function normalizePathname(
  pathname: string | null | undefined
): string {
  if (!pathname || pathname === "") {
    return "/";
  }

  return pathname;
}

export function isMetadataOrStaticRoute(
  pathname: string | null | undefined
): boolean {
  const path = normalizePathname(pathname);

  if (
    PUBLIC_METADATA_PATHS.includes(
      path as (typeof PUBLIC_METADATA_PATHS)[number]
    )
  ) {
    return true;
  }

  return PUBLIC_STATIC_PREFIXES.some(
    (prefix) => path.startsWith(prefix)
  );
}

export function isChromeFreeRoute(
  pathname: string | null | undefined
): boolean {
  const path = normalizePathname(pathname);

  if (path === "/") {
    return true;
  }

  if (isMetadataOrStaticRoute(path)) {
    return true;
  }

  if (path.startsWith("/family/accept/")) {
    return true;
  }

  return CHROME_FREE_PREFIX_ROUTES.some(
    (route) =>
      path === route ||
      path.startsWith(`${route}/`)
  );
}

export function isPublicRoute(
  pathname: string | null | undefined
): boolean {
  const path = normalizePathname(pathname);

  if (path === "/") {
    return true;
  }

  if (isMetadataOrStaticRoute(path)) {
    return true;
  }

  if (isChromeFreeRoute(path)) {
    return true;
  }

  return PUBLIC_UPGRADE_PATHS.some(
    (route) =>
      path === route ||
      path.startsWith(`${route}/`)
  );
}

export function isProtectedRoute(
  pathname: string | null | undefined
): boolean {
  return !isPublicRoute(pathname);
}
