import {
  EmailCard,
  EmailParagraph,
} from "@/emails/components/EmailCard";
import { EmailHeader } from "@/emails/components/EmailHeader";
import { EmailLayout } from "@/emails/components/EmailLayout";
import { emailTheme } from "@/emails/styles/emailTheme";

export type FamilyInvitationAcceptedEmailProps = {
  memberName: string;
  householdName: string;
  familyUrl: string;
};

export const familyInvitationAcceptedSubject =
  "A new member joined your household";

export default function FamilyInvitationAcceptedEmail({
  memberName,
  householdName,
  familyUrl,
}: FamilyInvitationAcceptedEmailProps) {
  return (
    <EmailLayout
      preview={`${memberName} joined ${householdName}.`}
    >
      <EmailHeader
        headline="Your household just grew."
        subheading={`${memberName} accepted your invitation.`}
      />

      <EmailCard>
        <EmailParagraph>
          {memberName} now has access to {householdName} based on
          the role you assigned.
        </EmailParagraph>

        <EmailParagraph>
          Review household members anytime from your Family
          settings.
        </EmailParagraph>

        <a
          href={familyUrl}
          style={{
            color: emailTheme.colors.homeHealth,
            fontSize: "15px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          View household →
        </a>
      </EmailCard>
    </EmailLayout>
  );
}

FamilyInvitationAcceptedEmail.PreviewProps = {
  memberName: "Jordan Morgan",
  householdName: "The Morgan Household",
  familyUrl: "https://www.hometechvault.com/family",
} satisfies FamilyInvitationAcceptedEmailProps;
