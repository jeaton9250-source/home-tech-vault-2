import { createAdminClient } from "@/lib/supabase/admin";
import { loadHomepage } from "@/lib/cms/server";
import WebsiteEditor from "@/components/admin/website/WebsiteEditor";
import { AdminPageHero } from "@/components/admin/layout/AdminPageLayout";
export default async function WebsiteAdminPage() {
  const [homepage, result, draft] = await Promise.all([loadHomepage(), createAdminClient().from("website_articles").select("slug,title,description,body,published").order("updated_at", {ascending:false}), createAdminClient().from("website_drafts").select("content").eq("key","homepage").maybeSingle()]);
  if (result.error) throw result.error;
  if (draft.error) throw draft.error;
  return <><AdminPageHero title="Website" description="Edit your homepage and publish resource articles. Preview changes, save drafts, upload images and publish when ready." /><WebsiteEditor initialHomepage={homepage} initialDraft={draft.data?.content ?? null} initialArticles={result.data ?? []} /></>;
}
