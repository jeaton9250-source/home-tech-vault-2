export const MARKETING_ROUTES = {
  home: "/",
  features: "/features",
  pricing: "/pricing",
  demo: "/demo",
  faq: "/faq",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",
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
  MARKETING_ROUTES.features,
  MARKETING_ROUTES.pricing,
  MARKETING_ROUTES.demo,
  MARKETING_ROUTES.faq,
  MARKETING_ROUTES.contact,
  MARKETING_ROUTES.privacy,
  MARKETING_ROUTES.terms,
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

/** Indexable marketing URLs for sitemap generation. */
export const INDEXABLE_MARKETING_PATHS = [
  MARKETING_ROUTES.home,
  MARKETING_ROUTES.features,
  MARKETING_ROUTES.pricing,
  MARKETING_ROUTES.demo,
  MARKETING_ROUTES.faq,
  MARKETING_ROUTES.contact,
  MARKETING_ROUTES.privacy,
  MARKETING_ROUTES.terms,
] as const;
