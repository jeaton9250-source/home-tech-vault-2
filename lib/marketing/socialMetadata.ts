import type { Metadata } from "next";

export const rootSiteMetadata: Metadata = {
  metadataBase: new URL("https://www.hometechvault.com"),

  title: "Home Tech Vault | Appliance Warranty & Receipt Tracker",

  description:
    "Keep appliance warranties, purchase receipts, and model details together. Find what you need before paying for an appliance repair. Free to start.",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.hometechvault.com",
    siteName: "Home Tech Vault",
    title: "Never lose track of an appliance warranty again.",
    description:
      "Keep warranties, purchase receipts, and appliance details organized in one place.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Never lose track of an appliance warranty again.",
    description:
      "Keep your appliance warranties and receipts in one easy-to-find place.",
  },

  alternates: {
    canonical: "https://www.hometechvault.com",
  },
};

// -----------------------------------------------------------------------------
// Legacy social metadata exports
// Kept for compatibility with lib/marketing/metadata.ts
// -----------------------------------------------------------------------------

export const SOCIAL_DEFAULT_TITLE =
  "Home Tech Vault | Your Home's Memory";

export const SOCIAL_OG_TITLE =
  "Home Tech Vault | Your Home's Memory";

export const SOCIAL_OG_DESCRIPTION =
  "Keep your home's devices, warranties, documents, maintenance history, and important details organized in one place.";

export const SOCIAL_TWITTER_TITLE =
  "Home Tech Vault | Your Home's Memory";

export const SOCIAL_TWITTER_DESCRIPTION =
  "Keep your home's devices, warranties, documents, maintenance history, and important details organized in one place.";
