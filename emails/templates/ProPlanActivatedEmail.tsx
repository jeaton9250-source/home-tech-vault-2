import { EmailButton } from "@/emails/components/EmailButton";
import {
  EmailCard,
  EmailParagraph,
} from "@/emails/components/EmailCard";
import { EmailHeader } from "@/emails/components/EmailHeader";
import { EmailLayout } from "@/emails/components/EmailLayout";

export type ProPlanActivatedEmailProps = {
  billingUrl: string;
};

export const proPlanActivatedSubject =
  "Your Pro plan is active";

export default function ProPlanActivatedEmail({
  billingUrl,
}: ProPlanActivatedEmailProps) {
  return (
    <EmailLayout preview="Your Pro plan is active.">
      <EmailHeader
        headline="Pro is active."
        subheading="Unlimited inventory and premium intelligence are now unlocked."
      />

      <EmailCard>
        <EmailParagraph>
          Your home technology vault now includes unlimited
          devices, documents, advanced reports, and priority
          support.
        </EmailParagraph>

        <EmailButton
          href={billingUrl}
          label="View Billing"
        />
      </EmailCard>
    </EmailLayout>
  );
}

ProPlanActivatedEmail.PreviewProps = {
  billingUrl:
    "https://www.hometechvault.com/settings/billing",
} satisfies ProPlanActivatedEmailProps;
