import SupportTicketDetailClient from "@/components/admin/support/SupportTicketDetailClient";
import { requirePlatformAdminPage } from "@/lib/auth/platformAdmin";

export const metadata = {
  title: "Support Ticket — Home Tech Vault Admin",
};

type AdminSupportTicketPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminSupportTicketPage({
  params,
}: AdminSupportTicketPageProps) {
  await requirePlatformAdminPage();
  const { id } = await params;

  return (
    <SupportTicketDetailClient ticketId={id} />
  );
}
