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
import {
  KNOWLEDGE_CATEGORIES,
  knowledgeCategoryPath,
  type KnowledgeCategorySlug,
} from "@/lib/knowledge/categories";
import type { KnowledgeArticle } from "@/lib/knowledge/types";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { siteConfig } from "@/lib/marketing/site";
import {
  createBreadcrumbJsonLd,
  createSoftwareApplicationJsonLd,
  createWebPageJsonLd,
} from "@/lib/seo/jsonLd";

type KnowledgeHubProps = {
  articlesByCategory: Record<
    KnowledgeCategorySlug,
    KnowledgeArticle[]
  >;
};

export default function KnowledgeHub({
  articlesByCategory,
}: KnowledgeHubProps) {
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Knowledge" },
  ];

  const jsonLd = [
    createWebPageJsonLd({
      title: "Knowledge Center",
      description:
        "Guides for home devices, networking, warranties, smart home gear, and household tech records.",
      path: "/knowledge",
    }),
    createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Knowledge", path: "/knowledge" },
    ]),
    createSoftwareApplicationJsonLd({
      description:
        "Home Tech Vault Knowledge Center — practical guides for organizing household technology.",
      urlPath: "/knowledge",
    }),
  ];

  return (
    <MarketingLayout>
      <StructuredData id="knowledge-hub" data={jsonLd} />

      <header className="border-b border-border-subtle/80 px-6 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-6xl">
          <Breadcrumb items={breadcrumbs} />
          <p className="mt-6 text-overline text-text-muted">
            Knowledge Center
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-medium tracking-[-0.04em] text-text-primary md:text-5xl md:leading-[1.08]">
            Practical guides for the technology in your home
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-text-muted">
            Fifty long-form articles on devices, networking,
            smart home gear, security habits, warranties,
            maintenance, and buying — written for households
            that want clear records, not more apps.
          </p>
        </div>
      </header>

      <MarketingContent className="space-y-16">
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {KNOWLEDGE_CATEGORIES.map((category) => {
            const count =
              articlesByCategory[category.slug]?.length ?? 0;

            return (
              <Link
                key={category.slug}
                href={knowledgeCategoryPath(category.slug)}
                className="htv-focus-ring group flex flex-col border border-border-subtle bg-surface-card p-6 transition hover:border-border-strong"
              >
                <h2 className="text-xl font-medium tracking-[-0.03em] text-text-primary">
                  {category.name}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-text-muted">
                  {category.description}
                </p>
                <p className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-text-primary">
                  {count} articles
                  <ArrowRight
                    size={14}
                    className="transition group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </p>
              </Link>
            );
          })}
        </section>

        {KNOWLEDGE_CATEGORIES.map((category) => {
          const articles =
            articlesByCategory[category.slug] ?? [];

          return (
            <section key={category.slug}>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-medium tracking-[-0.03em] text-text-primary">
                    {category.name}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
                    {category.description}
                  </p>
                </div>
                <Link
                  href={knowledgeCategoryPath(category.slug)}
                  className="htv-focus-ring hidden shrink-0 text-sm font-medium text-text-primary sm:inline-flex"
                >
                  View all
                </Link>
              </div>

              <ul className="mt-8 grid gap-4 md:grid-cols-2">
                {articles.slice(0, 4).map((article) => (
                  <li key={article.slug}>
                    <Link
                      href={`/knowledge/${article.category}/${article.slug}`}
                      className="htv-focus-ring group flex h-full flex-col border border-border-subtle bg-surface-card p-5 transition hover:border-border-strong"
                    >
                      <h3 className="text-base font-medium text-text-primary">
                        {article.title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-6 text-text-muted">
                        {article.description}
                      </p>
                      <p className="mt-4 text-xs text-text-tertiary">
                        {article.readingMinutes} min read
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <CoreSiteLinks currentPath="/knowledge" />

        <CallToAction
          title={`Keep these guides useful in ${siteConfig.name}`}
          description="Turn checklists into a living inventory, document vault, and warranty tracker for your household."
          primaryLabel="Start free"
          primaryHref={MARKETING_ROUTES.signup}
          secondaryLabel="See features"
          secondaryHref={MARKETING_ROUTES.features}
        />
      </MarketingContent>
    </MarketingLayout>
  );
}
