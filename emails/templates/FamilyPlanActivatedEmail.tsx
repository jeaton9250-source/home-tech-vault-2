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
  "Your Household plan is active";

export default function FamilyPlanActivatedEmail({
  billingUrl,
}: FamilyPlanActivatedEmailProps) {
  return (
    <EmailLayout preview="Your Household plan is active.">
      <EmailHeader
        headline="Family is active."
        subheading="Share your vault with the people who help run your home."
      />

      <EmailCard>
        <EmailParagraph>
          Your household now includes everything in Home Plus plus
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
    "https://www.hometechvault.com/settings/billing",
} satisfies FamilyPlanActivatedEmailProps;
