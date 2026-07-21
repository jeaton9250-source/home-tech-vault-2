import MarketingLayout from "@/components/marketing/MarketingLayout";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import StructuredData from "@/components/marketing/StructuredData";
import {
  createFaqJsonLd,
  createPageMetadata,
} from "@/lib/marketing/metadata";
import { getAllFaqQuestions } from "@/lib/marketing/faq";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";

export const metadata = createPageMetadata({
  title: "FAQ — Home Tech Vault Questions Answered",
  description:
    "Searchable answers about accounts, devices, documents, network, privacy, billing, and family sharing.",
  path: MARKETING_ROUTES.faq,
  keywords: [
    "home tech vault faq",
    "warranty tracker questions",
    "family sharing vault",
  ],
});

export default function FaqPage() {
  return (
    <MarketingLayout>
      <StructuredData
        data={createFaqJsonLd(getAllFaqQuestions())}
      />
      <FaqAccordion />
    </MarketingLayout>
  );
}
