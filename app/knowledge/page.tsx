import KnowledgeHub from "@/components/knowledge/KnowledgeHub";
import {
  getAllKnowledgeArticles,
} from "@/lib/knowledge/articles";
import {
  KNOWLEDGE_CATEGORIES,
  type KnowledgeCategorySlug,
} from "@/lib/knowledge/categories";
import type { KnowledgeArticle } from "@/lib/knowledge/types";
import { createSeoMetadata } from "@/lib/seo";

export const metadata = createSeoMetadata({
  title: "Knowledge Center — Home Tech Guides",
  description:
    "Practical long-form guides for home devices, networking, smart home gear, warranties, maintenance, and buying decisions.",
  path: "/knowledge",
  keywords: [
    "home tech guides",
    "device inventory guide",
    "home network documentation",
    "warranty tracker guide",
  ],
});

export default async function KnowledgePage() {
  const articles = await getAllKnowledgeArticles();

  const articlesByCategory = Object.fromEntries(
    KNOWLEDGE_CATEGORIES.map((category) => [
      category.slug,
      articles.filter(
        (article) => article.category === category.slug
      ),
    ])
  ) as Record<KnowledgeCategorySlug, KnowledgeArticle[]>;

  return <KnowledgeHub articlesByCategory={articlesByCategory} />;
}
