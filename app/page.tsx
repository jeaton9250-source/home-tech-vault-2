import LandingPage from "@/components/landing/LandingPage";
import StructuredData from "@/components/marketing/StructuredData";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadPublicFoundingProgramSummary } from "@/lib/founding-members/loaders";
import {
  createPageMetadata,
  createSoftwareApplicationJsonLd,
} from "@/lib/marketing/metadata";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

export const metadata = createPageMetadata({
  title: "Home Tech Vault",
  description:
    "The digital home for everything that powers yours. Organize your devices, warranties, receipts, subscriptions, and important documents in one secure place.",
  path: MARKETING_ROUTES.home,
  keywords: [
    "home technology organization",
    "warranty tracker",
    "device organization",
    "home tech vault",
    "subscription tracker",
  ],
});

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
