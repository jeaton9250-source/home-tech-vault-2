import AdminShell from "@/components/admin/AdminShell";
import { requirePlatformAdminPage } from "@/lib/auth/platformAdmin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePlatformAdminPage();

  return <AdminShell>{children}</AdminShell>;
}
