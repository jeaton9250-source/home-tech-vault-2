import { requirePlatformAdminSession, platformAdminAccessResponse } from "@/lib/auth/platformAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
export async function GET(request:Request) {
  try {
    await requirePlatformAdminSession();
    const url=new URL(request.url);
    const id=url.searchParams.get("id");
    const db=createAdminClient();
    if(id) {
      if(!/^[0-9]+$/.test(id)) return Response.json({error:"Invalid version."},{status:400});
      const {data,error}=await db.from("website_versions").select("id,kind,key,content,created_at,action").eq("id",id).maybeSingle();
      if(error) throw error;
      if(!data) return Response.json({error:"Version not found."},{status:404});
      return Response.json({version:data},{headers:{"Cache-Control":"private, no-store"}});
    }
    const kind=url.searchParams.get("kind");const key=url.searchParams.get("key");
    if(!["homepage","article"].includes(kind??"") || !key) return Response.json({error:"Choose content to view history."},{status:400});
    const {data,error}=await db.from("website_versions").select("id,kind,key,action,created_at").eq("kind",kind).eq("key",key).order("id",{ascending:false}).limit(30);
    if(error) throw error;
    return Response.json({versions:data},{headers:{"Cache-Control":"private, no-store"}});
  } catch(error) {return platformAdminAccessResponse(error) ?? Response.json({error:"Unable to load history."},{status:500});}
}
