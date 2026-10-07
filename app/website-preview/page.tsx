import { getPlatformAdminSession } from "@/lib/auth/platformAdmin";
import { redirect } from "next/navigation";
import HomepagePreview from "@/components/admin/website/HomepagePreview";
export const dynamic = "force-dynamic";
export const metadata = {title:"Homepage preview — HTV",robots:{index:false,follow:false}};
export default async function WebsitePreviewPage() {
  if (!(await getPlatformAdminSession())) redirect("/login");
  return <HomepagePreview/>;
}
