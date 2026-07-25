import { notFound } from "next/navigation";

import KnowledgeCategoryTemplate from "@/components/knowledge/KnowledgeCategoryTemplate";
import { getKnowledgeArticlesByCategory } from "@/lib/knowledge/articles";
import {
  getKnowledgeCategory,
  KNOWLEDGE_CATEGORIES,
  knowledgeCategoryPath,
  type KnowledgeCategorySlug,
} from "@/lib/knowledge/categories";
import { createSeoMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ category: string }>;
};

export function generateStaticParams() {
  return KNOWLEDGE_CATEGORIES.map((category) => ({
    category: category.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { category: categorySlug } = await params;
  const category = getKnowledgeCategory(categorySlug);

  if (!category) {
    return {};
  }

  return createSeoMetadata({
    title: `${category.name} Guides — Knowledge Center`,
    description: category.description,
    path: knowledgeCategoryPath(category.slug),
    keywords: [category.name.toLowerCase(), "home tech guides"],
  });
}

export default async function KnowledgeCategoryPage({
  params,
}: PageProps) {
  const { category: categorySlug } = await params;
  const category = getKnowledgeCategory(categorySlug);

  if (!category) {
    notFound();
  }

  const articles = await getKnowledgeArticlesByCategory(
    category.slug as KnowledgeCategorySlug
  );

  return (
    <KnowledgeCategoryTemplate
      categorySlug={category.slug}
      articles={articles}
    />
  );
}
