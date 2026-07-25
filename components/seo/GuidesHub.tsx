import Link from "next/link";
import { ArrowRight } from "lucide-react";

import MarketingLayout, {
  MarketingContent,
} from "@/components/marketing/MarketingLayout";
import {
  Breadcrumb,
  CallToAction,
  CoreSiteLinks,
  StructuredData,
} from "@/components/seo";
import { SEO_BRANDS } from "@/lib/seo/programmatic/brands";
import type { ProgrammaticGuidePage } from "@/lib/seo/programmatic";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import {
  createBreadcrumbJsonLd,
  createSoftwareApplicationJsonLd,
  createWebPageJsonLd,
} from "@/lib/seo/jsonLd";

type GuidesHubProps = {
  pages: ProgrammaticGuidePage[];
  activeBrand?: string | null;
};

export default function GuidesHub({
  pages,
  activeBrand = null,
}: GuidesHubProps) {
  const filtered = activeBrand
    ? pages.filter((page) => page.brandSlug === activeBrand)
    : pages;

  const topicPages = filtered.filter((page) => page.brandSlug === null);
  const brandPages = filtered.filter((page) => page.brandSlug !== null);

  const brandsWithPages = SEO_BRANDS.filter((brand) =>
    pages.some((page) => page.brandSlug === brand.slug)
  );

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Guides" },
  ];

  const jsonLd = [
    createWebPageJsonLd({
      title: "Device Brand Guides",
      description:
        "Programmatic guides for organizing devices, warranties, router passwords, and smart home gear by brand.",
      path: "/guides",
    }),
    createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Guides", path: "/guides" },
    ]),
    createSoftwareApplicationJsonLd({
      description:
        "Home Tech Vault guides for consumer device brands and household tech records.",
      urlPath: "/guides",
    }),
  ];

  return (
    <MarketingLayout>
      <StructuredData id="guides-hub" data={jsonLd} />

      <header className="border-b border-border-subtle/80 px-6 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-6xl">
          <Breadcrumb items={breadcrumbs} />
          <p className="mt-6 text-overline text-text-muted">
            Programmatic guides
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-medium tracking-[-0.04em] text-text-primary md:text-5xl md:leading-[1.08]">
            Organize every major device brand in your home
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-text-muted">
            Unique guides for Apple, Samsung, networking gear, smart home
            brands, and more — with metadata, FAQs, and structured data
            generated for each page.
          </p>
        </div>
      </header>

      <MarketingContent className="space-y-14">
        <section>
          <h2 className="text-xl font-medium tracking-[-0.03em] text-text-primary">
            Browse by brand
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            <li>
              <Link
                href="/guides"
                className={`htv-focus-ring inline-flex border px-3 py-1.5 text-sm transition ${
                  !activeBrand
                    ? "border-border-strong bg-surface-raised text-text-primary"
                    : "border-border-subtle bg-surface-card text-text-secondary hover:border-border-strong"
                }`}
              >
                All
              </Link>
            </li>
            {brandsWithPages.map((brand) => (
              <li key={brand.slug}>
                <Link
                  href={`/guides?brand=${brand.slug}`}
                  className={`htv-focus-ring inline-flex border px-3 py-1.5 text-sm transition ${
                    activeBrand === brand.slug
                      ? "border-border-strong bg-surface-raised text-text-primary"
                      : "border-border-subtle bg-surface-card text-text-secondary hover:border-border-strong"
                  }`}
                >
                  {brand.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {topicPages.length > 0 ? (
          <section>
            <h2 className="text-xl font-medium tracking-[-0.03em] text-text-primary">
              Topic guides
            </h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {topicPages.map((page) => (
                <GuideCard key={page.slug} page={page} />
              ))}
            </ul>
          </section>
        ) : null}

        <section>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-xl font-medium tracking-[-0.03em] text-text-primary">
              {activeBrand
                ? `${brandsWithPages.find((brand) => brand.slug === activeBrand)?.name ?? "Brand"} guides`
                : "Brand guides"}
            </h2>
            <p className="text-sm text-text-muted">
              {brandPages.length} pages
            </p>
          </div>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {brandPages.map((page) => (
              <GuideCard key={page.slug} page={page} />
            ))}
          </ul>
        </section>

        <CoreSiteLinks currentPath="/guides" />

        <CallToAction
          title="Turn these guides into a living inventory"
          description="Home Tech Vault stores devices, warranties, and household documents in one place."
          primaryLabel="Start free"
          primaryHref={MARKETING_ROUTES.signup}
          secondaryLabel="See features"
          secondaryHref={MARKETING_ROUTES.features}
        />
      </MarketingContent>
    </MarketingLayout>
  );
}

function GuideCard({ page }: { page: ProgrammaticGuidePage }) {
  return (
    <li>
      <Link
        href={page.path}
        className="htv-focus-ring group flex h-full flex-col border border-border-subtle bg-surface-card p-5 transition hover:border-border-strong"
      >
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">
          {page.brandName ?? page.group}
        </p>
        <h3 className="mt-2 text-base font-medium text-text-primary">
          {page.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-text-muted">
          {page.metaDescription}
        </p>
        <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-text-primary">
          Read guide
          <ArrowRight
            size={14}
            className="transition group-hover:translate-x-0.5"
            aria-hidden
          />
        </p>
      </Link>
    </li>
  );
}
