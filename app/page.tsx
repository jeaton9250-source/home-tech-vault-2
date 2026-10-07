import { loadHomepage } from "@/lib/cms/server";
import HomeMarketingView from "@/components/marketing/HomeMarketingView";
export const dynamic = "force-dynamic";
export default async function HomePage() { return <HomeMarketingView content={await loadHomepage()}/>; }
