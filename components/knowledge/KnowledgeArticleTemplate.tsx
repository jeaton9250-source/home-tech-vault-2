import Image from "next/image";
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
import TableOfContents from "@/components/knowledge/TableOfContents";
import {
  getKnowledgeCategory,
  knowledgeArticlePath,
  knowledgeCategoryPath,
  type KnowledgeCategorySlug,
} from "@/lib/knowledge/categories";
import { getKnowledgeHeroImage } from "@/lib/knowledge/heroImages";
import type { KnowledgeArticle } from "@/lib/knowledge/types";
import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { siteConfig } from "@/lib/marketing/site";
import {
  createArticleJsonLd,
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createSoftwareApplicationJsonLd,
} from "@/lib/seo/jsonLd";

type KnowledgeArticleTemplateProps = {
  article: KnowledgeArticle;
  related: KnowledgeArticle[];
};

export default function KnowledgeArticleTemplate({
  article,
  related,
}: KnowledgeArticleTemplateProps) {
  const category = getKnowledgeCategory(article.category);
  const path = knowledgeArticlePath(
    article.category,
    article.slug
  );
  const hero = getKnowledgeHeroImage(article.slug);

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Knowledge", href: "/knowledge" },
    {
      name: category?.name ?? article.category,
      href: knowledgeCategoryPath(article.category),
    },
    { name: article.title },
  ];

  const tocItems = article.sections.map((section) => ({
    id: section.id,
    label: section.heading,
  }));

  const relatedLinks = [
    ...related.map((item) => ({
      href: knowledgeArticlePath(item.category, item.slug),
      label: item.title,
      description: item.description,
    })),
    ...article.internalLinks.map((link) => ({
      href: link.href,
      label: link.label,
      description: link.description,
    })),
  ];

  const jsonLd = [
    createArticleJsonLd({
      title: article.title,
      description: article.description,
      path,
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
      keywords: article.keywords,
      imagePath: hero.src,
    }),
    createSoftwareApplicationJsonLd({
      description: article.description,
      urlPath: path,
    }),
    createBreadcrumbJsonLd(
      breadcrumbs.map((item) => ({
        name: item.name,
        path: item.href,
      }))
    ),
    createFaqJsonLd(article.faq),
  ];

  return (
    <MarketingLayout>
      <StructuredData
        id={`knowledge-article-${article.slug}`}
        data={jsonLd}
      />

      <header className="border-b border-border-subtle/80 px-6 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-6xl">
          <Breadcrumb items={breadcrumbs} />

          <p className="mt-6 text-overline text-text-muted">
            {category?.name ?? "Knowledge"}
          </p>

          <h1 className="mt-3 max-w-3xl text-3xl font-medium tracking-[-0.04em] text-text-primary md:text-5xl md:leading-[1.08]">
            {article.title}
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-text-muted">
            {article.description}
          </p>

          <p className="mt-4 text-sm text-text-tertiary">
            {article.readingMinutes} min read · Updated{" "}
            {article.updatedAt ?? article.publishedAt}
          </p>
        </div>
      </header>

      <MarketingContent className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14">
        <article className="min-w-0">
          <figure className="overflow-hidden border border-border-subtle bg-surface-card">
            <div className="relative aspect-[21/9] bg-surface-raised">
              <Image
                src={hero.src}
                alt={hero.alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 720px"
                className="object-cover"
              />
            </div>
            <figcaption className="border-t border-border-subtle px-4 py-3 text-sm text-text-muted">
              {hero.caption || article.heroCaption}
            </figcaption>
          </figure>

          <div className="mt-10 space-y-5 text-base leading-8 text-text-secondary">
            {article.intro.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-10 lg:hidden">
            <TableOfContents items={tocItems} />
          </div>

          <div className="mt-12 space-y-12">
            {article.sections.map((section) => (
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

          <div className="mt-14">
            <Faq
              title="Frequently asked questions"
              items={article.faq}
              includeJsonLd={false}
            />
          </div>

          <div className="mt-14">
            <CoreSiteLinks
              currentPath={path}
              related={relatedLinks}
            />
          </div>

          <div className="mt-14">
            <CallToAction
              title={`Put this into practice in ${siteConfig.name}`}
              description="Turn the habits in this guide into a living inventory, document vault, and household record."
              primaryLabel="Start free"
              primaryHref={MARKETING_ROUTES.signup}
              secondaryLabel="See features"
              secondaryHref={MARKETING_ROUTES.features}
            />
          </div>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <TableOfContents items={tocItems} />
            <div className="border border-border-subtle bg-surface-card p-5">
              <p className="text-sm font-medium text-text-primary">
                Ready to organize?
              </p>
              <p className="mt-2 text-sm leading-6 text-text-muted">
                Home Tech Vault keeps devices, documents, and warranties in one place.
              </p>
              <Link
                href={MARKETING_ROUTES.signup}
                className="htv-focus-ring mt-4 inline-flex items-center gap-2 text-sm font-medium text-text-primary"
              >
                Create free account
                <ArrowRight size={14} aria-hidden />
              </Link>
            </div>
          </div>
        </aside>
      </MarketingContent>
    </MarketingLayout>
  );
}

export function categoryLabel(
  slug: KnowledgeCategorySlug
): string {
  return getKnowledgeCategory(slug)?.name ?? slug;
}
