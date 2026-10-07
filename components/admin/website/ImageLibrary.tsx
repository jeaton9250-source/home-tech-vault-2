"use client";
import { useEffect, useState } from "react";
import { MAX_IMAGE_BYTES } from "@/lib/cms/imageValidation";
type Asset={id:string;url:string;filename:string};
export default function ImageLibrary({onSelect}: {onSelect:(url:string)=>void}) {
  const [assets,setAssets]=useState<Asset[]>([]);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  useEffect(()=>{const controller=new AbortController();fetch("/api/admin/website/assets",{signal:controller.signal}).then(async response=>{const result=await response.json();if(!response.ok)throw new Error(result.error);setAssets(result.assets);}).catch(error=>{if(error.name!=="AbortError")setMessage("Unable to load images.");});return ()=>controller.abort();},[]);
  async function upload(file:File) {
    if(file.size>MAX_IMAGE_BYTES){setMessage("Choose an image smaller than 3 MB.");return;}
    setBusy(true);setMessage("");
    try {const form=new FormData();form.set("file",file);const response=await fetch("/api/admin/website/assets",{method:"POST",body:form});const result=await response.json();if(!response.ok)throw new Error(result.error);setAssets(current=>[result.asset,...current]);setMessage("Image uploaded. Choose it below to use as your background.");}
    catch(error){setMessage(error instanceof Error ? error.message : "Unable to upload image.");}finally {setBusy(false);}
  }
  return <section className="mt-8 border-t border-border-subtle pt-6"><h2 className="text-xl font-semibold">Image library</h2><p className="mt-2 text-sm text-text-secondary">Website images are public. Upload marketing images only. JPEG, PNG or WebP, up to 3 MB.</p><label className="mt-4 block">{busy ? "Uploading…" : "Upload image"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} className="mt-2 block w-full" onChange={event=>{const file=event.target.files?.[0];if(file)void upload(file);event.target.value="";}}/></label><p role="status" className="mt-3">{message}</p><div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">{assets.map(asset=><button type="button" key={asset.id} onClick={()=>onSelect(asset.url)} className="overflow-hidden rounded-xl border border-border-subtle text-left focus-visible:outline-2 focus-visible:outline-blue-500"><img src={asset.url} alt={asset.filename} className="aspect-video w-full object-cover" loading="lazy"/><span className="block truncate p-3 text-sm">{asset.filename}</span><span className="block px-3 pb-3 text-sm underline">Use as background</span></button>)}</div></section>;
}
