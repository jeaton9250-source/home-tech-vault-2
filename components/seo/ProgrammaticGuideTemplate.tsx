import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
import type { ProgrammaticGuidePage } from "@/lib/seo/programmatic";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createSoftwareApplicationJsonLd,
  createWebPageJsonLd,
} from "@/lib/seo/jsonLd";

type ProgrammaticGuideTemplateProps = {
  page: ProgrammaticGuidePage;
  related: Array<{
    href: string;
    title: string;
    description: string;
  }>;
};

export default function ProgrammaticGuideTemplate({
  page,
  related,
}: ProgrammaticGuideTemplateProps) {
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Guides", href: "/guides" },
    ...(page.brandName
      ? [
          {
            name: page.brandName,
            href: `/guides?brand=${page.brandSlug}`,
          },
        ]
      : []),
    { name: page.title },
  ];

  const jsonLd = [
    createWebPageJsonLd({
      title: page.title,
      description: page.metaDescription,
      path: page.path,
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
        id={`programmatic-guide-${page.slug}`}
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

      <MarketingContent className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-14">
        <article className="min-w-0">
          <div className="space-y-5 text-base leading-8 text-text-secondary">
            {page.intro.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-12 space-y-12">
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
                    <p
                      key={paragraph.slice(0, 40)}
                      className="whitespace-pre-line"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-14">
            <Faq
              title="Frequently asked questions"
              items={page.faq}
              includeJsonLd={false}
            />
          </div>

          <div className="mt-14">
            <CoreSiteLinks
              currentPath={page.path}
              related={related.map((item) => ({
                href: item.href,
                label: item.title,
                description: item.description,
              }))}
            />
          </div>

          <div className="mt-14">
            <CallToAction
              title={page.ctaTitle}
              description={page.ctaDescription}
              primaryLabel={page.primaryCtaLabel}
              primaryHref={page.primaryCtaHref}
              secondaryLabel={page.secondaryCtaLabel}
              secondaryHref={page.secondaryCtaHref}
            />
          </div>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <nav
              aria-label="On this page"
              className="border border-border-subtle bg-surface-card p-5"
            >
              <p className="text-overline text-text-muted">
                On this page
              </p>
              <ol className="mt-4 space-y-2.5">
                {page.sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="htv-focus-ring text-sm leading-6 text-text-secondary transition hover:text-text-primary"
                    >
                      <span className="mr-2 text-text-muted">
                        {index + 1}.
                      </span>
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="border border-border-subtle bg-surface-card p-5">
              <p className="text-sm font-medium text-text-primary">
                Browse more guides
              </p>
              <p className="mt-2 text-sm leading-6 text-text-muted">
                Brand and topic pages for organizing household tech.
              </p>
              <Link
                href="/guides"
                className="htv-focus-ring mt-4 inline-flex items-center gap-2 text-sm font-medium text-text-primary"
              >
                All guides
                <ArrowRight size={14} aria-hidden />
              </Link>
            </div>
          </div>
        </aside>
      </MarketingContent>
    </MarketingLayout>
  );
}
