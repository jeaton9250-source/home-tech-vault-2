import { getPlatformAdminSession } from "@/lib/auth/platformAdmin";
import { redirect, notFound } from "next/navigation";
import HomepagePreview from "@/components/admin/website/HomepagePreview";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Homepage preview — HTV",
  robots: { index: false, follow: false },
};
import PublicPagePreview from "@/components/admin/website/PublicPagePreview";
import { pageCatalog } from "@/lib/cms/pageContent";
import { previewPages } from "@/lib/cms/previewPages";
export default async function WebsitePreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  if (!(await getPlatformAdminSession())) redirect("/login");
  const path = (await searchParams).page ?? "/";
  if (path === "/") return <HomepagePreview />;
  if (!pageCatalog[path]) notFound();
  const parts = path.split("/").filter(Boolean);
  const template =
    parts.length === 2 && ["faq", "guides", "compare"].includes(parts[0])
      ? `/${parts[0]}/[slug]`
      : parts.length === 3 && parts[0] === "knowledge"
        ? "/knowledge/[category]/[slug]"
        : path;
  const loader = previewPages[template];
  if (!loader) notFound();
  const { default: Page } = await loader();
  return (
    <PublicPagePreview path={path}>
      <Page
        params={Promise.resolve({
          slug: parts.at(-1) ?? "",
          category: parts[1] ?? "",
        })}
        searchParams={Promise.resolve({})}
      />
    </PublicPagePreview>
  );
}
