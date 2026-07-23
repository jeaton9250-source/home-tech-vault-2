import {
  EmailCard,
  EmailFallbackLink,
  EmailParagraph,
  EmailSecurityNote,
} from "@/emails/components/EmailCard";
import { EmailHeader } from "@/emails/components/EmailHeader";
import { EmailLayout } from "@/emails/components/EmailLayout";
import { emailTheme } from "@/emails/styles/emailTheme";
import { EmailButton } from "@/emails/components/EmailButton";

export type NewAccountInvitationEmailProps = {
  inviterName: string;
  acceptanceUrl: string;
  expirationLabel?: string | null;
  inviteeFirstName?: string | null;
};

export const newAccountInvitationSubject =
  "You're invited to create a Home Tech Vault account";

export function renderNewAccountInvitationPlainText(
  props: NewAccountInvitationEmailProps
) {
  const greeting = props.inviteeFirstName?.trim()
    ? `Hi ${props.inviteeFirstName.trim()},`
    : "Hi,";

  const expiration = props.expirationLabel
    ? `\nThis invitation expires on ${props.expirationLabel}.\n`
    : "";

  return `${newAccountInvitationSubject}

${greeting}

${props.inviterName} invited you to create your own Home Tech Vault account and household.

Accept the invitation, create your password, and set up your household. Your vault stays separate from the administrator who invited you.

Accept invitation:
${props.acceptanceUrl}
${expiration}
Security note: This link is personal to you. Do not forward it. If you were not expecting this invitation, you can safely ignore this email.

${emailTheme.brand.name}
${emailTheme.brand.tagline}
${emailTheme.brand.supportEmail}
${emailTheme.brand.siteUrl}`;
}

export default function NewAccountInvitationEmail({
  inviterName,
  acceptanceUrl,
  expirationLabel,
  inviteeFirstName,
}: NewAccountInvitationEmailProps) {
  const greeting = inviteeFirstName?.trim()
    ? `Hi ${inviteeFirstName.trim()},`
    : "Hi,";

  return (
    <EmailLayout
      preview={`${inviterName} invited you to create a Home Tech Vault account.`}
    >
      <EmailHeader
        headline="Create your account."
        subheading={`${inviterName} invited you to Home Tech Vault.`}
      />

      <EmailCard>
        <EmailParagraph>{greeting}</EmailParagraph>
        <EmailParagraph>
          You have been invited to create your own Home Tech Vault account and
          household. After you accept, you will set up your password and name
          your household.
        </EmailParagraph>
        <EmailParagraph>
          Your vault remains independent. Platform-admin access is not included
          with this invitation.
        </EmailParagraph>

        <EmailButton
          href={acceptanceUrl}
          label="Accept Invitation"
        />

        {expirationLabel ? (
          <EmailParagraph>
            This invitation expires on {expirationLabel}.
          </EmailParagraph>
        ) : null}

        <EmailSecurityNote>
          <strong>Security note:</strong> This link is personal to you. Do not
          forward it. If you were not expecting this invitation, you can safely
          ignore this email.
        </EmailSecurityNote>

        <EmailFallbackLink href={acceptanceUrl} />
      </EmailCard>
    </EmailLayout>
  );
}

NewAccountInvitationEmail.PreviewProps = {
  inviterName: "Alex Morgan",
  acceptanceUrl:
    "https://hometechvault.com/invite/setup/sample-token",
  expirationLabel: "August 20, 2026",
  inviteeFirstName: "Jordan",
} satisfies NewAccountInvitationEmailProps;
