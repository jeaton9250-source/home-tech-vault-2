import { requirePlatformAdminSession, platformAdminAccessResponse } from "@/lib/auth/platformAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { homepageSchema, articleSchema } from "@/lib/cms/schema";
import { revalidatePath } from "next/cache";
export async function PUT(request: Request) {
  try {
    const session = await requirePlatformAdminSession(request);
    const body = await request.json();
    const parsed = body.kind === "homepage" ? homepageSchema.safeParse(body.content) : body.kind === "article" ? articleSchema.safeParse(body.content) : null;
    if (!parsed?.success) return Response.json({error: parsed?.error.issues[0]?.message ?? "Invalid content type."}, {status: 400});
    const db = createAdminClient();
    const {error} = body.kind === "homepage"
      ? await db.from("website_content").upsert({key: "homepage", content: parsed.data, updated_by: session.userId, updated_at: new Date().toISOString()})
      : body.create === true
        ? await db.from("website_articles").insert({...parsed.data, updated_by: session.userId, updated_at: new Date().toISOString()})
        : await db.from("website_articles").update({...parsed.data, updated_by: session.userId, updated_at: new Date().toISOString()}).eq("slug", body.content.slug);
    if (error?.code === "23505") return Response.json({error:"An article already uses this URL name. Choose another or open the existing article."}, {status:409});
    if (error) throw error;
    revalidatePath("/"); revalidatePath("/resources", "layout"); revalidatePath("/sitemap.xml"); revalidatePath("/admin/website");
    return Response.json({ok: true});
  } catch (error) {
    const access = platformAdminAccessResponse(error); if (access) return access;
    if (error instanceof SyntaxError) return Response.json({error: "Invalid request."}, {status: 400});
    console.error("Website save failed", error);
    return Response.json({error: "Unable to save. Please try again."}, {status: 500});
  }
}
