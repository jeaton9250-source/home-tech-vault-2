import { EmailButton } from "@/emails/components/EmailButton";
import {
  EmailCard,
  EmailParagraph,
} from "@/emails/components/EmailCard";
import { EmailHeader } from "@/emails/components/EmailHeader";
import { EmailLayout } from "@/emails/components/EmailLayout";
import { emailTheme } from "@/emails/styles/emailTheme";

export type ComplimentaryAccessExpiredEmailProps = {
  firstName: string;
  planLabel: "Pro" | "Family";
  accountUrl: string;
  expiredAtLabel: string;
  retainsPremiumAccess: boolean;
};

export const complimentaryAccessExpiredSubject = (
  planLabel: "Pro" | "Family"
) =>
  `Your complimentary ${planLabel} access has ended`;

export function renderComplimentaryAccessExpiredPlainText(
  props: ComplimentaryAccessExpiredEmailProps
) {
  const followUp = props.retainsPremiumAccess
    ? "Your account continues to include access through your personal subscription or eligible Family household access."
    : "Your account and stored data remain available. Your current features will now follow your personal subscription and any eligible Family household access.";

  return `${complimentaryAccessExpiredSubject(props.planLabel)}

Hi ${props.firstName},

Your complimentary ${props.planLabel} access ended on ${props.expiredAtLabel}.

${followUp}

View your account:
${props.accountUrl}

${emailTheme.brand.name}
${emailTheme.brand.supportEmail}`;
}

export default function ComplimentaryAccessExpiredEmail({
  firstName,
  planLabel,
  accountUrl,
  expiredAtLabel,
  retainsPremiumAccess,
}: ComplimentaryAccessExpiredEmailProps) {
  return (
    <EmailLayout
      preview={`Your complimentary ${planLabel} access has ended.`}
    >
      <EmailHeader
        headline="Complimentary access has ended."
        subheading={`Your complimentary ${planLabel} access expired on ${expiredAtLabel}.`}
      />

      <EmailCard>
        <EmailParagraph>
          Hi {firstName},
        </EmailParagraph>

        <EmailParagraph>
          Your complimentary {planLabel} access ended on{" "}
          {expiredAtLabel}.
        </EmailParagraph>

        <EmailParagraph>
          {retainsPremiumAccess
            ? "Your account continues to include access through your personal subscription or eligible Family household access."
            : "Your account and stored data remain available. Your current features will now follow your personal subscription and any eligible Family household access."}
        </EmailParagraph>

        <EmailButton
          href={accountUrl}
          label="View your account"
        />
      </EmailCard>
    </EmailLayout>
  );
}

ComplimentaryAccessExpiredEmail.PreviewProps = {
  firstName: "Alex",
  planLabel: "Family",
  accountUrl: "https://hometechvault.com/account",
  expiredAtLabel: "July 21, 2026",
  retainsPremiumAccess: false,
} satisfies ComplimentaryAccessExpiredEmailProps;
