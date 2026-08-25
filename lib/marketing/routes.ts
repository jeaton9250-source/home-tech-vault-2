export const MARKETING_ROUTES = {
  home: "/",
  features: "/features",
  pricing: "/pricing",
  demo: "/demo",
  faq: "/faq",
  contact: "/contact",
  trust: "/trust",
  privacy: "/privacy",
  terms: "/terms",
  signup: "/signup",
  login: "/login",
  newHomeowners: "/new-homeowners",
} as const;

export const PUBLIC_AUTH_PATHS = [
  MARKETING_ROUTES.login,
  MARKETING_ROUTES.signup,
  "/forgot-password",
  "/reset-password",
  "/set-password",
  "/auth/callback",
  "/auth/confirm",
  "/auth/error",
  "/invite/setup",
  "/onboarding/create-household",
] as const;

export const PUBLIC_AUTH_PATH_SET = new Set<string>(
  PUBLIC_AUTH_PATHS
);

export function isPublicAuthPath(
  pathname: string | null | undefined
): boolean {
  const path = normalizePathname(pathname);

  if (PUBLIC_AUTH_PATH_SET.has(path)) {
    return true;
  }

  for (const route of PUBLIC_AUTH_PATHS) {
    if (path.startsWith(`${route}/`)) {
      return true;
    }
  }

  return false;
}

/** Routes accessible without signing in. */
export const PUBLIC_MARKETING_PATHS = [
  MARKETING_ROUTES.home,
  MARKETING_ROUTES.features,
  "/how-it-works",
  MARKETING_ROUTES.pricing,
  MARKETING_ROUTES.demo,
  MARKETING_ROUTES.faq,
  MARKETING_ROUTES.contact,
  MARKETING_ROUTES.trust,
  MARKETING_ROUTES.privacy,
  MARKETING_ROUTES.terms,
  "/device-inventory",
  "/home-tech-inventory",
  "/warranty-tracker",
  "/home-document-organizer",
  "/network-documentation",
  "/homeowner-tech-management",
  "/smart-home-organizer",
  "/home-inventory-software",
  "/digital-home-vault",
  "/home-tech-checklist",
  MARKETING_ROUTES.newHomeowners,
  "/health-check",
  "/knowledge",
  "/guides",
  "/compare",
] as const;

export const PUBLIC_MARKETING_PATH_SET = new Set<string>(
  PUBLIC_MARKETING_PATHS
);

/**
 * Returns true when a route is a public marketing page.
 * These pages must never be wrapped in the authenticated app shell.
 */
export function isPublicMarketingPath(
  pathname: string | null | undefined
): boolean {
  const path = normalizePathname(pathname);

  if (path === "/") {
    return true;
  }

  if (PUBLIC_MARKETING_PATH_SET.has(path)) {
    return true;
  }

  for (const route of PUBLIC_MARKETING_PATHS) {
    if (
      route !== "/" &&
      path.startsWith(`${route}/`)
    ) {
      return true;
    }
  }

  return false;
}

export const PUBLIC_UPGRADE_PATHS = [
  "/upgrade",
] as const;

/** SEO, PWA, and static asset paths that must never require auth. */
export const PUBLIC_METADATA_PATHS = [
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
  "/manifest.webmanifest",
  "/og-image.png",
  "/opengraph-image",
  "/opengraph-image.png",
  "/twitter-image",
  "/twitter-image.png",
  "/social-preview.png",
] as const;

export const PUBLIC_STATIC_PREFIXES = [
  "/brand/",
  "/_next/",
  "/demo/",
  "/demo-devices/",
] as const;

/** Indexable marketing URLs for sitemap generation. */
export const INDEXABLE_MARKETING_PATHS = [
  MARKETING_ROUTES.home,
  MARKETING_ROUTES.features,
  "/how-it-works",
  MARKETING_ROUTES.pricing,
  MARKETING_ROUTES.demo,
  MARKETING_ROUTES.faq,
  MARKETING_ROUTES.contact,
  MARKETING_ROUTES.trust,
  MARKETING_ROUTES.privacy,
  MARKETING_ROUTES.terms,
  "/device-inventory",
  "/home-tech-inventory",
  "/warranty-tracker",
  "/home-document-organizer",
  "/network-documentation",
  "/homeowner-tech-management",
  "/smart-home-organizer",
  "/home-inventory-software",
  "/digital-home-vault",
  "/home-tech-checklist",
  MARKETING_ROUTES.newHomeowners,
  "/knowledge",
  "/guides",
  "/compare",
] as const;

/** SEO landing page paths (subset of indexable marketing URLs). */
export const SEO_LANDING_PATHS = [
  "/device-inventory",
  "/home-tech-inventory",
  "/warranty-tracker",
  "/home-document-organizer",
  "/network-documentation",
  "/homeowner-tech-management",
  "/smart-home-organizer",
  "/home-inventory-software",
  "/digital-home-vault",
  "/home-tech-checklist",
] as const;

function normalizePathname(
  pathname: string | null | undefined
): string {
  if (!pathname || pathname === "") {
    return "/";
  }

  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}
