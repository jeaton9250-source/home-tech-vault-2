import {
  EmailCard,
  EmailParagraph,
} from "@/emails/components/EmailCard";
import { EmailButton } from "@/emails/components/EmailButton";
import { EmailHeader } from "@/emails/components/EmailHeader";
import { EmailLayout } from "@/emails/components/EmailLayout";

export type ComplimentaryAccessExpiringEmailProps = {
  planLabel: "Pro" | "Family";
  expiresAtLabel: string;
  accountUrl: string;
};

export const complimentaryAccessExpiringSubject = (
  planLabel: "Pro" | "Family"
) => `Your complimentary ${planLabel} access expires soon`;

export default function ComplimentaryAccessExpiringEmail({
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
          When access ends, your account will return to the
          features available under your personal billing plan
          or household inheritance rules.
        </EmailParagraph>

        <EmailButton
          href={accountUrl}
          label="View Account"
        />
      </EmailCard>
    </EmailLayout>
  );
}

ComplimentaryAccessExpiringEmail.PreviewProps = {
  planLabel: "Family",
  expiresAtLabel: "August 20, 2026",
  accountUrl: "https://hometechvault.com/account",
} satisfies ComplimentaryAccessExpiringEmailProps;
