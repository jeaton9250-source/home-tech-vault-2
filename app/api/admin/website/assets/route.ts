import { randomUUID } from "node:crypto";
import { platformAdminAccessResponse, requirePlatformAdminSession } from "@/lib/auth/platformAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { imageFormat, MAX_IMAGE_BYTES } from "@/lib/cms/imageValidation";
export async function GET() {
  try {
    await requirePlatformAdminSession();
    const {data,error}=await createAdminClient().from("website_assets").select("id,url,filename,created_at").order("created_at",{ascending:false}).limit(100);
    if(error) throw error;
    return Response.json({assets:data}, {headers:{"Cache-Control":"private, no-store"}});
  } catch(error) {return platformAdminAccessResponse(error) ?? Response.json({error:"Unable to load images."},{status:500});}
}
export async function POST(request:Request) {
  try {
    const session=await requirePlatformAdminSession(request);
    if(Number(request.headers.get("content-length")) > MAX_IMAGE_BYTES + 10000) return Response.json({error:"Choose an image smaller than 3 MB."},{status:413});
    const form=await request.formData();
    const file=form.get("file");
    if(!(file instanceof File) || file.size===0 || file.size > MAX_IMAGE_BYTES) return Response.json({error:"Choose an image smaller than 3 MB."},{status:400});
    const bytes=new Uint8Array(await file.arrayBuffer());
    const format=imageFormat(bytes);
    if(!format) return Response.json({error:"Upload a JPEG, PNG or WebP image."},{status:400});
    const db=createAdminClient();
    const path=`${randomUUID()}.${format.extension}`;
    const {error:uploadError}=await db.storage.from("website-assets").upload(path,bytes,{contentType:format.type,upsert:false,cacheControl:"31536000"});
    if(uploadError) throw uploadError;
    const {data:{publicUrl}}=db.storage.from("website-assets").getPublicUrl(path);
    const {data,error}=await db.from("website_assets").insert({path,url:publicUrl,filename:file.name.slice(0,200),uploaded_by:session.userId}).select("id,url,filename,created_at").single();
    if(error) {await db.storage.from("website-assets").remove([path]);throw error;}
    return Response.json({asset:data});
  } catch(error) {console.error("Website image upload failed",error);return platformAdminAccessResponse(error) ?? Response.json({error:"Unable to upload image. Please try again."},{status:500});}
}
