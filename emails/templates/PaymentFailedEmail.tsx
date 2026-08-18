import { EmailButton } from "@/emails/components/EmailButton";
import {
  EmailCard,
  EmailParagraph,
} from "@/emails/components/EmailCard";
import { EmailHeader } from "@/emails/components/EmailHeader";
import { EmailLayout } from "@/emails/components/EmailLayout";

export type PaymentFailedEmailProps = {
  billingUrl: string;
};

export const paymentFailedSubject =
  "We couldn't process your payment";

export default function PaymentFailedEmail({
  billingUrl,
}: PaymentFailedEmailProps) {
  return (
    <EmailLayout preview="Your recent payment could not be processed.">
      <EmailHeader
        headline="Payment needs attention."
        subheading="Your vault stays active for now — let's fix billing."
      />

      <EmailCard>
        <EmailParagraph>
          We couldn&apos;t process your latest payment. Update your
          billing details to keep uninterrupted access.
        </EmailParagraph>

        <EmailButton
          href={billingUrl}
          label="Update Billing"
        />
      </EmailCard>
    </EmailLayout>
  );
}

PaymentFailedEmail.PreviewProps = {
  billingUrl:
    "https://www.hometechvault.com/settings/billing",
} satisfies PaymentFailedEmailProps;
