import type { Metadata } from "next";

import LandingPage from "@/components/landing/LandingPage";
import StructuredData from "@/components/marketing/StructuredData";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadPublicFoundingProgramSummary } from "@/lib/founding-members/loaders";
import {
  createSoftwareApplicationJsonLd,
} from "@/lib/marketing/metadata";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import {
  SOCIAL_DEFAULT_DESCRIPTION,
  SOCIAL_DEFAULT_TITLE,
  SOCIAL_OG_DESCRIPTION,
  SOCIAL_OG_IMAGE,
  SOCIAL_OG_TITLE,
  SOCIAL_SITE_URL,
  SOCIAL_TWITTER_DESCRIPTION,
  SOCIAL_TWITTER_TITLE,
  socialTwitter,
} from "@/lib/marketing/socialMetadata";

export const metadata: Metadata = {
  title: SOCIAL_DEFAULT_TITLE,
  description: SOCIAL_DEFAULT_DESCRIPTION,
  alternates: {
    canonical: SOCIAL_SITE_URL,
  },
  keywords: [
    "home technology organizer",
    "device organizer",
    "warranty tracker",
    "home receipts",
    "home manuals",
    "home maintenance tracker",
    "home tech vault",
  ],
  openGraph: {
    title: SOCIAL_OG_TITLE,
    description: SOCIAL_OG_DESCRIPTION,
    url: SOCIAL_SITE_URL,
    siteName: "Home Tech Vault",
    locale: "en_US",
    type: "website",
    images: [SOCIAL_OG_IMAGE],
  },
  twitter: {
    ...socialTwitter,
    title: SOCIAL_TWITTER_TITLE,
    description: SOCIAL_TWITTER_DESCRIPTION,
    images: [SOCIAL_OG_IMAGE.url],
  },
};

export default async function HomePage() {
  let foundingSummary = null;

  try {
    const admin = createAdminClient();
    foundingSummary =
      await loadPublicFoundingProgramSummary(
        admin
      );
  } catch {
    foundingSummary = null;
  }

  return (
    <>
      <StructuredData
        data={createSoftwareApplicationJsonLd()}
      />
      <LandingPage
        foundingSummary={foundingSummary}
      />
    </>
  );
}
