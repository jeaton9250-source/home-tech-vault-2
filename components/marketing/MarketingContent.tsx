"use client";
import {
  createContext,
  useContext,
  type ReactNode,
  type ImgHTMLAttributes,
} from "react";
import { usePathname } from "next/navigation";
import Image, { type ImageProps } from "next/image";
import type { PageOverrides } from "@/lib/cms/pageContent";
// Kept here as well to avoid shipping the editor's full content catalog to visitors.
function contentId(scope: string, kind: string, value: string) {
  let hash = 2166136261;
  for (const char of `${scope}|${kind}|${value}`)
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return `${kind}_${(hash >>> 0).toString(36)}`;
}
const ContentContext = createContext<Record<string, string>>({});
export function MarketingContentProvider({
  pages,
  children,
}: {
  pages: PageOverrides;
  children: ReactNode;
}) {
  const pathname = usePathname();
  return (
    <ContentContext.Provider
      value={pages[pathname.replace(/\/$/, "") || "/"] ?? {}}
    >
      {children}
    </ContentContext.Provider>
  );
}
export function MarketingContentScope({
  content,
  children,
}: {
  content: Record<string, string>;
  children: ReactNode;
}) {
  return (
    <ContentContext.Provider value={content}>
      {children}
    </ContentContext.Provider>
  );
}
export function MarketingText({
  scope,
  children,
}: {
  scope: string;
  children: ReactNode;
}) {
  const content = useContext(ContentContext);
  return typeof children === "string"
    ? (content[contentId(scope, "text", children)] ?? children)
    : children;
}
export function MarketingImg({
  scope,
  src,
  alt,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { scope: string }) {
  const content = useContext(ContentContext);
  const fallback = typeof src === "string" ? src : "";
  return (
    <img
      {...props}
      src={content[contentId("shared", "image", fallback)] ?? src}
      alt={content[contentId(scope, "text", alt ?? "")] ?? content[contentId("shared", "text", alt ?? "")] ?? alt}
    />
  );
}
export function MarketingImage({
  scope,
  src,
  alt,
  ...props
}: ImageProps & { scope: string }) {
  const content = useContext(ContentContext);
  const fallback = typeof src === "string" ? src : "";
  return (
    <Image
      {...props}
      src={content[contentId("shared", "image", fallback)] ?? src}
      alt={content[contentId(scope, "text", alt)] ?? content[contentId("shared", "text", alt)] ?? alt}
      unoptimized
    />
  );
}
