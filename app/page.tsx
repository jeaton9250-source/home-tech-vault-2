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
    "Organize every device, warranty, receipt, and network detail in one calm, intelligent vault built for real households.",
  path: MARKETING_ROUTES.home,
  keywords: [
    "home technology inventory",
    "warranty tracker",
    "device organization",
    "home tech vault",
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
