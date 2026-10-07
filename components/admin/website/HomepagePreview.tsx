"use client";
import { useEffect, useState } from "react";
import HomeMarketingView from "@/components/marketing/HomeMarketingView";
import { homepageSchema, type HomepageContent } from "@/lib/cms/schema";
export default function HomepagePreview() {
  const [content,setContent] = useState<HomepageContent|null>(null);
  useEffect(()=>{
    const receive = (event:MessageEvent) => {
      if(event.origin !== window.location.origin || event.source !== window.parent || event.data?.type !== "htv-homepage-preview") return;
      const parsed=homepageSchema.safeParse(event.data.content);
      if(parsed.success) setContent(parsed.data);
    };
    window.addEventListener("message",receive);
    window.parent.postMessage({type:"htv-preview-ready"},window.location.origin);
    return ()=>window.removeEventListener("message",receive);
  },[]);
  if(!content) return <p className="p-8">Waiting for preview content…</p>;
  return <div onClickCapture={event=>{if((event.target as HTMLElement).closest("a,button")) {event.preventDefault();event.stopPropagation();}}}><HomeMarketingView content={content}/></div>;
}
