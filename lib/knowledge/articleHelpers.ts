import type { KnowledgeArticle } from "@/lib/knowledge/types";
import { countArticleWords } from "@/lib/knowledge/types";

/**
 * Shared helpers for Knowledge Center article modules.
 * Article bodies live in content/knowledge/** as reusable blog templates.
 */

export function readingMinutesFromArticle(
  article: Pick<
    KnowledgeArticle,
    "intro" | "sections" | "faq" | "title" | "description"
  >
): number {
  const words = countArticleWords({
    ...article,
    slug: "tmp",
    category: "devices",
    publishedAt: "2026-01-01",
    readingMinutes: 1,
    heroCaption: "",
    internalLinks: [],
    keywords: [],
  });

  return Math.max(8, Math.round(words / 220));
}

export function slugifyHeading(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
