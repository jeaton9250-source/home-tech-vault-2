import Link from "next/link";

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

      <header className="border-b border-border-subtle/80 px-6 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-6xl">
          <Breadcrumb items={breadcrumbs} />
          <p className="mt-6 text-overline text-text-muted">
            Knowledge · {category.name}
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-medium tracking-[-0.04em] text-text-primary md:text-5xl md:leading-[1.08]">
            {category.name}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-text-muted">
            {category.description}
          </p>
        </div>
      </header>

      <MarketingContent>
        <ul className="grid gap-4 md:grid-cols-2">
          {articles.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/knowledge/${article.category}/${article.slug}`}
                className="htv-focus-ring group flex h-full flex-col border border-border-subtle bg-surface-card p-6 transition hover:border-border-strong"
              >
                <h2 className="text-lg font-medium tracking-[-0.02em] text-text-primary">
                  {article.title}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-text-muted">
                  {article.description}
                </p>
                <p className="mt-5 text-xs text-text-tertiary">
                  {article.readingMinutes} min read · Updated{" "}
                  {article.updatedAt ?? article.publishedAt}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-16">
          <CallToAction
            title={`Put ${category.name.toLowerCase()} knowledge to work`}
            description={`${siteConfig.name} helps you keep the records these guides describe — devices, documents, and household details in one place.`}
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
