import LandingPage from "@/components/landing/LandingPage";
import StructuredData from "@/components/marketing/StructuredData";
import {
  createPageMetadata,
  createSoftwareApplicationJsonLd,
} from "@/lib/marketing/metadata";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

export const metadata = createPageMetadata({
  title: "Home Tech Vault",
  description:
    "Organize your home's devices, warranties, receipts, documents, network details, and subscriptions in one calm, secure vault built for real households.",
  path: MARKETING_ROUTES.home,
  keywords: [
    "home technology organization",
    "warranty tracker",
    "device organization",
    "home tech vault",
    "subscription tracker",
  ],
});

export default function HomePage() {
  return (
    <>
      <StructuredData
        data={createSoftwareApplicationJsonLd()}
      />
      <LandingPage />
    </>
  );
}
