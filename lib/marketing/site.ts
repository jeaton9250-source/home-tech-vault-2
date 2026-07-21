import { brand } from "@/lib/design-system/tokens";

const DEFAULT_SITE_URL =
  "https://hometechvault.com";

export function getSiteUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configured) {
    return DEFAULT_SITE_URL;
  }

  return configured.replace(/\/$/, "");
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
  defaultOgImage: absoluteUrl("/brand/logo.svg"),
  twitterHandle: "@hometechvault",
} as const;
