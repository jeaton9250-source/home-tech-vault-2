import type { Metadata } from "next";

import LandingPage from "@/components/landing/LandingPage";
import StructuredData from "@/components/marketing/StructuredData";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadPublicFoundingProgramSummary } from "@/lib/founding-members/loaders";
import { createSoftwareApplicationJsonLd } from "@/lib/marketing/metadata";
import {
  SOCIAL_OG_IMAGE,
  SOCIAL_SITE_URL,
  socialTwitter,
} from "@/lib/marketing/socialMetadata";

const title =
  "Home Tech Vault | Your Entire Home. One Organized Vault.";
const description =
  "Organize your devices, appliances, receipts, warranties, manuals, maintenance records, important documents, and home technology in one secure Home Tech Vault.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: SOCIAL_SITE_URL,
  },
  keywords: [
    "home inventory",
    "home inventory app",
    "home organizer",
    "home document organizer",
    "warranty tracker",
    "appliance warranty tracker",
    "home maintenance tracker",
    "receipt organizer",
    "manual organizer",
    "device inventory",
    "home technology organizer",
    "digital home vault",
    "home tech vault",
  ],
  openGraph: {
    title,
    description,
    url: SOCIAL_SITE_URL,
    siteName: "Home Tech Vault",
    locale: "en_US",
    type: "website",
    images: [SOCIAL_OG_IMAGE],
  },
  twitter: {
    ...socialTwitter,
    title,
    description,
    images: [SOCIAL_OG_IMAGE.url],
  },
};

export default async function HomePage() {
  let foundingSummary = null;

  try {
    const admin = createAdminClient();
    foundingSummary = await loadPublicFoundingProgramSummary(admin);
  } catch {
    foundingSummary = null;
  }

  return (
    <>
      <StructuredData data={createSoftwareApplicationJsonLd()} />
      <LandingPage foundingSummary={foundingSummary} />
    </>
  );
}
