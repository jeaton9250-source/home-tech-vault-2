import { searchContent } from "@/lib/search-tools";
import { toolGuides } from "@/lib/resources/toolGuides";
import type { MetadataRoute } from "next";

import { KNOWLEDGE_CATALOG } from "@/lib/knowledge/catalog";
import {
  knowledgeArticlePath,
  knowledgeCategoryPath,
  KNOWLEDGE_CATEGORIES,
} from "@/lib/knowledge/categories";
import { INDEXABLE_MARKETING_PATHS } from "@/lib/marketing/routes";
import { getSiteUrl } from "@/lib/marketing/site";
import { comparisonSitemapEntries } from "@/lib/seo/comparisons/pages";

import { loadArticles } from "@/lib/cms/server";

const siteUrl = getSiteUrl();

/**
 * Revalidate hourly so Search Console receives fresh XML.
 */
export const revalidate = 3600;

/**
 * Keep the sitemap intentionally focused.
 *
 * We want Google prioritizing:
 * - core marketing pages
 * - category hubs
 * - strong editorial knowledge articles
 * - comparison pages
 *
 * Programmatic guides and individual SEO FAQ pages can be added
 * back gradually once the domain has stronger crawl/index coverage.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const resources = await loadArticles();


  const marketingEntries: MetadataRoute.Sitemap =
    INDEXABLE_MARKETING_PATHS.map((path) => ({
      url:
        path === "/"
          ? `${siteUrl}/`
          : `${siteUrl}${path}`,



      changeFrequency:
        path === "/"
          ? "weekly"
          : path === "/pricing" ||
              path === "/knowledge" ||
              path === "/guides" ||
              path === "/compare" ||
              path === "/faq"
            ? "weekly"
            : "monthly",

      priority:
        path === "/"
          ? 1
          : path === "/pricing"
            ? 0.9
            : path === "/knowledge" ||
                path === "/compare"
              ? 0.85
              : path === "/guides" ||
                  path === "/faq"
                ? 0.75
                : 0.7,
    }));

  const categoryEntries: MetadataRoute.Sitemap =
    KNOWLEDGE_CATEGORIES.map((category) => ({
      url: `${siteUrl}${knowledgeCategoryPath(
        category.slug
      )}`,

      changeFrequency: "weekly",
      priority: 0.75,
    }));

  const articleEntries: MetadataRoute.Sitemap =
    KNOWLEDGE_CATALOG.map((entry) => ({
      url: `${siteUrl}${knowledgeArticlePath(
        entry.category,
        entry.slug
      )}`,
      lastModified: new Date(entry.publishedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  const compareEntries: MetadataRoute.Sitemap =
    comparisonSitemapEntries(siteUrl);

  const entries: MetadataRoute.Sitemap = [
    ...["/answers", ...searchContent.tools.map(t=>`/tools/${t.slug}`), ...searchContent.articles.map(a=>`/answers/${a.slug}`)].map(path => ({url: `${siteUrl}${path}`, lastModified: new Date("2026-10-21"), changeFrequency: "monthly" as const, priority: 0.7})), 
    ...toolGuides.map(guide => ({url: `${siteUrl}/resources/${guide.slug}`, lastModified: new Date("2026-10-12"), changeFrequency: "monthly" as const, priority: 0.7})),
    ...resources.filter(article => !toolGuides.some(guide => guide.slug === article.slug)).map(article => ({url: `${siteUrl}/resources/${article.slug}`, changeFrequency: "monthly" as const, priority: 0.7})),
    {url: `${siteUrl}/resources`, changeFrequency: "weekly", priority: 0.7},
    ...marketingEntries,
    ...categoryEntries,
    ...articleEntries,
    ...compareEntries,
  ];
  return Array.from(new Map(entries.map(entry => [entry.url, entry])).values());
}
