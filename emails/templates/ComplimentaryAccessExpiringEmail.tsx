import { EmailButton } from "@/emails/components/EmailButton";
import {
  EmailCard,
  EmailParagraph,
} from "@/emails/components/EmailCard";
import { EmailHeader } from "@/emails/components/EmailHeader";
import { EmailLayout } from "@/emails/components/EmailLayout";
import { emailTheme } from "@/emails/styles/emailTheme";

export type ComplimentaryAccessExpiringEmailProps = {
  firstName: string;
  planLabel: "Pro" | "Family";
  expiresAtLabel: string;
  accountUrl: string;
};

export const complimentaryAccessExpiringSubject = (
  planLabel: "Pro" | "Family"
) =>
  `Your complimentary ${planLabel} access expires soon`;

export function renderComplimentaryAccessExpiringPlainText(
  props: ComplimentaryAccessExpiringEmailProps
) {
  return `${complimentaryAccessExpiringSubject(props.planLabel)}

Hi ${props.firstName},

Your complimentary ${props.planLabel} access expires on ${props.expiresAtLabel}.

When access ends, your account will return to the features available under your personal billing plan or household inheritance rules.

View your account:
${props.accountUrl}

${emailTheme.brand.name}
${emailTheme.brand.supportEmail}`;
}

export default function ComplimentaryAccessExpiringEmail({
  firstName,
  planLabel,
  expiresAtLabel,
  accountUrl,
}: ComplimentaryAccessExpiringEmailProps) {
  return (
    <EmailLayout
      preview={`Your complimentary ${planLabel} access expires on ${expiresAtLabel}.`}
    >
      <EmailHeader
        headline="Complimentary access is ending soon."
        subheading={`Your complimentary ${planLabel} access expires on ${expiresAtLabel}.`}
      />

      <EmailCard>
        <EmailParagraph>
          Hi {firstName},
        </EmailParagraph>

        <EmailParagraph>
          Your complimentary {planLabel} access expires on{" "}
          {expiresAtLabel}. When access ends, your account
          will return to the features available under your
          personal billing plan or household inheritance
          rules.
        </EmailParagraph>

        <EmailButton
          href={accountUrl}
          label="View your account"
        />
      </EmailCard>
    </EmailLayout>
  );
}

ComplimentaryAccessExpiringEmail.PreviewProps = {
  firstName: "Alex",
  planLabel: "Family",
  expiresAtLabel: "August 20, 2026",
  accountUrl: "https://www.hometechvault.com/account",
} satisfies ComplimentaryAccessExpiringEmailProps;
