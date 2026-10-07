import { createAdminClient } from "@/lib/supabase/admin";
import { loadHomepage } from "@/lib/cms/server";
import WebsiteEditor from "@/components/admin/website/WebsiteEditor";
import { AdminPageHero } from "@/components/admin/layout/AdminPageLayout";
export default async function WebsiteAdminPage() {
  const [homepage, result] = await Promise.all([loadHomepage(), createAdminClient().from("website_articles").select("slug,title,description,body,published").order("updated_at", {ascending:false})]);
  if (result.error) throw result.error;
  return <><AdminPageHero title="Website" description="Edit your homepage and publish resource articles. Saved homepage changes appear on the website immediately." /><WebsiteEditor initialHomepage={homepage} initialArticles={result.data ?? []} /></>;
}
