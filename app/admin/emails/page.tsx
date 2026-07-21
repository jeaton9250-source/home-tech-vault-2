import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminPanel from "@/components/admin/AdminPanel";
import EmailsAdminClient from "@/components/admin/emails/EmailsAdminClient";
import {
  getEmailFromAddress,
  getEmailReplyToAddress,
  getSupportEmailTo,
  isResendConfigured,
} from "@/lib/email/resend";
import { ADMIN_EMAIL_TEMPLATES } from "@/lib/admin/emailCatalog";

export const metadata = {
  title: "Email Center — Home Tech Vault Admin",
};

export default function AdminEmailsPage() {
  return (
    <>
      <AdminPageHeader
        title="Email Center"
        description="Operational view of live templates, sender configuration, and safe admin test delivery."
      />

      <EmailsAdminClient
        templates={ADMIN_EMAIL_TEMPLATES}
        senderAddress={getEmailFromAddress()}
        replyToAddress={getEmailReplyToAddress()}
        supportDestination={getSupportEmailTo()}
        resendConfigured={isResendConfigured()}
      />
    </>
  );
}
