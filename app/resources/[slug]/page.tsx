import { toolGuides } from "@/lib/resources/toolGuides";
import ToolGuideArticle from "@/components/tools/ToolGuideArticle";
import { createSeoMetadata } from "@/lib/seo/metadata";
import { notFound } from "next/navigation";
import Link from "next/link";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import HomeMarketingFooter from "@/components/marketing/HomeMarketingFooter";
import { loadArticles } from "@/lib/cms/server";
import { getSiteUrl } from "@/lib/marketing/site";
export const dynamic = "force-dynamic";
type Props = {params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props) {
  const {slug} = await params;
  const guide = toolGuides.find(item=>item.slug===slug);
  if (guide) return createSeoMetadata({title: `${guide.title} | Home Tech Vault`, description:guide.description, path:`/resources/${slug}`, type:"article", publishedTime:"2026-10-12"});
  const article = (await loadArticles()).find(item=>item.slug===slug);
  if(!article) return {title:"Resource not found",robots:{index:false}};
  return {title:`${article.title} | Home Tech Vault`,description:article.description,alternates:{canonical:`${getSiteUrl()}/resources/${slug}`}};
}
export default async function ArticlePage({params}:Props) {
  const {slug}=await params;
  const guide=toolGuides.find(item=>item.slug===slug);
  if(guide) return <ToolGuideArticle guide={guide}/>;
  const article=(await loadArticles()).find(item=>item.slug===slug);
  if(!article) notFound();
  return <><MarketingHeader/><main className="mx-auto max-w-3xl px-6 py-20"><Link href="/resources" className="underline">← All resources</Link><article><h1 className="mt-8 text-4xl font-semibold">{article.title}</h1><p className="mt-5 text-xl text-gray-600">{article.description}</p><div className="mt-10 space-y-6">{article.body.split(/\n\s*\n/).map((block,index)=>block.startsWith("## ") ? <h2 key={index} className="text-2xl font-semibold">{block.slice(3)}</h2> : <p key={index} className="whitespace-pre-line text-lg leading-8">{block}</p>)}</div></article><Link href="/signup" className="mt-12 inline-block rounded-full bg-[#152335] px-6 py-3 text-white">Organize your home for free</Link></main><HomeMarketingFooter/></>;
}
