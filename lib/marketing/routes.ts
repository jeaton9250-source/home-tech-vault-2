export const MARKETING_ROUTES = {
  home: "/",
  demo: "/demo",
  contact: "/contact",
  signup: "/signup",
  login: "/login",
} as const;

export const PUBLIC_AUTH_PATHS = [
  MARKETING_ROUTES.login,
  MARKETING_ROUTES.signup,
  "/forgot-password",
  "/reset-password",
] as const;

/** Routes accessible without signing in. */
export const PUBLIC_MARKETING_PATHS = [
  MARKETING_ROUTES.home,
  MARKETING_ROUTES.demo,
  MARKETING_ROUTES.contact,
] as const;

export const PUBLIC_UPGRADE_PATHS = [
  "/upgrade",
] as const;

/** SEO, PWA, and static asset paths that must never require auth. */
export const PUBLIC_METADATA_PATHS = [
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
  "/manifest.webmanifest",
] as const;

export const PUBLIC_STATIC_PREFIXES = [
  "/brand/",
  "/_next/",
] as const;
