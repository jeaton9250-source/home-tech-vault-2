/**
 * Reusable Knowledge Center blog article shape.
 * Concrete articles live in content/knowledge/<category>/<slug>.ts
 * and render through KnowledgeArticleTemplate.
 */
export type {
  KnowledgeArticle,
  KnowledgeFaqItem,
  KnowledgeSection,
} from "@/lib/knowledge/types";

export { readingMinutesFromArticle, slugifyHeading } from "@/lib/knowledge/articleHelpers";
export { default as KnowledgeArticleTemplate } from "@/components/knowledge/KnowledgeArticleTemplate";
export { default as KnowledgeHub } from "@/components/knowledge/KnowledgeHub";
export { default as KnowledgeCategoryTemplate } from "@/components/knowledge/KnowledgeCategoryTemplate";
export { default as TableOfContents } from "@/components/knowledge/TableOfContents";
