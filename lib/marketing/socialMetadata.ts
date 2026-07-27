import type { Metadata } from "next";

import { getSiteUrl } from "@/lib/marketing/site";

export const SOCIAL_SITE_URL = getSiteUrl();

export const SOCIAL_DEFAULT_TITLE =
  "Home Tech Vault | The Operating System for Your Home's Technology";

export const SOCIAL_DEFAULT_DESCRIPTION =
  "See how healthy your home's technology is, discover what is connected, and get proactive recommendations — all in one calm home operating system.";

export const SOCIAL_OG_TITLE =
  "Home Tech Vault | Your Home, Understood";

export const SOCIAL_OG_DESCRIPTION =
  "Home awareness, network intelligence, and AI-powered guidance for the technology that runs your home.";

export const SOCIAL_TWITTER_TITLE = "Home Tech Vault";

export const SOCIAL_TWITTER_DESCRIPTION =
  "Wait... this monitors and understands my home's technology?";

export const SOCIAL_OG_IMAGE_PATH = "/og-image.png";

export const SOCIAL_OG_IMAGE_ALT =
  "Home Tech Vault Home Health Dashboard Preview";

export const SOCIAL_OG_IMAGE = {
  url: SOCIAL_OG_IMAGE_PATH,
  width: 1200,
  height: 630,
  alt: SOCIAL_OG_IMAGE_ALT,
} as const;

export const socialOpenGraph = {
  title: SOCIAL_OG_TITLE,
  description: SOCIAL_OG_DESCRIPTION,
  url: SOCIAL_SITE_URL,
  siteName: "Home Tech Vault",
  locale: "en_US",
  type: "website",
  images: [SOCIAL_OG_IMAGE],
} as const satisfies Metadata["openGraph"];

export const socialTwitter = {
  card: "summary_large_image",
  title: SOCIAL_TWITTER_TITLE,
  description: SOCIAL_TWITTER_DESCRIPTION,
  images: [SOCIAL_OG_IMAGE_PATH],
  creator: "@hometechvault",
} as const satisfies Metadata["twitter"];

export const rootSiteMetadata: Metadata = {
  metadataBase: new URL(SOCIAL_SITE_URL),
  title: SOCIAL_DEFAULT_TITLE,
  description: SOCIAL_DEFAULT_DESCRIPTION,
  alternates: {
    canonical: SOCIAL_SITE_URL,
  },
  icons: {
    icon: [
      { url: "/brand/icon.svg", type: "image/svg+xml" },
      { url: "/brand/apple-touch-icon.png", sizes: "180x180" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: socialOpenGraph,
  twitter: socialTwitter,
};
