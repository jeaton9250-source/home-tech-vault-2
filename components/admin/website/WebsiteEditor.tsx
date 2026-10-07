"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import PreviewDialog from "./PreviewDialog";
import VersionHistory from "./VersionHistory";
import ImageLibrary from "./ImageLibrary";
import { homepageSchema, articleSchema, homepageDefaults, type HomepageContent, type Article } from "@/lib/cms/schema";
const blankArticle: Article = {slug:"", title:"", description:"", body:"", published:false};
const fields: {key: Exclude<keyof HomepageContent, "showAppStore">; label:string; multiline?:boolean}[] = [
  {key:"eyebrow",label:"Intro label"},{key:"headline",label:"Headline",multiline:true},{key:"description",label:"Description",multiline:true},
  {key:"primaryLabel",label:"Main button text"},{key:"primaryLink",label:"Main button link"},{key:"secondaryLabel",label:"Second button text"},{key:"secondaryLink",label:"Second button link"},
  {key:"heroImage",label:"Background image URL"},{key:"appStoreLink",label:"App Store link"},{key:"announcement",label:"Announcement (leave blank to hide)",multiline:true},
  {key:"finalHeadline",label:"Closing headline",multiline:true},{key:"finalDescription",label:"Closing description",multiline:true},
];
const inputClass = "mt-2 w-full rounded-xl border border-border-subtle bg-surface-card p-3 text-text-primary focus:outline-2 focus:outline-blue-500";
export default function WebsiteEditor({initialHomepage, initialDraft, initialArticles}: {initialHomepage:HomepageContent; initialDraft:unknown; initialArticles:Article[]}) {
  const [homepage,setHomepage] = useState(() => {const draft=homepageSchema.safeParse(initialDraft);return draft.success ? draft.data : initialHomepage;});
  const [preview,setPreview] = useState(false);
  const [historyRefresh,setHistoryRefresh] = useState(0);
  const [savedHomepage,setSavedHomepage] = useState(homepage);
  const [articles,setArticles] = useState(initialArticles);
  const [article,setArticle] = useState<Article>(blankArticle);
  const [editingSlug,setEditingSlug] = useState<string|null>(null);
  const [tab,setTab] = useState<"homepage"|"articles">("homepage");
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  const [dirty,setDirty] = useState(false);
  useEffect(() => { const handler = (event: BeforeUnloadEvent) => {if(dirty) event.preventDefault();}; window.addEventListener("beforeunload", handler); return () => window.removeEventListener("beforeunload", handler); },[dirty]);
  async function save(kind: "homepage"|"article", draft=false) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/website", {method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind,draft,create:kind === "article" && editingSlug === null,content:kind === "homepage" ? homepage : article})});
      const result = await response.json(); if(!response.ok) throw new Error(result.error);
      if(kind === "homepage") setSavedHomepage(homepage);
      setHistoryRefresh(current=>current+1);
      if(kind === "article") {setArticles(current => [article, ...current.filter(item => item.slug !== article.slug)]); setEditingSlug(article.slug);}
      setDirty(false); setMessage(kind === "homepage" ? draft ? "Homepage draft saved. The live website is unchanged." : "Homepage published. Your changes are live." : article.published ? "Article published." : "Draft saved. Only admins can see it.");
    } catch(error) {setMessage(error instanceof Error ? error.message : "Unable to save.");} finally {setBusy(false);}
  }
  function switchTab(next: typeof tab) {if(dirty && !window.confirm("Discard unsaved changes?")) return; setHomepage(savedHomepage); setArticle(blankArticle); setEditingSlug(null); setDirty(false); setMessage(""); setTab(next);}
  return <section className="mt-6 rounded-3xl border border-border-subtle bg-surface-card p-6">
    <nav aria-label="Website sections" className="mb-6 flex flex-wrap gap-3"><button type="button" aria-pressed={tab === "homepage"} onClick={()=>switchTab("homepage")} className="rounded-xl border px-4 py-2">Homepage</button><button type="button" aria-pressed={tab === "articles"} onClick={()=>switchTab("articles")} className="rounded-xl border px-4 py-2">Resource articles</button><Link href={tab === "homepage" ? "/" : "/resources"} target="_blank" className="px-4 py-2 underline">View website ↗</Link></nav>
    {preview ? <PreviewDialog content={homepage} onClose={()=>setPreview(false)}/> : null}
    <form onSubmit={event=>{event.preventDefault(); void save(tab === "homepage" ? "homepage" : "article");}}>
      <fieldset disabled={busy}>
      {tab === "homepage" ? <div className="grid gap-5 md:grid-cols-2">{fields.map(({key,label,multiline})=><label key={key} className={multiline ? "md:col-span-2" : ""}>{label}{multiline ? <textarea rows={3} className={inputClass} value={homepage[key]} onChange={event=>{setHomepage({...homepage,[key]:event.target.value});setDirty(true);}} /> : <input className={inputClass} value={homepage[key]} onChange={event=>{setHomepage({...homepage,[key]:event.target.value});setDirty(true);}} />}</label>)}<label className="flex items-center gap-3"><input type="checkbox" checked={homepage.showAppStore} onChange={event=>{setHomepage({...homepage,showAppStore:event.target.checked});setDirty(true);}}/>Show App Store badge</label><button type="button" className="underline" onClick={()=>{if(window.confirm("Replace this form with the original homepage content? Save to apply.")){setHomepage(homepageDefaults);setDirty(true);}}}>Restore original content</button></div> : <div className="space-y-5">
        <label className="block">Open an article<select className={inputClass} value={editingSlug ?? ""} onChange={event=>{if(dirty && !window.confirm("Discard unsaved changes?"))return; const item=articles.find(item=>item.slug===event.target.value);setArticle(item ?? blankArticle);setEditingSlug(item?.slug ?? null);setDirty(false);setMessage("");}}><option value="">New article</option>{articles.map(item=><option key={item.slug} value={item.slug}>{item.title} {item.published ? "(Published)" : "(Draft)"}</option>)}</select></label>
        <label className="block">URL name<input required disabled={editingSlug !== null} pattern="[a-z0-9]+(-[a-z0-9]+)*" className={inputClass} value={article.slug} placeholder="home-warranty-guide" onChange={event=>{setArticle({...article,slug:event.target.value});setDirty(true);}}/></label>
        <label className="block">Title<input required className={inputClass} value={article.title} onChange={event=>{setArticle({...article,title:event.target.value});setDirty(true);}}/></label>
        <label className="block">Search description<textarea required maxLength={300} rows={2} className={inputClass} value={article.description} onChange={event=>{setArticle({...article,description:event.target.value});setDirty(true);}}/></label>
        <label className="block">Article text<textarea required rows={18} className={inputClass} value={article.body} placeholder="Write paragraphs separated by a blank line. Start section headings with ##." onChange={event=>{setArticle({...article,body:event.target.value});setDirty(true);}}/></label>
        <label className="flex gap-3"><input type="checkbox" checked={article.published} onChange={event=>{setArticle({...article,published:event.target.checked});setDirty(true);}}/>Published on the website</label>
        {editingSlug && article.published ? <Link href={`/resources/${editingSlug}`} target="_blank" className="underline">View published article ↗</Link> : null}
      </div>}
      {tab === "homepage" ? <div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={()=>{const parsed=homepageSchema.safeParse(homepage);if(parsed.success)setPreview(true);else setMessage(parsed.error.issues[0]?.message ?? "Check your content.");}} className="rounded-xl border px-5 py-3">Preview</button><button type="button" onClick={()=>void save("homepage",true)} className="rounded-xl border px-5 py-3">Save draft</button></div> : null}
      <button type="submit" className="mt-6 rounded-xl bg-[#152335] px-6 py-3 font-semibold text-white">{busy ? "Saving…" : tab === "homepage" ? "Publish homepage" : article.published ? "Save and publish" : "Save draft"}</button>
      </fieldset>
    </form>
    {tab === "homepage" ? <ImageLibrary onSelect={url=>{setHomepage(current=>({...current,heroImage:url}));setDirty(true);}}/> : null}
    {(tab === "homepage" || editingSlug) ? <VersionHistory key={`${tab}:${editingSlug ?? "homepage"}`} kind={tab === "homepage" ? "homepage" : "article"} contentKey={tab === "homepage" ? "homepage" : editingSlug!} refresh={historyRefresh} onRestore={content=>{if(dirty && !window.confirm("Replace unsaved changes with this version?"))return;const parsed=tab === "homepage" ? homepageSchema.safeParse(content) : articleSchema.safeParse(content);if(!parsed.success){setMessage("This version cannot be restored.");return;}if(tab === "homepage")setHomepage(parsed.data as HomepageContent);else setArticle(parsed.data as Article);setDirty(true);setMessage("Version loaded. Preview it, then save or publish to apply.");}}/> : null}
    <p role="status" className="mt-4">{message || (dirty ? "You have unsaved changes." : "")}</p>
  </section>;
}
