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
    "Everything your home remembers. Home Tech Vault quietly remembers devices, warranties, receipts, maintenance, and your network so you can enjoy your home.",
  path: MARKETING_ROUTES.home,
  keywords: [
    "home digital memory",
    "home technology organizer",
    "smart home companion",
    "warranty tracker",
    "home tech vault",
    "device organizer",
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
