"use client";
import { useEffect,useRef } from "react";
import PopupForm,{type PopupInput} from "./PopupForm";
import type { PopupSettings } from "@/lib/popup/schema";
export default function PopupDialog({settings,onClose,onSubmit,busy=false,error="",success=false}: {settings:PopupSettings;onClose:()=>void;onSubmit:(input:PopupInput)=>void;busy?:boolean;error?:string;success?:boolean}) {
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const node=dialog.current;node?.showModal();return ()=>node?.close();},[]);
 return <dialog ref={dialog} aria-labelledby="lead-popup-title" onCancel={event=>{event.preventDefault();onClose();}} className="m-auto max-h-[90vh] w-[calc(100%_-_32px)] max-w-lg overflow-y-auto rounded-3xl bg-white p-6 text-[#152335] shadow-2xl backdrop:bg-black/50 sm:p-8"><div className="flex items-start justify-between gap-4"><h2 id="lead-popup-title" className="text-2xl font-semibold">{settings.headline}</h2><button type="button" aria-label="Close popup" onClick={onClose} className="rounded-lg border px-3 py-1 text-lg">×</button></div><p className="mt-4 whitespace-pre-line text-slate-600">{settings.description}</p><PopupForm settings={settings} onSubmit={onSubmit} busy={busy} error={error} success={success}/></dialog>;
}
