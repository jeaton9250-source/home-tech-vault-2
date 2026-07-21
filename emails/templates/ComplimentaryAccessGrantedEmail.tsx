import { EmailButton } from "@/emails/components/EmailButton";
import {
  EmailCard,
  EmailParagraph,
} from "@/emails/components/EmailCard";
import { EmailHeader } from "@/emails/components/EmailHeader";
import { EmailLayout } from "@/emails/components/EmailLayout";

export type ComplimentaryAccessGrantedEmailProps = {
  planLabel: "Pro" | "Family";
  accountUrl: string;
  expiresAtLabel?: string | null;
};

export const complimentaryAccessGrantedSubject = (
  planLabel: "Pro" | "Family"
) => `Your complimentary ${planLabel} access is active`;

export default function ComplimentaryAccessGrantedEmail({
  planLabel,
  accountUrl,
  expiresAtLabel,
}: ComplimentaryAccessGrantedEmailProps) {
  return (
    <EmailLayout
      preview={`Your complimentary ${planLabel} access is active.`}
    >
      <EmailHeader
        headline={`Complimentary ${planLabel} access is active.`}
        subheading="Premium Home Tech Vault features are now unlocked on your account."
      />

      <EmailCard>
        <EmailParagraph>
          A platform administrator granted complimentary{" "}
          {planLabel} access to your account. This is not a
          paid subscription and does not create Stripe billing.
        </EmailParagraph>

        {expiresAtLabel ? (
          <EmailParagraph>
            Access expires on {expiresAtLabel}.
          </EmailParagraph>
        ) : (
          <EmailParagraph>
            This access does not currently have an expiration
            date.
          </EmailParagraph>
        )}

        <EmailButton
          href={accountUrl}
          label="View Account"
        />
      </EmailCard>
    </EmailLayout>
  );
}

ComplimentaryAccessGrantedEmail.PreviewProps = {
  planLabel: "Pro",
  accountUrl: "https://hometechvault.com/account",
  expiresAtLabel: "August 20, 2026",
} satisfies ComplimentaryAccessGrantedEmailProps;
