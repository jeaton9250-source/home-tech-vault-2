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
  "Create your Home Tech Vault";

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

You've been invited to create your own Home Tech Vault.

Organize your devices, warranties, documents, maintenance records, and home network in one secure place.

Click below to set your password and create your vault:
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
      preview="You've been invited to create your own Home Tech Vault."
    >
      <EmailHeader
        headline="Create your Home Tech Vault"
        subheading={`${inviterName} invited you to Home Tech Vault.`}
      />

      <EmailCard>
        <EmailParagraph>{greeting}</EmailParagraph>
        <EmailParagraph>
          You&apos;ve been invited to create your own Home Tech Vault.
        </EmailParagraph>
        <EmailParagraph>
          Organize your devices, warranties, documents, maintenance
          records, and home network in one secure place.
        </EmailParagraph>
        <EmailParagraph>
          Click below to set your password and create your vault.
        </EmailParagraph>

        <EmailButton
          href={acceptanceUrl}
          label="Create My Home Tech Vault"
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
  acceptanceUrl: "https://hometechvault.com/invite/setup",
  expirationLabel: "August 20, 2026",
  inviteeFirstName: "Jordan",
} satisfies NewAccountInvitationEmailProps;
