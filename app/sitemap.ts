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
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const marketingEntries: MetadataRoute.Sitemap =
    INDEXABLE_MARKETING_PATHS.map((path) => ({
      url:
        path === "/"
          ? `${siteUrl}/`
          : `${siteUrl}${path}`,

      lastModified: now,

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
      lastModified: now,
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

  return [
    ...marketingEntries,
    ...categoryEntries,
    ...articleEntries,
    ...compareEntries,
  ];
}