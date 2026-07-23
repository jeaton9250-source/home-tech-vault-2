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
  title: "Organize Your Home Technology",
  description:
    "Organize your home's devices, receipts, warranties, manuals, maintenance records, and network details in one secure place.",
  path: MARKETING_ROUTES.home,
  keywords: [
    "home technology organizer",
    "device organizer",
    "warranty tracker",
    "home receipts",
    "home manuals",
    "home maintenance tracker",
    "home tech vault",
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
