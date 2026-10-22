import {notFound} from 'next/navigation';
import {searchContent as c} from '@/lib/search-tools';
import {ToolPage,pageMetadata} from '@/components/search-tools/Pages';
export const dynamicParams=false;
export function generateStaticParams(){return c.tools.map(t=>({slug:t.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const t=c.tools.find(x=>x.slug===slug);if(!t)notFound();return pageMetadata(t.title,t.description,'/tools/'+slug);}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const t=c.tools.find(x=>x.slug===slug);if(!t)notFound();return <ToolPage tool={t}/>;}
