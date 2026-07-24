import { brand } from "@/lib/design-system/tokens";

const DEFAULT_SITE_URL =
  "https://www.hometechvault.com";

function normalizeCanonicalSiteUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === "hometechvault.com") {
      parsed.hostname = "www.hometechvault.com";
    }

    return parsed.origin.replace(/\/$/, "");
  } catch {
    return url.replace(/\/$/, "");
  }
}

export function getSiteUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configured) {
    return DEFAULT_SITE_URL;
  }

  return normalizeCanonicalSiteUrl(configured);
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/")
    ? path
    : `/${path}`;

  return `${getSiteUrl()}${normalized}`;
}

export const siteConfig = {
  name: brand.name,
  tagline: brand.tagline,
  /** Public social sharing image */
  defaultOgImage: "/og-image.png",
  defaultOgImageAlt:
    "Home Tech Vault Dashboard Preview",
  logo: absoluteUrl("/brand/logo.svg"),
  twitterHandle: "@hometechvault",
} as const;
