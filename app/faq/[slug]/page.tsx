import { notFound } from "next/navigation";

import SeoFaqPageTemplate from "@/components/seo/SeoFaqPageTemplate";
import {
  getAllSeoFaqs,
  getSeoFaq,
  listSeoFaqStaticParams,
  seoFaqPath,
} from "@/lib/seo/faqs/catalog";
import { createSeoMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return listSeoFaqStaticParams();
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const faq = getSeoFaq(slug);

  if (!faq) {
    return {};
  }

  return createSeoMetadata({
    title: faq.question,
    description: faq.answer.slice(0, 158),
    path: seoFaqPath(faq.slug),
    keywords: [faq.category.toLowerCase(), "home tech vault faq"],
  });
}

export default async function SeoFaqSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const faq = getSeoFaq(slug);

  if (!faq) {
    notFound();
  }

  const relatedFaqs = getAllSeoFaqs()
    .filter(
      (entry) =>
        entry.slug !== faq.slug && entry.category === faq.category
    )
    .slice(0, 4);

  return (
    <SeoFaqPageTemplate faq={faq} relatedFaqs={relatedFaqs} />
  );
}
