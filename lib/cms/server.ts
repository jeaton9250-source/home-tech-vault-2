import "server-only";
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { homepageDefaults, homepageSchema, type Article } from "./schema";
export const loadHomepage = cache(async () => {
  try {
    const {data, error} = await createAdminClient().from("website_content").select("content").eq("key", "homepage").maybeSingle();
    if (error) throw error;
    const parsed = homepageSchema.safeParse(data?.content);
    return parsed.success ? parsed.data : homepageDefaults;
  } catch (error) { console.error("Homepage content unavailable", error); return homepageDefaults; }
});
export const loadArticles = cache(async (): Promise<Article[]> => {
  try {
    const { data, error } = await createAdminClient().from("website_articles").select("slug,title,description,body,published").eq("published", true).order("updated_at", {ascending: false});
    if (error) throw error;
    return data ?? [];
  } catch (error) { console.error("Resources unavailable", error); return []; }
});
