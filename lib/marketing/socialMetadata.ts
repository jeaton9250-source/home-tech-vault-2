import type { Metadata } from "next";

export const rootSiteMetadata: Metadata = {
  metadataBase: new URL("https://www.hometechvault.com"),

  title: {
    default: "Home Tech Vault | Your Home Has a Memory",
    template: "%s | Home Tech Vault",
  },

  description:
    "Home Tech Vault keeps your home's manuals, warranties, receipts, maintenance history and important details together in one place.",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.hometechvault.com",
    siteName: "Home Tech Vault",
    title: "Your home has a memory.",
    description:
      "Manuals, warranties, receipts, maintenance and the useful history of your home — together in one place.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Your home has a memory.",
    description:
      "Keep the useful history of your home together.",
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
