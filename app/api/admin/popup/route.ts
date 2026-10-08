import { requirePlatformAdminSession,platformAdminAccessResponse } from "@/lib/auth/platformAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadPopupSettings } from "@/lib/popup/server";
import { popupSettingsSchema,csvCell } from "@/lib/popup/schema";
export async function GET(request:Request) {
  try {
    await requirePlatformAdminSession();
    const url=new URL(request.url);const csv=url.searchParams.get("format")==="csv";
    const campaign=url.searchParams.get("campaign")??"";
    const page=Math.max(0,Math.min(100000,Number(url.searchParams.get("page"))||0));
    const db=createAdminClient();
    let query=db.from("popup_submissions").select("id,campaign,name,email,phone,message,marketing_consent,consent_text,source_page,created_at",{count:"exact"}).order("created_at",{ascending:false});
    if(campaign)query=query.eq("campaign",campaign);
    if(csv){
      const rows=[];
      for(let offset=0;offset<100000;offset+=1000){let batch=db.from("popup_submissions").select("id,campaign,name,email,phone,message,marketing_consent,consent_text,source_page,created_at").order("created_at",{ascending:false}).order("id").range(offset,offset+999);if(campaign)batch=batch.eq("campaign",campaign);const {data,error}=await batch;if(error)throw error;rows.push(...(data??[]));if((data?.length??0)<1000)break;}
      const headers=["Date","Campaign","Name","Email","Phone","Message","Marketing consent","Consent wording","Page"];
      const content=[headers,...rows.map(row=>[row.created_at,row.campaign,row.name,row.email,row.phone,row.message,row.marketing_consent?"Yes":"No",row.consent_text,row.source_page])].map(row=>row.map(csvCell).join(",")).join("\r\n");
      return new Response(content,{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":"attachment; filename=popup-submissions.csv","Cache-Control":"private, no-store"}});
    }
    const [result,configuration]=await Promise.all([query.range(page*25,page*25+24),loadPopupSettings()]);
    if(result.error)throw result.error;
    return Response.json({...configuration,entries:result.data,count:result.count},{headers:{"Cache-Control":"private, no-store"}});
  } catch(error){return platformAdminAccessResponse(error)??Response.json({error:"Unable to load popup data."},{status:500});}
}
export async function PUT(request:Request) {
  try {
    const session=await requirePlatformAdminSession(request);
    const parsed=popupSettingsSchema.safeParse(await request.json());
    if(!parsed.success)return Response.json({error:parsed.error.issues[0]?.message??"Check settings."},{status:400});
    const {error}=await createAdminClient().from("popup_settings").upsert({id:1,content:parsed.data,updated_by:session.userId,updated_at:new Date().toISOString()});
    if(error)throw error;
    return Response.json({ok:true});
  }catch(error){return platformAdminAccessResponse(error)??Response.json({error:"Unable to save popup settings."},{status:500});}
}
