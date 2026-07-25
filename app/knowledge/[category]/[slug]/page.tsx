import { notFound } from "next/navigation";

import KnowledgeArticleTemplate from "@/components/knowledge/KnowledgeArticleTemplate";
import {
  getKnowledgeArticle,
  getRelatedKnowledgeArticles,
  listKnowledgeStaticParams,
} from "@/lib/knowledge/articles";
import {
  getKnowledgeCategory,
  knowledgeArticlePath,
} from "@/lib/knowledge/categories";
import { createSeoMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ category: string; slug: string }>;
};

export function generateStaticParams() {
  return listKnowledgeStaticParams();
}

export async function generateMetadata({ params }: PageProps) {
  const { category: categorySlug, slug } = await params;
  const article = await getKnowledgeArticle(slug);

  if (!article || article.category !== categorySlug) {
    return {};
  }

  return createSeoMetadata({
    title: article.title,
    description: article.description,
    path: knowledgeArticlePath(article.category, article.slug),
    type: "article",
    publishedTime: article.publishedAt,
    keywords: article.keywords,
  });
}

export default async function KnowledgeArticlePage({
  params,
}: PageProps) {
  const { category: categorySlug, slug } = await params;

  if (!getKnowledgeCategory(categorySlug)) {
    notFound();
  }

  const article = await getKnowledgeArticle(slug);

  if (!article || article.category !== categorySlug) {
    notFound();
  }

  const related = await getRelatedKnowledgeArticles(article);

  return (
    <KnowledgeArticleTemplate
      article={article}
      related={related}
    />
  );
}
