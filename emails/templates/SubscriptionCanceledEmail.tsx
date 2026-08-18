import { EmailButton } from "@/emails/components/EmailButton";
import {
  EmailCard,
  EmailParagraph,
} from "@/emails/components/EmailCard";
import { EmailHeader } from "@/emails/components/EmailHeader";
import { EmailLayout } from "@/emails/components/EmailLayout";

export type SubscriptionCanceledEmailProps = {
  planName: string;
  billingUrl: string;
  accessEndsLabel?: string | null;
};

export const subscriptionCanceledSubject =
  "Your subscription has been canceled";

export default function SubscriptionCanceledEmail({
  planName,
  billingUrl,
  accessEndsLabel,
}: SubscriptionCanceledEmailProps) {
  return (
    <EmailLayout preview="Your subscription change is confirmed.">
      <EmailHeader
        headline="Subscription canceled."
        subheading={`Your ${planName} plan will not renew.`}
      />

      <EmailCard>
        <EmailParagraph>
          {accessEndsLabel
            ? `You keep access through ${accessEndsLabel}.`
            : "Your account remains available on your current plan limits."}
        </EmailParagraph>

        <EmailParagraph>
          You can restart your subscription anytime from billing
          settings.
        </EmailParagraph>

        <EmailButton
          href={billingUrl}
          label="View Billing"
        />
      </EmailCard>
    </EmailLayout>
  );
}

SubscriptionCanceledEmail.PreviewProps = {
  planName: "Family",
  billingUrl:
    "https://www.hometechvault.com/settings/billing",
  accessEndsLabel: "August 20, 2026",
} satisfies SubscriptionCanceledEmailProps;
