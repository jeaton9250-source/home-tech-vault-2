import { EmailButton } from "@/emails/components/EmailButton";
import { EmailCard, EmailParagraph } from "@/emails/components/EmailCard";
import { EmailHeader } from "@/emails/components/EmailHeader";
import { EmailLayout } from "@/emails/components/EmailLayout";

export type WelcomeEmailProps = {
  firstName?: string;
  dashboardUrl: string;
};

export const welcomeSubject = "Your Home Tech Vault is ready";

export default function WelcomeEmail({ firstName, dashboardUrl }: WelcomeEmailProps) {
  const greeting = firstName?.trim() ? `Hi ${firstName.trim()},` : "Hi there,";

  return (
    <EmailLayout preview={welcomeSubject}>
      <EmailHeader headline={welcomeSubject} />
      <EmailCard>
        <EmailParagraph>{greeting}</EmailParagraph>
        <EmailParagraph>
          Welcome to Home Tech Vault. The easiest way to get value from it is to start small.
        </EmailParagraph>
        <EmailParagraph>
          Add 3–5 of the devices you&apos;d most want information about if something broke tomorrow.
          Once those are in, save a receipt, warranty, or manual for at least one of them.
        </EmailParagraph>
        <EmailParagraph>
          You don&apos;t need to catalog your entire home today. Your vault can grow naturally over time.
        </EmailParagraph>
        <EmailParagraph>Start here:</EmailParagraph>
        <EmailButton href={dashboardUrl} label="Open Your Vault" />
        <EmailParagraph>— Jason</EmailParagraph>
      </EmailCard>
    </EmailLayout>
  );
}

WelcomeEmail.PreviewProps = {
  firstName: "Alex",
  dashboardUrl: "https://www.hometechvault.com/dashboard",
} satisfies WelcomeEmailProps;

export function renderWelcomePlainText({ firstName, dashboardUrl }: WelcomeEmailProps) {
  const greeting = firstName?.trim() ? `Hi ${firstName.trim()},` : "Hi there,";
  return `${welcomeSubject}

${greeting}

Welcome to Home Tech Vault. The easiest way to get value from it is to start small.

Add 3–5 of the devices you'd most want information about if something broke tomorrow. Once those are in, save a receipt, warranty, or manual for at least one of them.

You don't need to catalog your entire home today. Your vault can grow naturally over time.

Start here: ${dashboardUrl}

— Jason`;
}
