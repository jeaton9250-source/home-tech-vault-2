import { EmailButton } from "@/emails/components/EmailButton";
import {
  EmailCard,
  EmailParagraph,
} from "@/emails/components/EmailCard";
import { EmailHeader } from "@/emails/components/EmailHeader";
import { EmailLayout } from "@/emails/components/EmailLayout";

export type FamilyPlanActivatedEmailProps = {
  billingUrl: string;
};

export const familyPlanActivatedSubject =
  "Your Family plan is active";

export default function FamilyPlanActivatedEmail({
  billingUrl,
}: FamilyPlanActivatedEmailProps) {
  return (
    <EmailLayout preview="Your Family plan is active.">
      <EmailHeader
        headline="Family is active."
        subheading="Share your vault with the people who help run your home."
      />

      <EmailCard>
        <EmailParagraph>
          Your household now includes everything in Pro plus
          shared access, invitations, and role-based permissions.
        </EmailParagraph>

        <EmailButton
          href={billingUrl}
          label="Manage Household"
        />
      </EmailCard>
    </EmailLayout>
  );
}

FamilyPlanActivatedEmail.PreviewProps = {
  billingUrl:
    "https://hometechvault.com/settings/billing",
} satisfies FamilyPlanActivatedEmailProps;
