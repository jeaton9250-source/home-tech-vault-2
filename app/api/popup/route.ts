import { createAdminClient } from "@/lib/supabase/admin";
import { loadPopupSettings } from "@/lib/popup/server";
import { popupMatchesPage,submissionSchema } from "@/lib/popup/schema";
import { getSubmitterIpHash } from "@/lib/support/rateLimit";
export async function GET(request:Request) {
  try {
    const {settings,revision}=await loadPopupSettings();
    const page=new URL(request.url).searchParams.get("page")??"/";
    return Response.json(settings.enabled&&popupMatchesPage(settings,page) ? {settings,revision} : {settings:null},{headers:{"Cache-Control":"no-store"}});
  } catch {return Response.json({settings:null},{headers:{"Cache-Control":"no-store"}});}
}
export async function POST(request:Request) {
  try {
    if(request.headers.get("origin")!==new URL(request.url).origin)return Response.json({error:"Invalid request origin."},{status:403});
    if(Number(request.headers.get("content-length"))>12000)return Response.json({error:"Submission is too large."},{status:413});
    const body=await request.text();if(body.length>12000)return Response.json({error:"Submission is too large."},{status:413});
    const parsed=submissionSchema.safeParse(JSON.parse(body));
    if(!parsed.success)return Response.json({error:parsed.error.issues[0]?.message??"Check your details."},{status:400});
    const input=parsed.data;
    if(input.website)return Response.json({ok:true});
    const db=createAdminClient();
    const {data:allowed,error:limitError}=await db.rpc("consume_popup_rate_limit",{p_key:getSubmitterIpHash(request)??"unknown"});
    if(limitError)throw limitError;
    if(!allowed)return Response.json({error:"Too many attempts. Please try again in an hour."},{status:429});
    const {settings,revision}=await loadPopupSettings();
    if(!settings.enabled||!popupMatchesPage(settings,input.page))return Response.json({error:"This form is no longer available."},{status:410});
    if(input.campaign!==settings.campaign||input.revision!==revision)return Response.json({error:"This form has changed. Refresh this page and try again."},{status:409});
    const {error}=await db.from("popup_submissions").upsert({campaign:settings.campaign,email:input.email,name:settings.showName?input.name:"",phone:settings.showPhone?input.phone:"",message:settings.showMessage?input.message:"",marketing_consent:settings.askMarketingConsent&&input.marketingConsent,consent_text:settings.askMarketingConsent?settings.consentText:null,settings_revision:revision,source_page:input.page},{onConflict:"campaign,email",ignoreDuplicates:true});
    if(error)throw error;
    return Response.json({ok:true});
  } catch(error){if(error instanceof SyntaxError)return Response.json({error:"Invalid submission."},{status:400});console.error("Popup submission failed",error);return Response.json({error:"Unable to save your details. Please try again."},{status:500});}
}
