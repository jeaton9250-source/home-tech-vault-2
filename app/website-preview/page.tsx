import { requirePlatformAdminPage } from "@/lib/auth/platformAdmin";
import HomepagePreview from "@/components/admin/website/HomepagePreview";
export const dynamic = "force-dynamic";
export const metadata = {title:"Homepage preview — HTV",robots:{index:false,follow:false}};
export default async function WebsitePreviewPage() {
  await requirePlatformAdminPage();
  return <HomepagePreview/>;
}
