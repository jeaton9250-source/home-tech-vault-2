import type { KnowledgeCategorySlug } from "@/lib/knowledge/categories";

export type KnowledgeFaqItem = {
  question: string;
  answer: string;
};

export type KnowledgeSection = {
  id: string;
  heading: string;
  paragraphs: string[];
};

export type KnowledgeArticle = {
  slug: string;
  category: KnowledgeCategorySlug;
  title: string;
  description: string;
  /** ISO date YYYY-MM-DD */
  publishedAt: string;
  updatedAt?: string;
  readingMinutes: number;
  heroCaption: string;
  intro: string[];
  sections: KnowledgeSection[];
  faq: KnowledgeFaqItem[];
  /** Absolute site paths for internal linking */
  internalLinks: Array<{
    href: string;
    label: string;
    description: string;
  }>;
  keywords: string[];
};

export function countArticleWords(
  article: KnowledgeArticle
): number {
  const chunks = [
    article.title,
    article.description,
    ...article.intro,
    ...article.sections.flatMap((section) => [
      section.heading,
      ...section.paragraphs,
    ]),
    ...article.faq.flatMap((item) => [
      item.question,
      item.answer,
    ]),
  ];

  return chunks
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}
