import Link from "next/link";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import HomeMarketingFooter from "@/components/marketing/HomeMarketingFooter";
import { loadArticles } from "@/lib/cms/server";
export const dynamic = "force-dynamic";
export const metadata = {title: "Homeowner Resources | Home Tech Vault", description: "Practical guides for keeping your home records organized."};
export default async function ResourcesPage() {
  const articles = await loadArticles();
  return <><MarketingHeader/><main className="mx-auto min-h-[60vh] max-w-5xl px-6 py-20"><h1 className="text-4xl font-semibold">Homeowner resources</h1><p className="mt-4 text-lg">Practical help for managing the details of your home.</p><div className="mt-10 grid gap-6 md:grid-cols-2">{articles.map(article=><Link key={article.slug} href={`/resources/${article.slug}`} className="rounded-2xl border p-6 hover:bg-gray-50"><h2 className="text-2xl font-semibold">{article.title}</h2><p className="mt-3">{article.description}</p><p className="mt-5 underline">Read article →</p></Link>)}</div>{!articles.length ? <p className="mt-10">New guides are on the way. <Link href="/knowledge" className="underline">Explore our knowledge library.</Link></p> : null}</main><HomeMarketingFooter/></>;
}
