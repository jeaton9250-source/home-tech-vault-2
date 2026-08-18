import { EmailButton } from "@/emails/components/EmailButton";
import {
  EmailCard,
  EmailDetailBlock,
  EmailParagraph,
} from "@/emails/components/EmailCard";
import { EmailHeader } from "@/emails/components/EmailHeader";
import { EmailLayout } from "@/emails/components/EmailLayout";
import { emailTheme } from "@/emails/styles/emailTheme";

export type ComplimentaryAccessRevokedEmailProps = {
  firstName: string;
  planLabel: "Pro" | "Family";
  accountUrl: string;
  effectiveEndLabel: string;
  retainsPremiumAccess: boolean;
};

export const complimentaryAccessRevokedSubject =
  "Your complimentary Home Tech Vault access has changed";

export function renderComplimentaryAccessRevokedPlainText(
  props: ComplimentaryAccessRevokedEmailProps
) {
  const followUp = props.retainsPremiumAccess
    ? "Your account continues to include access through your personal subscription or eligible Family household access."
    : "Your account and stored data remain available. Your current features will now follow your personal subscription and any eligible Family household access.";

  return `${complimentaryAccessRevokedSubject}

Hi ${props.firstName},

Your complimentary ${props.planLabel} access has ended.

Effective end date: ${props.effectiveEndLabel}

${followUp}

View your account:
${props.accountUrl}

${emailTheme.brand.name}
${emailTheme.brand.supportEmail}`;
}

export default function ComplimentaryAccessRevokedEmail({
  firstName,
  planLabel,
  accountUrl,
  effectiveEndLabel,
  retainsPremiumAccess,
}: ComplimentaryAccessRevokedEmailProps) {
  return (
    <EmailLayout preview="Your complimentary Home Tech Vault access has changed.">
      <EmailHeader
        headline="Your complimentary access has changed."
        subheading={`Complimentary ${planLabel} access is no longer active on your account.`}
      />

      <EmailCard>
        <EmailParagraph>
          Hi {firstName},
        </EmailParagraph>

        <EmailParagraph>
          Your complimentary {planLabel} access has
          ended.
        </EmailParagraph>

        <EmailDetailBlock
          label="Effective end date"
          value={effectiveEndLabel}
        />

        <EmailParagraph>
          {retainsPremiumAccess
            ? "Your account continues to include access through your personal subscription or eligible Family household access."
            : "Your account and stored data remain available. Your current features will now follow your personal subscription and any eligible Family household access."}
        </EmailParagraph>

        <EmailButton
          href={accountUrl}
          label="View your account"
        />
      </EmailCard>
    </EmailLayout>
  );
}

ComplimentaryAccessRevokedEmail.PreviewProps = {
  firstName: "Alex",
  planLabel: "Pro",
  accountUrl: "https://www.hometechvault.com/account",
  effectiveEndLabel: "July 21, 2026",
  retainsPremiumAccess: false,
} satisfies ComplimentaryAccessRevokedEmailProps;
