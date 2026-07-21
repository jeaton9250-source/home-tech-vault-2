import PricingPageContent from "@/components/marketing/PricingPageContent";
import StructuredData from "@/components/marketing/StructuredData";
import {
  createPageMetadata,
  createSoftwareApplicationJsonLd,
} from "@/lib/marketing/metadata";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

export const metadata = createPageMetadata({
  title: "Pricing — Free, Pro & Family Plans",
  description:
    "Simple pricing for every household. Start free, upgrade to Pro for unlimited inventory, or choose Family for household sharing.",
  path: MARKETING_ROUTES.pricing,
  keywords: [
    "home tech vault pricing",
    "warranty tracker subscription",
    "family vault plan",
  ],
});

export default function PricingPage() {
  return (
    <>
      <StructuredData
        data={createSoftwareApplicationJsonLd()}
      />
      <PricingPageContent />
    </>
  );
}
