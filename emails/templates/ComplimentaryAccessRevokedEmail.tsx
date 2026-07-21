import {
  EmailCard,
  EmailParagraph,
} from "@/emails/components/EmailCard";
import { EmailButton } from "@/emails/components/EmailButton";
import { EmailHeader } from "@/emails/components/EmailHeader";
import { EmailLayout } from "@/emails/components/EmailLayout";

export type ComplimentaryAccessRevokedEmailProps = {
  planLabel: "Pro" | "Family";
  accountUrl: string;
};

export const complimentaryAccessRevokedSubject = (
  planLabel: "Pro" | "Family"
) => `Your complimentary ${planLabel} access has ended`;

export default function ComplimentaryAccessRevokedEmail({
  planLabel,
  accountUrl,
}: ComplimentaryAccessRevokedEmailProps) {
  return (
    <EmailLayout
      preview={`Your complimentary ${planLabel} access has ended.`}
    >
      <EmailHeader
        headline="Complimentary access has ended."
        subheading={`Complimentary ${planLabel} access is no longer active on your account.`}
      />

      <EmailCard>
        <EmailParagraph>
          Your account now follows your personal billing plan
          or household inheritance rules. No Stripe subscription
          was changed as part of this update.
        </EmailParagraph>

        <EmailButton
          href={accountUrl}
          label="View Account"
        />
      </EmailCard>
    </EmailLayout>
  );
}

ComplimentaryAccessRevokedEmail.PreviewProps = {
  planLabel: "Pro",
  accountUrl: "https://hometechvault.com/account",
} satisfies ComplimentaryAccessRevokedEmailProps;
