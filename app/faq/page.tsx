import Link from "next/link";

import MarketingLayout from "@/components/marketing/MarketingLayout";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import StructuredData from "@/components/marketing/StructuredData";
import {
  createFaqJsonLd,
  createPageMetadata,
} from "@/lib/marketing/metadata";
import { getAllFaqQuestions } from "@/lib/marketing/faq";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import {
  getAllSeoFaqs,
  SEO_FAQ_CATEGORIES,
  seoFaqPath,
} from "@/lib/seo/faqs/catalog";
import { MarketingContent } from "@/components/marketing/MarketingLayout";

export const metadata = createPageMetadata({
  title: "FAQ — Home Tech Vault Questions Answered",
  description:
    "Searchable answers about accounts, devices, documents, network, privacy, billing, and family sharing — plus 100 individual FAQ pages.",
  path: MARKETING_ROUTES.faq,
  keywords: [
    "home tech vault faq",
    "warranty tracker questions",
    "family sharing vault",
  ],
});

export default function FaqPage() {
  const seoFaqs = getAllSeoFaqs();
  const hubQuestions = [
    ...getAllFaqQuestions(),
    ...seoFaqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    })),
  ];

  return (
    <MarketingLayout>
      <StructuredData data={createFaqJsonLd(hubQuestions)} />
      <FaqAccordion />

      <MarketingContent className="border-t border-border-subtle/80 pt-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-medium tracking-[-0.03em] text-text-primary">
            All FAQ pages
          </h2>
          <p className="mt-3 text-sm leading-6 text-text-muted">
            Each question below has its own URL, FAQ schema, and related
            article links.
          </p>

          <div className="mt-10 space-y-10">
            {SEO_FAQ_CATEGORIES.map((category) => {
              const items = seoFaqs.filter(
                (faq) => faq.category === category
              );

              if (items.length === 0) {
                return null;
              }

              return (
                <section key={category}>
                  <h3 className="text-overline text-text-muted">
                    {category}
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {items.map((faq) => (
                      <li key={faq.slug}>
                        <Link
                          href={seoFaqPath(faq.slug)}
                          className="htv-focus-ring text-sm leading-6 text-text-secondary transition hover:text-text-primary"
                        >
                          {faq.question}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      </MarketingContent>
    </MarketingLayout>
  );
}
