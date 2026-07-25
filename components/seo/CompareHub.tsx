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
import type { ComparisonPage } from "@/lib/seo/comparisons/pages";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import {
  createBreadcrumbJsonLd,
  createProductJsonLd,
  createSoftwareApplicationJsonLd,
  createWebPageJsonLd,
} from "@/lib/seo/jsonLd";

type CompareHubProps = {
  pages: ComparisonPage[];
};

export default function CompareHub({ pages }: CompareHubProps) {
  const versus = pages.filter((page) => page.kind === "versus");
  const bestOf = pages.filter((page) => page.kind === "best-of");

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Compare" },
  ];

  const jsonLd = [
    createWebPageJsonLd({
      title: "Compare Home Tech Vault",
      description:
        "Objective comparisons of Home Tech Vault versus Notion, spreadsheets, Airtable, paper records, plus buying guides for inventory and warranty tools.",
      path: "/compare",
    }),
    createProductJsonLd({
      description:
        "Home Tech Vault — home technology inventory, documents, and warranty tracking.",
      urlPath: "/compare",
      sku: "compare-hub",
    }),
    createSoftwareApplicationJsonLd({
      description:
        "Compare Home Tech Vault with common inventory approaches.",
      urlPath: "/compare",
    }),
    createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Compare", path: "/compare" },
    ]),
  ];

  return (
    <MarketingLayout>
      <StructuredData id="compare-hub" data={jsonLd} />

      <header className="border-b border-border-subtle/80 px-6 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-6xl">
          <Breadcrumb items={breadcrumbs} />
          <p className="mt-6 text-overline text-text-muted">
            Comparisons
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-medium tracking-[-0.04em] text-text-primary md:text-5xl md:leading-[1.08]">
            Compare Home Tech Vault with the tools you already use
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-text-muted">
            Objective write-ups with strengths, tradeoffs, comparison
            tables, and FAQs — so you can choose based on fit, not
            slogans.
          </p>
        </div>
      </header>

      <MarketingContent className="space-y-14">
        <section>
          <h2 className="text-xl font-medium tracking-[-0.03em] text-text-primary">
            Versus pages
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {versus.map((page) => (
              <CompareCard key={page.slug} page={page} />
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-medium tracking-[-0.03em] text-text-primary">
            Buying guides
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {bestOf.map((page) => (
              <CompareCard key={page.slug} page={page} />
            ))}
          </ul>
        </section>

        <CoreSiteLinks currentPath="/compare" />

        <CallToAction
          title="Prefer to try the product?"
          description="Start free and decide after you inventory a few real devices."
          primaryLabel="Start free"
          primaryHref={MARKETING_ROUTES.signup}
          secondaryLabel="See pricing"
          secondaryHref={MARKETING_ROUTES.pricing}
        />
      </MarketingContent>
    </MarketingLayout>
  );
}

function CompareCard({ page }: { page: ComparisonPage }) {
  return (
    <li>
      <Link
        href={page.path}
        className="htv-focus-ring group flex h-full flex-col border border-border-subtle bg-surface-card p-5 transition hover:border-border-strong"
      >
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">
          {page.kind === "versus" ? "Comparison" : "Guide"}
        </p>
        <h3 className="mt-2 text-base font-medium text-text-primary">
          {page.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-text-muted">
          {page.metaDescription}
        </p>
        <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-text-primary">
          Read comparison
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
