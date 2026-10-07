"use client";
import { useEffect, useRef, useState } from "react";
import type { HomepageContent } from "@/lib/cms/schema";
export default function PreviewDialog({content,onClose}:{content:HomepageContent;onClose:()=>void}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const frame=useRef<HTMLIFrameElement>(null);
  const [mobile,setMobile]=useState(false);
  useEffect(()=>{
    const node=dialog.current;node?.showModal();
    return ()=>node?.close();
  },[]);
  useEffect(()=>{
    const send=()=>frame.current?.contentWindow?.postMessage({type:"htv-homepage-preview",content},window.location.origin);
    const receive=(event:MessageEvent)=>{if(event.origin===window.location.origin && event.source===frame.current?.contentWindow && event.data?.type==="htv-preview-ready")send();};
    window.addEventListener("message",receive);send();
    return ()=>window.removeEventListener("message",receive);
  },[content]);
  return <dialog ref={dialog} onCancel={event=>{event.preventDefault();onClose();}} aria-labelledby="preview-heading" className="m-auto h-[94vh] w-[96vw] max-w-[1500px] rounded-2xl bg-slate-100 p-0 backdrop:bg-black/50"><div className="flex flex-wrap items-center justify-between gap-3 border-b bg-white p-4"><div><h2 id="preview-heading" className="font-semibold">Homepage preview</h2><p className="text-sm">Unsaved changes · links disabled</p></div><div className="flex gap-2"><button type="button" aria-pressed={!mobile} onClick={()=>setMobile(false)} className="rounded-lg border px-3 py-2">Desktop</button><button type="button" aria-pressed={mobile} onClick={()=>setMobile(true)} className="rounded-lg border px-3 py-2">Mobile</button><button type="button" onClick={onClose} className="rounded-lg border px-3 py-2">Close</button></div></div><iframe ref={frame} title={mobile ? "Mobile homepage preview" : "Desktop homepage preview"} src="/website-preview" className="mx-auto h-[calc(94vh-100px)] bg-white" style={{width:mobile ? "min(390px, 100%)" : "100%"}}/></dialog>;
}
