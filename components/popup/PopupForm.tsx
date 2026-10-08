"use client";
import { useState } from "react";
import Link from "next/link";
import type { PopupSettings } from "@/lib/popup/schema";
export type PopupInput={name:string;email:string;phone:string;message:string;marketingConsent:boolean;website:string};
export default function PopupForm({settings,onSubmit,busy,error,success}: {settings:PopupSettings;onSubmit:(input:PopupInput)=>void;busy:boolean;error:string;success:boolean}) {
  const [input,setInput]=useState<PopupInput>({name:"",email:"",phone:"",message:"",marketingConsent:false,website:""});
  const fieldClass="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 focus:outline-2 focus:outline-blue-600";
  if(success)return <p role="status" className="mt-6 rounded-xl bg-green-50 p-5 text-green-900">{settings.successMessage}</p>;
  return <form className="mt-6 space-y-4" onSubmit={event=>{event.preventDefault();onSubmit(input);}}><fieldset disabled={busy} className="space-y-4">
    {settings.showName ? <label className="block">Name (optional)<input autoComplete="name" maxLength={120} value={input.name} className={fieldClass} onChange={event=>setInput({...input,name:event.target.value})}/></label> : null}
    <label className="block">Email address<input required type="email" autoComplete="email" maxLength={254} value={input.email} className={fieldClass} onChange={event=>setInput({...input,email:event.target.value})}/></label>
    {settings.showPhone ? <label className="block">Phone (optional)<input type="tel" autoComplete="tel" maxLength={40} value={input.phone} className={fieldClass} onChange={event=>setInput({...input,phone:event.target.value})}/></label> : null}
    {settings.showMessage ? <label className="block">Message (optional)<textarea rows={3} maxLength={3000} value={input.message} className={fieldClass} onChange={event=>setInput({...input,message:event.target.value})}/></label> : null}
    <div aria-hidden="true" className="absolute -left-[10000px]"><label>Website<input tabIndex={-1} autoComplete="off" value={input.website} onChange={event=>setInput({...input,website:event.target.value})}/></label></div>
    {settings.askMarketingConsent ? <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={input.marketingConsent} onChange={event=>setInput({...input,marketingConsent:event.target.checked})} className="mt-1 shrink-0"/>{settings.consentText}</label> : null}
    <p className="text-xs text-slate-600">We’ll use your details to respond to your request. <Link href="/privacy" className="underline">Privacy policy</Link>.</p>
    <button type="submit" className="w-full rounded-xl bg-[#152335] px-5 py-3 font-semibold text-white">{busy?"Sending…":settings.buttonText}</button>
  </fieldset><p role="alert" className="text-sm text-red-700">{error}</p></form>;
}
