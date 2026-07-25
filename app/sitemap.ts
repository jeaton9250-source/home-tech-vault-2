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
import { seoFaqSitemapEntries } from "@/lib/seo/faqs/catalog";
import { programmaticGuideSitemapEntries } from "@/lib/seo/programmatic";

const siteUrl = getSiteUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const marketingEntries: MetadataRoute.Sitemap =
    INDEXABLE_MARKETING_PATHS.map((path) => ({
      url:
        path === "/"
          ? `${siteUrl}/`
          : `${siteUrl}${path}`,
      lastModified,
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
                path === "/guides" ||
                path === "/compare"
              ? 0.85
              : 0.7,
    }));

  const categoryEntries: MetadataRoute.Sitemap =
    KNOWLEDGE_CATEGORIES.map((category) => ({
      url: `${siteUrl}${knowledgeCategoryPath(category.slug)}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));

  const articleEntries: MetadataRoute.Sitemap =
    KNOWLEDGE_CATALOG.map((entry) => ({
      url: `${siteUrl}${knowledgeArticlePath(entry.category, entry.slug)}`,
      lastModified: new Date(entry.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }));

  const guideEntries: MetadataRoute.Sitemap =
    programmaticGuideSitemapEntries(siteUrl);

  const compareEntries: MetadataRoute.Sitemap =
    comparisonSitemapEntries(siteUrl);

  const faqEntries: MetadataRoute.Sitemap =
    seoFaqSitemapEntries(siteUrl);

  return [
    ...marketingEntries,
    ...categoryEntries,
    ...articleEntries,
    ...guideEntries,
    ...compareEntries,
    ...faqEntries,
  ];
}
