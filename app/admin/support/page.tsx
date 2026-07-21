import SupportInboxClient from "@/components/admin/support/SupportInboxClient";
import { requirePlatformAdminPage } from "@/lib/auth/platformAdmin";

export const metadata = {
  title: "Support Inbox — Home Tech Vault Admin",
};

export default async function AdminSupportPage() {
  await requirePlatformAdminPage();

  return <SupportInboxClient />;
}
