import EmailsAdminClient from "@/components/admin/emails/EmailsAdminClient";
import {
  getEmailFromAddress,
  getEmailReplyToAddress,
  getSupportEmailTo,
  isResendConfigured,
} from "@/lib/email/resend";
import { ADMIN_EMAIL_TEMPLATES } from "@/lib/admin/emailCatalog";

export const metadata = {
  title: "Email — Home Tech Vault Admin",
};

export default function AdminEmailsPage() {
  return (
    <EmailsAdminClient
      templates={ADMIN_EMAIL_TEMPLATES}
      senderAddress={getEmailFromAddress()}
      replyToAddress={getEmailReplyToAddress()}
      supportDestination={getSupportEmailTo()}
      resendConfigured={isResendConfigured()}
    />
  );
}
