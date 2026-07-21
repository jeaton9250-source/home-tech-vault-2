import { Section } from "@react-email/components";

import { EmailButton } from "@/emails/components/EmailButton";
import {
  EmailCard,
  EmailDetailBlock,
  EmailFallbackLink,
  EmailParagraph,
  EmailSecurityNote,
} from "@/emails/components/EmailCard";
import { EmailHeader } from "@/emails/components/EmailHeader";
import { EmailLayout } from "@/emails/components/EmailLayout";
import { emailTheme } from "@/emails/styles/emailTheme";

export type FamilyInvitationEmailProps = {
  inviterName: string;
  householdName: string;
  roleLabel: string;
  acceptanceUrl: string;
  expirationLabel?: string | null;
};

export const familyInvitationSubject =
  "You've been invited to join a Home Tech Vault";

export function formatHouseholdRole(
  role: string
) {
  return role
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) => letter.toUpperCase()
    );
}

export function renderFamilyInvitationPlainText(
  props: FamilyInvitationEmailProps
) {
  const expiration = props.expirationLabel
    ? `\nThis invitation expires on ${props.expirationLabel}.\n`
    : "";

  return `${familyInvitationSubject}

${props.inviterName} invited you to join ${props.householdName} in Home Tech Vault.

Your role: ${props.roleLabel}

Accept this invitation to access your household's shared technology records based on your assigned role.

Accept invitation:
${props.acceptanceUrl}
${expiration}
Security note: This link is personal to you. Do not forward it. If you were not expecting this invitation, you can safely ignore this email.

${emailTheme.brand.name}
${emailTheme.brand.tagline}
${emailTheme.brand.supportEmail}
${emailTheme.brand.siteUrl}`;
}

export default function FamilyInvitationEmail({
  inviterName,
  householdName,
  roleLabel,
  acceptanceUrl,
  expirationLabel,
}: FamilyInvitationEmailProps) {
  return (
    <EmailLayout
      preview={`${inviterName} invited you to join ${householdName}.`}
    >
      <EmailHeader
        headline="You've been invited."
        subheading={`${inviterName} invited you to join ${householdName}.`}
      />

      <EmailCard>
        <EmailParagraph>
          Accept this invitation to access your household&apos;s
          shared technology records — devices, documents,
          warranties, maintenance, and network details — based on
          your assigned role.
        </EmailParagraph>

        <Section
          style={{
            marginTop: "24px",
            padding: "20px",
            backgroundColor: emailTheme.colors.background,
            borderRadius: emailTheme.radius,
          }}
        >
          <EmailDetailBlock
            label="Household"
            value={householdName}
          />
          <EmailDetailBlock
            label="Your role"
            value={roleLabel}
          />
        </Section>

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
          <strong>Security note:</strong> This link is personal to
          you. Do not forward it. If you were not expecting this
          invitation, you can safely ignore this email.
        </EmailSecurityNote>

        <EmailFallbackLink href={acceptanceUrl} />
      </EmailCard>
    </EmailLayout>
  );
}

FamilyInvitationEmail.PreviewProps = {
  inviterName: "Alex Morgan",
  householdName: "The Morgan Household",
  roleLabel: "Member",
  acceptanceUrl:
    "https://hometechvault.com/family/accept/sample-token",
  expirationLabel: "August 20, 2026",
} satisfies FamilyInvitationEmailProps;
