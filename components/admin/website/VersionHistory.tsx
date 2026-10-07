"use client";
import { useEffect, useState } from "react";
type Version={id:number;kind:string;key:string;action:string;created_at:string;content?:unknown};
export default function VersionHistory({kind,contentKey,refresh,onRestore}: {kind:"homepage"|"article";contentKey:string;refresh:number;onRestore:(content:unknown)=>void}) {
  const [versions,setVersions]=useState<Version[]>([]);
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  useEffect(()=>{
    const controller=new AbortController();
    fetch(`/api/admin/website/history?kind=${kind}&key=${encodeURIComponent(contentKey)}`,{signal:controller.signal}).then(async response=>{const result=await response.json();if(!response.ok)throw new Error(result.error);setVersions(result.versions);setMessage("");}).catch(error=>{if(error.name!=="AbortError")setMessage("Unable to load version history.");});
    return ()=>controller.abort();
  },[kind,contentKey,refresh]);
  async function restore(id:number) {
    setBusy(true);
    try {const response=await fetch(`/api/admin/website/history?id=${id}`);const result=await response.json();if(!response.ok)throw new Error(result.error);onRestore(result.version.content);}
    catch(error){setMessage(error instanceof Error ? error.message : "Unable to restore version.");}
    finally {setBusy(false);}
  }
  return <section className="mt-8 border-t border-border-subtle pt-6"><h2 className="text-xl font-semibold">Version history</h2><p className="mt-2 text-sm text-text-secondary">Restore loads a previous version into the editor. Review and publish it when ready.</p><p role="status" className="mt-2">{message}</p><ul className="mt-4 space-y-2">{versions.map(version=><li key={version.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-subtle p-3"><div><span className="font-medium capitalize">{version.action}</span> · {new Date(version.created_at).toLocaleString()} <span className="text-sm text-text-secondary">#{version.id}</span></div><button type="button" disabled={busy} onClick={()=>void restore(version.id)} className="rounded-lg border px-3 py-2">Restore into editor</button></li>)}</ul>{!message&&!versions.length ? <p className="mt-4 text-sm">History will appear after your first save.</p> : null}</section>;
}
