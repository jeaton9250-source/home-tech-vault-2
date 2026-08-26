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

      <header className="border-b border-white/10 bg-[#183047] px-6 py-12 text-[#f5f1e8] md:px-8 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="[&_a]:text-white/55 [&_a:hover]:text-white [&_span]:text-white/35">
            <Breadcrumb items={breadcrumbs} />
          </div>

          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#718d4f]">
            {category?.name ?? "Knowledge"}
          </p>

          <h1 className="mt-3 max-w-4xl font-serif text-4xl font-medium tracking-[-0.045em] text-[#f5f1e8] md:text-6xl md:leading-[1.04]">
            {article.title}
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-[#b6c0c7] md:text-lg">
            {article.description}
          </p>

          <p className="mt-5 text-xs font-medium uppercase tracking-[0.12em] text-[#8e9aa3]">
            {article.readingMinutes} min read · Updated{" "}
            {article.updatedAt ?? article.publishedAt}
          </p>
        </div>
      </header>

      <MarketingContent className="grid gap-12 bg-[#eee9df] lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14">
        <article className="min-w-0">
          <figure className="overflow-hidden rounded-[28px] border border-[#182533]/10 bg-[#f8f5ef] shadow-[0_22px_55px_-42px_rgba(15,25,35,0.55)]">
            <div className="relative aspect-[21/9] bg-[#e4dfd5]">
              <Image
                src={hero.src}
                alt={hero.alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 720px"
                className="object-cover"
              />
            </div>
            <figcaption className="border-t border-[#182533]/10 px-5 py-3 text-xs leading-5 text-[#68737b]">
              {hero.caption || article.heroCaption}
            </figcaption>
          </figure>

          <div className="mt-10 space-y-5 rounded-[26px] border border-[#182533]/10 bg-[#f8f5ef] p-6 text-[1.02rem] leading-8 text-[#46535c] shadow-[0_18px_45px_-38px_rgba(15,25,35,0.35)] md:p-8">
            {article.intro.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-10 lg:hidden">
            <TableOfContents items={tocItems} />
          </div>

          <div className="mt-12 space-y-7">
            {article.sections.map((section) => (
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
            <div className="rounded-[24px] border border-white/10 bg-[#183047] p-5 text-[#f5f1e8] shadow-[0_20px_45px_-35px_rgba(0,0,0,0.7)]">
              <p className="font-serif text-lg font-medium text-[#f5f1e8]">
                Ready to organize?
              </p>
              <p className="mt-2 text-sm leading-6 text-[#b6c0c7]">
                Home Tech Vault keeps devices, documents, and warranties in one place.
              </p>
              <Link
                href={MARKETING_ROUTES.signup}
                className="htv-focus-ring mt-5 inline-flex items-center gap-2 rounded-full bg-[#617c43] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#718d4f]"
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
