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

      <header className="border-b border-white/10 bg-[#0b1623] px-6 py-12 text-[#f4f0e8] md:px-8 md:py-16">
        <div className="mx-auto max-w-6xl">
          <Breadcrumb items={breadcrumbs} />

          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8ca667]">
            {page.heroEyebrow}
          </p>

          <h1 className="mt-3 max-w-4xl font-serif text-4xl font-medium tracking-[-0.045em] text-[#f4f0e8] md:text-6xl md:leading-[1.04]">
            {page.heroTitle}
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#b6c0c7] md:text-lg">
            {page.heroDescription}
          </p>
        </div>
      </header>

      <MarketingContent className="grid gap-12 bg-[#eee9df] lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-14">
        <article className="min-w-0">
          <div className="space-y-5 rounded-[26px] border border-[#182533]/10 bg-[#f8f5ef] p-6 text-[1.02rem] leading-8 text-[#46535c] shadow-[0_18px_45px_-38px_rgba(15,25,35,0.35)] md:p-8">
            {page.intro.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-12 space-y-7">
            {page.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-28 rounded-[26px] border border-[#182533]/10 bg-[#f8f5ef] p-6 shadow-[0_18px_45px_-38px_rgba(15,25,35,0.3)] md:p-8"
              >
                <h2 className="font-serif text-2xl font-medium tracking-[-0.035em] text-[#17212a] md:text-3xl">
                  {section.heading}
                </h2>
                <div className="mt-5 space-y-5 text-base leading-8 text-[#4f5b63]">
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
              className="rounded-[24px] border border-[#182533]/10 bg-[#f8f5ef] p-5 shadow-[0_18px_45px_-38px_rgba(15,25,35,0.35)]"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#617c43]">
                On this page
              </p>
              <ol className="mt-4 space-y-2.5">
                {page.sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="htv-focus-ring text-sm leading-6 text-[#59656d] transition hover:text-[#17212a]"
                    >
                      <span className="mr-2 font-semibold text-[#617c43]">
                        {index + 1}.
                      </span>
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="rounded-[24px] border border-white/10 bg-[#0b1623] p-5 text-[#f4f0e8] shadow-[0_20px_45px_-35px_rgba(0,0,0,0.7)]">
              <p className="font-serif text-lg font-medium text-[#f4f0e8]">
                Browse more guides
              </p>
              <p className="mt-2 text-sm leading-6 text-[#b6c0c7]">
                Brand and topic pages for organizing household tech.
              </p>
              <Link
                href="/guides"
                className="htv-focus-ring mt-5 inline-flex items-center gap-2 rounded-full bg-[#617c43] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#718d4f]"
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
