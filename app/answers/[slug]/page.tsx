import {notFound} from 'next/navigation';
import {searchContent as c} from '@/lib/search-tools';
import {ArticlePage,pageMetadata} from '@/components/search-tools/Pages';
export const dynamicParams=false;
export function generateStaticParams(){return c.articles.map(a=>({slug:a.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const a=c.articles.find(x=>x.slug===slug);if(!a)notFound();return pageMetadata(a.title,a.answer,c.guidePath+'/'+slug);}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const a=c.articles.find(x=>x.slug===slug);if(!a)notFound();return <ArticlePage article={a}/>;}
