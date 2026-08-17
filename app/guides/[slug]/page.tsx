import { notFound } from "next/navigation";

import ProgrammaticGuideTemplate from "@/components/seo/ProgrammaticGuideTemplate";
import {
  getProgrammaticGuide,
  getRelatedProgrammaticGuides,
  listProgrammaticGuideStaticParams,
} from "@/lib/seo/programmatic";
import { createSeoMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return listProgrammaticGuideStaticParams();
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const page = getProgrammaticGuide(slug);

  if (!page) {
    return {};
  }

  return createSeoMetadata({
    title: page.metaTitle.replace(
      /\s*\|\s*Home Tech Vault$/,
      ""
    ),
    description: page.metaDescription,
    path: page.path,
    type: "article",
    keywords: page.keywords,
  });
}

export default async function ProgrammaticGuidePage({
  params,
}: PageProps) {
  const { slug } = await params;
  const page = getProgrammaticGuide(slug);

  if (!page) {
    notFound();
  }

  const related = getRelatedProgrammaticGuides(page);

  return (
    <ProgrammaticGuideTemplate page={page} related={related} />
  );
}
