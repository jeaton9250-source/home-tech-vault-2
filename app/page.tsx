import { loadHomepage } from "@/lib/cms/server";
import DesignPreview from "./design-preview/page";
export const dynamic = "force-dynamic";
export default async function HomePage() {
  const content = await loadHomepage();
  return <><div className="contents">{content.announcement && <div role="status" className="bg-[#142438] px-5 py-3 text-center text-xs text-white">{content.announcement}</div>}</div><DesignPreview /></>;
}
