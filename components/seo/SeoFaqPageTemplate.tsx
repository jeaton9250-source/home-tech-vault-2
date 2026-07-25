import MarketingLayout, {
  MarketingContent,
} from "@/components/marketing/MarketingLayout";
import {
  Breadcrumb,
  CallToAction,
  CoreSiteLinks,
  StructuredData,
} from "@/components/seo";
import type { SeoFaqEntry } from "@/lib/seo/faqs/catalog";
import { seoFaqPath } from "@/lib/seo/faqs/catalog";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { siteConfig } from "@/lib/marketing/site";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createSoftwareApplicationJsonLd,
  createWebPageJsonLd,
} from "@/lib/seo/jsonLd";

type SeoFaqPageTemplateProps = {
  faq: SeoFaqEntry;
  relatedFaqs: SeoFaqEntry[];
};

export default function SeoFaqPageTemplate({
  faq,
  relatedFaqs,
}: SeoFaqPageTemplateProps) {
  const path = seoFaqPath(faq.slug);

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "FAQ", href: MARKETING_ROUTES.faq },
    { name: faq.question },
  ];

  const jsonLd = [
    createWebPageJsonLd({
      title: faq.question,
      description: faq.answer,
      path,
    }),
    createFaqJsonLd([
      {
        question: faq.question,
        answer: faq.answer,
      },
    ]),
    createSoftwareApplicationJsonLd({
      description: faq.answer,
      urlPath: path,
    }),
    createBreadcrumbJsonLd(
      breadcrumbs.map((item) => ({
        name: item.name,
        path: item.href,
      }))
    ),
  ];

  return (
    <MarketingLayout>
      <StructuredData id={`seo-faq-${faq.slug}`} data={jsonLd} />

      <header className="border-b border-border-subtle/80 px-6 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-3xl">
          <Breadcrumb items={breadcrumbs} />
          <p className="mt-6 text-overline text-text-muted">
            FAQ · {faq.category}
          </p>
          <h1 className="mt-3 text-3xl font-medium tracking-[-0.04em] text-text-primary md:text-4xl md:leading-[1.15]">
            {faq.question}
          </h1>
        </div>
      </header>

      <MarketingContent className="mx-auto max-w-3xl space-y-12">
        <div className="space-y-5 text-lg leading-8 text-text-secondary">
          {faq.answer
            .split(/(?<=\.)\s+/)
            .filter(Boolean)
            .map((sentence) => (
              <p key={sentence.slice(0, 40)}>{sentence}</p>
            ))}
        </div>

        <CoreSiteLinks
          currentPath={path}
          related={[
            ...faq.related.map((link) => ({
              href: link.href,
              label: link.label,
              description: link.description,
            })),
            ...relatedFaqs.map((item) => ({
              href: seoFaqPath(item.slug),
              label: item.question,
              description: `${item.category} FAQ`,
            })),
          ]}
        />

        <CallToAction
          title={`Try ${siteConfig.name}`}
          description="Start free and put this answer into practice with a living household inventory."
          primaryLabel="Start free"
          primaryHref={MARKETING_ROUTES.signup}
          secondaryLabel="Browse all FAQs"
          secondaryHref={MARKETING_ROUTES.faq}
        />
      </MarketingContent>
    </MarketingLayout>
  );
}
