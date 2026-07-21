import AdminShell from "@/components/admin/AdminShell";
import { requirePlatformAdminPage } from "@/lib/auth/platformAdmin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePlatformAdminPage();

  return <AdminShell>{children}</AdminShell>;
}
