import Link from "next/link";

import MarketingLayout, {
  MarketingContent,
} from "@/components/marketing/MarketingLayout";
import {
  Breadcrumb,
  CallToAction,
  CoreSiteLinks,
  Faq,
  StructuredData,
} from "@/components/seo";
import type { ComparisonPage } from "@/lib/seo/comparisons/pages";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createProductJsonLd,
  createSoftwareApplicationJsonLd,
  createWebPageJsonLd,
} from "@/lib/seo/jsonLd";

type ComparisonPageTemplateProps = {
  page: ComparisonPage;
  related: Array<{
    href: string;
    title: string;
    description: string;
  }>;
};

export default function ComparisonPageTemplate({
  page,
  related,
}: ComparisonPageTemplateProps) {
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Compare", href: "/compare" },
    { name: page.title },
  ];

  const jsonLd = [
    createWebPageJsonLd({
      title: page.title,
      description: page.metaDescription,
      path: page.path,
    }),
    createProductJsonLd({
      description: page.metaDescription,
      urlPath: page.path,
      sku: page.slug,
      category:
        page.kind === "best-of"
          ? "Home inventory software"
          : "Home technology inventory",
    }),
    createSoftwareApplicationJsonLd({
      description: page.metaDescription,
      urlPath: page.path,
    }),
    createBreadcrumbJsonLd(
      breadcrumbs.map((item) => ({
        name: item.name,
        path: item.href,
      }))
    ),
    createFaqJsonLd(page.faq),
  ];

  return (
    <MarketingLayout>
      <StructuredData
        id={`comparison-${page.slug}`}
        data={jsonLd}
      />

      <header className="border-b border-border-subtle/80 px-6 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-6xl">
          <Breadcrumb items={breadcrumbs} />
          <p className="mt-6 text-overline text-text-muted">
            {page.heroEyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-medium tracking-[-0.04em] text-text-primary md:text-5xl md:leading-[1.08]">
            {page.heroTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-text-muted">
            {page.heroDescription}
          </p>
        </div>
      </header>

      <MarketingContent className="space-y-14">
        <div className="space-y-5 text-base leading-8 text-text-secondary">
          {page.intro.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="border border-border-subtle bg-surface-card p-6">
            <h2 className="text-lg font-medium tracking-[-0.02em] text-text-primary">
              {page.competitorName
                ? `When ${page.competitorName} is the better fit`
                : "When alternatives fit better"}
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-text-secondary">
              {page.whenAlternativeWins.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-text-muted" aria-hidden>
                    –
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-border-subtle bg-surface-card p-6">
            <h2 className="text-lg font-medium tracking-[-0.02em] text-text-primary">
              When Home Tech Vault fits better
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-text-secondary">
              {page.whenHtvWins.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-text-muted" aria-hidden>
                    –
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="comparison-table-heading">
          <h2
            id="comparison-table-heading"
            className="text-2xl font-medium tracking-[-0.03em] text-text-primary"
          >
            Comparison table
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            {page.table.caption}
          </p>
          <div className="mt-6 overflow-x-auto border border-border-subtle">
            <table className="min-w-full border-collapse text-left text-sm">
              <caption className="sr-only">
                {page.table.caption}
              </caption>
              <thead className="bg-surface-raised">
                <tr>
                  {page.table.columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="border-b border-border-subtle px-4 py-3 font-medium text-text-primary"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {page.table.rows.map((row) => (
                  <tr
                    key={row.feature}
                    className="border-b border-border-subtle/80 align-top"
                  >
                    <th
                      scope="row"
                      className="px-4 py-3 font-medium text-text-primary"
                    >
                      {row.feature}
                    </th>
                    {row.values.map((value, index) => (
                      <td
                        key={`${row.feature}-${index}`}
                        className="px-4 py-3 text-text-secondary"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-12">
          {page.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-28"
            >
              <h2 className="text-2xl font-medium tracking-[-0.03em] text-text-primary">
                {section.heading}
              </h2>
              <div className="mt-4 space-y-4 text-base leading-8 text-text-secondary">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <Faq
          title="Frequently asked questions"
          items={page.faq}
          includeJsonLd={false}
        />

        <CoreSiteLinks
          currentPath={page.path}
          related={related.map((item) => ({
            href: item.href,
            label: item.title,
            description: item.description,
          }))}
        />

        <CallToAction
          title={page.ctaTitle}
          description={page.ctaDescription}
          primaryLabel={page.primaryCtaLabel}
          primaryHref={page.primaryCtaHref}
          secondaryLabel={page.secondaryCtaLabel}
          secondaryHref={page.secondaryCtaHref}
        />

        <p className="text-sm text-text-tertiary">
          <Link
            href="/compare"
            className="htv-focus-ring font-medium text-text-secondary hover:text-text-primary"
          >
            ← All comparisons
          </Link>
        </p>
      </MarketingContent>
    </MarketingLayout>
  );
}
