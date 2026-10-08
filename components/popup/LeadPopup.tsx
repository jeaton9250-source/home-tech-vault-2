"use client";
import { useEffect,useState } from "react";
import { usePathname } from "next/navigation";
import { isPublicMarketingPath } from "@/lib/marketing/routes";
import { popupMatchesPage,popupSettingsSchema,type PopupSettings } from "@/lib/popup/schema";
import PopupDialog from "./PopupDialog";
import type { PopupInput } from "./PopupForm";
function PopupForPage({page}:{page:string}) {
 const [configuration,setConfiguration]=useState<{settings:PopupSettings;revision:string}|null>(null);
 const [visible,setVisible]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [success,setSuccess]=useState(false);
 useEffect(()=>{
   const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
   fetch(`/api/popup?page=${encodeURIComponent(page)}`,{signal:controller.signal}).then(response=>response.json()).then(result=>{
     if(controller.signal.aborted)return;
     const parsed=popupSettingsSchema.safeParse(result.settings);if(!parsed.success||!parsed.data.enabled)return;
     try{if(sessionStorage.getItem(`htv-popup-dismissed:${parsed.data.campaign}`))return;}catch{}
     setConfiguration({settings:parsed.data,revision:result.revision});
     timer=setTimeout(()=>setVisible(true),parsed.data.delaySeconds*1000);
   }).catch(()=>{});
   return ()=>{controller.abort();if(timer)clearTimeout(timer);};
 },[page]);
 function dismiss(){if(configuration){try{sessionStorage.setItem(`htv-popup-dismissed:${configuration.settings.campaign}`,"1");}catch{}}setVisible(false);}
 async function submit(input:PopupInput){if(!configuration)return;setBusy(true);setError("");try{const response=await fetch("/api/popup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...input,page,campaign:configuration.settings.campaign,revision:configuration.revision})});const result=await response.json();if(!response.ok)throw new Error(result.error);setSuccess(true);try{sessionStorage.setItem(`htv-popup-dismissed:${configuration.settings.campaign}`,"1");}catch{}}catch(error){setError(error instanceof Error?error.message:"Unable to submit.");}finally{setBusy(false);}}
 if(!visible||!configuration||!popupMatchesPage(configuration.settings,page))return null;
 return <PopupDialog settings={configuration.settings} onClose={dismiss} onSubmit={input=>void submit(input)} busy={busy} error={error} success={success}/>;
}
export default function LeadPopup(){const page=usePathname();if(!page||!isPublicMarketingPath(page))return null;return <PopupForPage key={page} page={page}/>;}
