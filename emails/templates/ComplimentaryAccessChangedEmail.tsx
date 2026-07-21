import { EmailButton } from "@/emails/components/EmailButton";
import {
  EmailCard,
  EmailDetailBlock,
  EmailParagraph,
} from "@/emails/components/EmailCard";
import { EmailHeader } from "@/emails/components/EmailHeader";
import { EmailLayout } from "@/emails/components/EmailLayout";
import { emailTheme } from "@/emails/styles/emailTheme";

export type ComplimentaryAccessChangedEmailProps = {
  firstName: string;
  previousPlanLabel: "Pro" | "Family";
  newPlanLabel: "Pro" | "Family";
  accountUrl: string;
  expiresAtLabel?: string | null;
};

export const complimentaryAccessChangedSubject =
  "Your Home Tech Vault access has been updated";

export function renderComplimentaryAccessChangedPlainText(
  props: ComplimentaryAccessChangedEmailProps
) {
  const expiration = props.expiresAtLabel
    ? `New expiration: ${props.expiresAtLabel}`
    : "Your complimentary access does not currently have an expiration date.";

  return `${complimentaryAccessChangedSubject}

Hi ${props.firstName},

Your complimentary Home Tech Vault access has been updated.

Previous plan: ${props.previousPlanLabel}
New plan: ${props.newPlanLabel}
${expiration}

No payment was collected, and your Stripe billing remains unchanged.

Review your access:
${props.accountUrl}

${emailTheme.brand.name}
${emailTheme.brand.supportEmail}`;
}

export default function ComplimentaryAccessChangedEmail({
  firstName,
  previousPlanLabel,
  newPlanLabel,
  accountUrl,
  expiresAtLabel,
}: ComplimentaryAccessChangedEmailProps) {
  return (
    <EmailLayout preview="Your Home Tech Vault access has been updated.">
      <EmailHeader
        headline="Your access has been updated."
        subheading="Complimentary Home Tech Vault access was changed on your account."
      />

      <EmailCard>
        <EmailParagraph>
          Hi {firstName},
        </EmailParagraph>

        <EmailParagraph>
          Your complimentary Home Tech Vault access has
          been updated to the {newPlanLabel} plan.
        </EmailParagraph>

        <EmailDetailBlock
          label="Previous plan"
          value={previousPlanLabel}
        />
        <EmailDetailBlock
          label="New plan"
          value={newPlanLabel}
        />
        <EmailDetailBlock
          label="Expiration"
          value={
            expiresAtLabel ||
            "No expiration date"
          }
        />

        <EmailParagraph>
          No payment was collected, and your Stripe
          billing remains unchanged.
        </EmailParagraph>

        <EmailButton
          href={accountUrl}
          label="Review your access"
        />
      </EmailCard>
    </EmailLayout>
  );
}

ComplimentaryAccessChangedEmail.PreviewProps = {
  firstName: "Alex",
  previousPlanLabel: "Pro",
  newPlanLabel: "Family",
  accountUrl: "https://hometechvault.com/account",
  expiresAtLabel: "August 20, 2026",
} satisfies ComplimentaryAccessChangedEmailProps;
