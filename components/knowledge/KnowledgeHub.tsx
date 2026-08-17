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
        "Helpful guides for organizing home devices, networks, warranties, smart home equipment, maintenance, and household technology records.",
      path: "/knowledge",
    }),
    createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Knowledge", path: "/knowledge" },
    ]),
    createSoftwareApplicationJsonLd({
      description:
        "Home Tech Vault Knowledge Center — helpful guides for managing and documenting household technology.",
      urlPath: "/knowledge",
    }),
  ];

  return (
    <MarketingLayout>
      <StructuredData
        id="knowledge-hub"
        data={jsonLd}
      />

      <header className="border-b border-white/10 bg-[#0b1623] px-6 py-14 text-[#f4f0e8] md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Breadcrumb items={breadcrumbs} />

          <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8ca667]">
            Knowledge Center
          </p>

          <h1 className="mt-4 max-w-4xl font-serif text-4xl font-medium tracking-[-0.045em] text-[#f4f0e8] md:text-6xl md:leading-[1.04]">
            Helpful guides for managing the technology in your home.
          </h1>

          <p className="mt-6 max-w-3xl text-base leading-8 text-[#b6c0c7] md:text-lg">
            Learn how to organize devices, document your network,
            track warranties, maintain smart-home equipment, and
            keep important household technology records easy to find.
          </p>
        </div>
      </header>

      <MarketingContent className="space-y-20 bg-[#eee9df]">
        <section>
          <div className="mb-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#617c43]">
              Browse by topic
            </p>

            <h2 className="mt-2 font-serif text-3xl font-medium tracking-[-0.035em] text-[#17212a]">
              Find the guide you need.
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {KNOWLEDGE_CATEGORIES.map((category) => {
              const count =
                articlesByCategory[category.slug]?.length ?? 0;

              return (
                <Link
                  key={category.slug}
                  href={knowledgeCategoryPath(category.slug)}
                  className="htv-focus-ring group flex min-h-[210px] flex-col rounded-[24px] border border-[#182533]/10 bg-[#f8f5ef] p-6 shadow-[0_18px_45px_-38px_rgba(15,25,35,0.4)] transition duration-200 hover:-translate-y-0.5 hover:border-[#617c43]/35 hover:shadow-[0_24px_50px_-36px_rgba(15,25,35,0.5)]"
                >
                  <div className="flex items-start justify-between gap-5">
                    <h3 className="font-serif text-2xl font-medium tracking-[-0.03em] text-[#17212a]">
                      {category.name}
                    </h3>

                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#617c43]/20 bg-[#eef3e8] text-[#617c43] transition group-hover:bg-[#617c43] group-hover:text-white">
                      <ArrowRight
                        size={15}
                        aria-hidden
                      />
                    </span>
                  </div>

                  <p className="mt-4 flex-1 text-sm leading-6 text-[#657078]">
                    {category.description}
                  </p>

                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.1em] text-[#617c43]">
                    {count} {count === 1 ? "article" : "articles"}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {KNOWLEDGE_CATEGORIES.map((category) => {
          const articles =
            articlesByCategory[category.slug] ?? [];

          return (
            <section key={category.slug}>
              <div className="flex items-end justify-between gap-4 border-b border-[#17212a]/10 pb-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#617c43]">
                    Knowledge
                  </p>

                  <h2 className="mt-2 font-serif text-3xl font-medium tracking-[-0.035em] text-[#17212a]">
                    {category.name}
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#657078]">
                    {category.description}
                  </p>
                </div>

                <Link
                  href={knowledgeCategoryPath(category.slug)}
                  className="htv-focus-ring hidden shrink-0 items-center gap-2 text-sm font-semibold text-[#617c43] transition hover:text-[#718d4f] sm:inline-flex"
                >
                  View all
                  <ArrowRight
                    size={14}
                    aria-hidden
                  />
                </Link>
              </div>

              <ul className="mt-7 grid gap-4 md:grid-cols-2">
                {articles.slice(0, 4).map((article) => (
                  <li key={article.slug}>
                    <Link
                      href={`/knowledge/${article.category}/${article.slug}`}
                      className="htv-focus-ring group flex h-full flex-col rounded-[22px] border border-[#182533]/10 bg-[#f8f5ef] p-5 transition hover:border-[#617c43]/30 hover:shadow-[0_18px_40px_-34px_rgba(15,25,35,0.5)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-serif text-lg font-medium leading-6 tracking-[-0.02em] text-[#17212a]">
                          {article.title}
                        </h3>

                        <ArrowRight
                          size={15}
                          className="mt-1 shrink-0 text-[#617c43] transition group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </div>

                      <p className="mt-3 flex-1 text-sm leading-6 text-[#657078]">
                        {article.description}
                      </p>

                      <p className="mt-5 text-xs font-medium text-[#8a9399]">
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
          title={`Put what you learn to work in ${siteConfig.name}`}
          description="Organize your devices, documents, warranties, network details, and household technology records in one secure place."
          primaryLabel="Start free"
          primaryHref={MARKETING_ROUTES.signup}
          secondaryLabel="See features"
          secondaryHref={MARKETING_ROUTES.features}
        />
      </MarketingContent>
    </MarketingLayout>
  );
}
