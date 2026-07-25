import { notFound } from "next/navigation";

import ComparisonPageTemplate from "@/components/seo/ComparisonPageTemplate";
import {
  getComparisonPage,
  getRelatedComparisonPages,
  listComparisonStaticParams,
} from "@/lib/seo/comparisons/pages";
import { createSeoMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return listComparisonStaticParams();
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const page = getComparisonPage(slug);

  if (!page) {
    return {};
  }

  return createSeoMetadata({
    title: page.title,
    description: page.metaDescription,
    path: page.path,
    keywords: page.keywords,
  });
}

export default async function ComparisonSlugPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const page = getComparisonPage(slug);

  if (!page) {
    notFound();
  }

  const related = getRelatedComparisonPages(page).map((item) => ({
    href: item.path,
    title: item.title,
    description: item.metaDescription,
  }));

  return (
    <ComparisonPageTemplate page={page} related={related} />
  );
}
