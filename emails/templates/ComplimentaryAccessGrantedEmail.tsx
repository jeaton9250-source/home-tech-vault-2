import { EmailButton } from "@/emails/components/EmailButton";
import {
  EmailCard,
  EmailDetailBlock,
  EmailParagraph,
} from "@/emails/components/EmailCard";
import { EmailHeader } from "@/emails/components/EmailHeader";
import { EmailLayout } from "@/emails/components/EmailLayout";
import { emailTheme } from "@/emails/styles/emailTheme";

export type ComplimentaryAccessGrantedEmailProps = {
  firstName: string;
  planLabel: "Pro" | "Family";
  dashboardUrl: string;
  startsAtLabel: string;
  expiresAtLabel?: string | null;
  publicReason?: string | null;
};

export const complimentaryAccessGrantedSubject = (
  planLabel: "Pro" | "Family"
) =>
  `Your Home Tech Vault ${planLabel} access is ready`;

export function renderComplimentaryAccessGrantedPlainText(
  props: ComplimentaryAccessGrantedEmailProps
) {
  const expiration = props.expiresAtLabel
    ? `Your complimentary access is available through ${props.expiresAtLabel}.`
    : "Your complimentary access does not currently have an expiration date.";

  const reason = props.publicReason
    ? `\nReason: ${props.publicReason}\n`
    : "";

  return `${complimentaryAccessGrantedSubject(props.planLabel)}

Hi ${props.firstName},

You've received complimentary ${props.planLabel} access to Home Tech Vault.

Your new access includes the features available with the ${props.planLabel} plan.

${expiration}
${reason}
No payment was collected, and this does not create a Stripe subscription.

Plan: ${props.planLabel}
Start date: ${props.startsAtLabel}

Open Home Tech Vault:
${props.dashboardUrl}

${emailTheme.brand.name}
${emailTheme.brand.supportEmail}`;
}

export default function ComplimentaryAccessGrantedEmail({
  firstName,
  planLabel,
  dashboardUrl,
  startsAtLabel,
  expiresAtLabel,
  publicReason,
}: ComplimentaryAccessGrantedEmailProps) {
  return (
    <EmailLayout
      preview={`Your complimentary ${planLabel} access is ready.`}
    >
      <EmailHeader
        headline={`Your ${planLabel} access is ready.`}
        subheading="Complimentary Home Tech Vault access is now active on your account."
      />

      <EmailCard>
        <EmailParagraph>
          Hi {firstName},
        </EmailParagraph>

        <EmailParagraph>
          You&apos;ve received complimentary{" "}
          {planLabel} access to Home Tech Vault. Your
          new access includes the features available with
          the {planLabel} plan.
        </EmailParagraph>

        {expiresAtLabel ? (
          <EmailParagraph>
            Your complimentary access is available
            through {expiresAtLabel}.
          </EmailParagraph>
        ) : (
          <EmailParagraph>
            Your complimentary access does not currently
            have an expiration date.
          </EmailParagraph>
        )}

        <EmailDetailBlock
          label="Plan"
          value={planLabel}
        />
        <EmailDetailBlock
          label="Start date"
          value={startsAtLabel}
        />
        {expiresAtLabel ? (
          <EmailDetailBlock
            label="Expiration"
            value={expiresAtLabel}
          />
        ) : null}
        {publicReason ? (
          <EmailDetailBlock
            label="Access note"
            value={publicReason}
          />
        ) : null}

        <EmailParagraph>
          No payment was collected, and this does not
          create a Stripe subscription.
        </EmailParagraph>

        <EmailButton
          href={dashboardUrl}
          label="Open Home Tech Vault"
        />
      </EmailCard>
    </EmailLayout>
  );
}

ComplimentaryAccessGrantedEmail.PreviewProps = {
  firstName: "Alex",
  planLabel: "Pro",
  dashboardUrl: "https://www.hometechvault.com/dashboard",
  startsAtLabel: "July 21, 2026",
  expiresAtLabel: "August 20, 2026",
  publicReason: "Beta Tester",
} satisfies ComplimentaryAccessGrantedEmailProps;
