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
  secureActionUrl: string;
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

Use the secure link below to verify your invitation, set your password, and create your vault:
${props.secureActionUrl}
${expiration}
Security note: This link is personal to you. Do not forward it. If you were not expecting this invitation, you can safely ignore this email.

${emailTheme.brand.name}
${emailTheme.brand.tagline}
${emailTheme.brand.supportEmail}
${emailTheme.brand.siteUrl}`;
}

export default function NewAccountInvitationEmail({
  inviterName,
  secureActionUrl,
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
          Use the secure button below to verify your invitation, set your
          password, and create your vault.
        </EmailParagraph>

        <EmailButton
          href={secureActionUrl}
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

        <EmailFallbackLink href={secureActionUrl} />
      </EmailCard>
    </EmailLayout>
  );
}

NewAccountInvitationEmail.PreviewProps = {
  inviterName: "Alex Morgan",
  secureActionUrl:
    "https://project.supabase.co/auth/v1/verify?type=invite&token=example",
  expirationLabel: "August 20, 2026",
  inviteeFirstName: "Jordan",
} satisfies NewAccountInvitationEmailProps;
