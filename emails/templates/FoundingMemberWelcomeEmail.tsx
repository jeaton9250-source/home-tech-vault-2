import { EmailButton } from "@/emails/components/EmailButton";
import {
  EmailCard,
  EmailDetailBlock,
  EmailParagraph,
} from "@/emails/components/EmailCard";
import { EmailHeader } from "@/emails/components/EmailHeader";
import { EmailLayout } from "@/emails/components/EmailLayout";
import { emailTheme } from "@/emails/styles/emailTheme";

export type FoundingMemberWelcomeEmailProps = {
  firstName: string;
  memberNumber: number;
  dashboardUrl: string;
  contactUrl: string;
  includesComplimentaryPro: boolean;
};

export const foundingMemberWelcomeSubject =
  "Welcome to the Home Tech Vault Founding Members Program";

export function renderFoundingMemberWelcomePlainText(
  props: FoundingMemberWelcomeEmailProps
) {
  const accessLine = props.includesComplimentaryPro
    ? "As a thank you for joining early, you've received complimentary Pro access."
    : "Your Founding Member recognition is now active on your account.";

  return `${foundingMemberWelcomeSubject}

Hi ${props.firstName},

You're officially one of the first 50 Home Tech Vault Founding Members.

${accessLine}

Member number: #${props.memberNumber}
No payment was collected, and this does not create a Stripe subscription.

We'd love your feedback as we continue shaping Home Tech Vault.

Open Home Tech Vault:
${props.dashboardUrl}

Share feedback:
${props.contactUrl}

${emailTheme.brand.name}
${emailTheme.brand.supportEmail}`;
}

export default function FoundingMemberWelcomeEmail({
  firstName,
  memberNumber,
  dashboardUrl,
  contactUrl,
  includesComplimentaryPro,
}: FoundingMemberWelcomeEmailProps) {
  return (
    <EmailLayout
      preview="You're officially one of the first 50 Home Tech Vault Founding Members."
    >
      <EmailHeader
        headline="Welcome to the Founding Members Program"
        subheading="Thank you for helping shape Home Tech Vault from the beginning."
      />

      <EmailCard>
        <EmailParagraph>
          Hi {firstName},
        </EmailParagraph>

        <EmailParagraph>
          You&apos;re officially one of the first
          50 Home Tech Vault Founding Members.
        </EmailParagraph>

        {includesComplimentaryPro ? (
          <EmailParagraph>
            As a thank you for joining early,
            you&apos;ve received complimentary Pro
            access.
          </EmailParagraph>
        ) : (
          <EmailParagraph>
            Your Founding Member recognition is
            now active on your account.
          </EmailParagraph>
        )}

        <EmailDetailBlock
          label="Member number"
          value={`#${memberNumber}`}
        />
        <EmailDetailBlock
          label="Complimentary access"
          value={
            includesComplimentaryPro
              ? "Pro"
              : "Recognition only"
          }
        />

        <EmailParagraph>
          No payment was collected, and this does
          not create a Stripe subscription.
        </EmailParagraph>

        <EmailParagraph>
          We&apos;d love your feedback as we
          continue shaping Home Tech Vault.
        </EmailParagraph>

        <EmailButton
          href={dashboardUrl}
          label="Open Home Tech Vault"
        />
      </EmailCard>
    </EmailLayout>
  );
}

FoundingMemberWelcomeEmail.PreviewProps = {
  firstName: "Alex",
  memberNumber: 12,
  dashboardUrl: "https://hometechvault.com/dashboard",
  contactUrl: "https://hometechvault.com/contact",
  includesComplimentaryPro: true,
} satisfies FoundingMemberWelcomeEmailProps;
