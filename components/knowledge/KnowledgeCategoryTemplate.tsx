import Link from "next/link";
import { ArrowRight } from "lucide-react";

import MarketingLayout, {
  MarketingContent,
} from "@/components/marketing/MarketingLayout";
import {
  Breadcrumb,
  CallToAction,
  StructuredData,
} from "@/components/seo";
import {
  knowledgeCategoryPath,
  type KnowledgeCategorySlug,
  getKnowledgeCategory,
} from "@/lib/knowledge/categories";
import type { KnowledgeArticle } from "@/lib/knowledge/types";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { siteConfig } from "@/lib/marketing/site";
import {
  createBreadcrumbJsonLd,
  createSoftwareApplicationJsonLd,
  createWebPageJsonLd,
} from "@/lib/seo/jsonLd";

type KnowledgeCategoryTemplateProps = {
  categorySlug: KnowledgeCategorySlug;
  articles: KnowledgeArticle[];
};

export default function KnowledgeCategoryTemplate({
  categorySlug,
  articles,
}: KnowledgeCategoryTemplateProps) {
  const category = getKnowledgeCategory(categorySlug)!;
  const path = knowledgeCategoryPath(categorySlug);

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Knowledge", href: "/knowledge" },
    { name: category.name },
  ];

  const jsonLd = [
    createWebPageJsonLd({
      title: `${category.name} Guides`,
      description: category.description,
      path,
    }),
    createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Knowledge", path: "/knowledge" },
      { name: category.name, path },
    ]),
    createSoftwareApplicationJsonLd({
      description: category.description,
      urlPath: path,
    }),
  ];

  return (
    <MarketingLayout>
      <StructuredData
        id={`knowledge-category-${categorySlug}`}
        data={jsonLd}
      />

      <header className="border-b border-white/10 bg-[#183047] px-6 py-14 text-[#f5f1e8] md:px-8 md:py-18">
        <div className="mx-auto max-w-6xl">
          <Breadcrumb items={breadcrumbs} />

          <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
            Knowledge Center · {category.name}
          </p>

          <h1 className="mt-4 max-w-4xl font-serif text-4xl font-medium tracking-[-0.045em] text-[#f5f1e8] md:text-6xl md:leading-[1.04]">
            {category.name} guides
          </h1>

          <p className="mt-6 max-w-3xl text-base leading-8 text-[#b6c0c7] md:text-lg">
            {category.description}
          </p>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-[#8e9aa2]">
            {articles.length} {articles.length === 1 ? "guide" : "guides"}
          </p>
        </div>
      </header>

      <MarketingContent className="bg-[#eee9df]">
        <div className="mb-8 flex items-end justify-between gap-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#617c43]">
              Browse {category.name}
            </p>

            <h2 className="mt-2 font-serif text-3xl font-medium tracking-[-0.035em] text-[#17212a]">
              Explore every guide.
            </h2>
          </div>

          <Link
            href="/knowledge"
            className="htv-focus-ring hidden items-center gap-2 text-sm font-semibold text-[#617c43] transition hover:text-[#718d4f] sm:inline-flex"
          >
            All topics
            <ArrowRight
              size={14}
              aria-hidden
            />
          </Link>
        </div>

        <ul className="grid gap-5 md:grid-cols-2">
          {articles.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/knowledge/${article.category}/${article.slug}`}
                className="htv-focus-ring group flex h-full min-h-[220px] flex-col rounded-[24px] border border-[#182533]/10 bg-[#f8f5ef] p-6 shadow-[0_18px_45px_-38px_rgba(15,25,35,0.4)] transition duration-200 hover:-translate-y-0.5 hover:border-[#617c43]/35 hover:shadow-[0_24px_50px_-36px_rgba(15,25,35,0.5)]"
              >
                <div className="flex items-start justify-between gap-5">
                  <h2 className="font-serif text-xl font-medium leading-7 tracking-[-0.025em] text-[#17212a]">
                    {article.title}
                  </h2>

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#617c43]/20 bg-[#eef3e8] text-[#617c43] transition group-hover:bg-[#617c43] group-hover:text-white">
                    <ArrowRight
                      size={15}
                      aria-hidden
                    />
                  </span>
                </div>

                <p className="mt-4 flex-1 text-sm leading-6 text-[#657078]">
                  {article.description}
                </p>

                <div className="mt-6 border-t border-[#17212a]/10 pt-4">
                  <p className="text-xs font-medium text-[#8a9399]">
                    {article.readingMinutes} min read · Updated{" "}
                    {article.updatedAt ?? article.publishedAt}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-16">
          <CallToAction
            title={`Make ${category.name.toLowerCase()} easier to manage`}
            description={`${siteConfig.name} gives your household one place for the devices, documents, warranties, and technology records these guides help you organize.`}
            primaryLabel="Start free"
            primaryHref={MARKETING_ROUTES.signup}
            secondaryLabel="Browse all knowledge"
            secondaryHref="/knowledge"
          />
        </div>
      </MarketingContent>
    </MarketingLayout>
  );
}
