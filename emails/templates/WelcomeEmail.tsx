import { EmailButton } from "@/emails/components/EmailButton";
import {
  EmailCard,
  EmailParagraph,
} from "@/emails/components/EmailCard";
import { EmailHeader } from "@/emails/components/EmailHeader";
import { EmailLayout } from "@/emails/components/EmailLayout";
import { emailTheme } from "@/emails/styles/emailTheme";

export type WelcomeEmailProps = {
  firstName?: string;
  dashboardUrl: string;
};

export const welcomeSubject =
  "Welcome to Home Tech Vault";

export default function WelcomeEmail({
  firstName,
  dashboardUrl,
}: WelcomeEmailProps) {
  const greeting = firstName
    ? `Welcome, ${firstName}.`
    : "Welcome.";

  return (
    <EmailLayout preview="Your home technology vault is ready.">
      <EmailHeader
        headline={greeting}
        subheading="Your vault is ready whenever you are."
      />

      <EmailCard>
        <EmailParagraph>
          Start with your most important devices, receipts, and
          warranties. Home Tech Vault keeps everything calm,
          organized, and easy to find.
        </EmailParagraph>

        <EmailButton
          href={dashboardUrl}
          label="Open Your Vault"
        />
      </EmailCard>
    </EmailLayout>
  );
}

WelcomeEmail.PreviewProps = {
  firstName: "Alex",
  dashboardUrl: "https://hometechvault.com/dashboard",
} satisfies WelcomeEmailProps;

export function renderWelcomePlainText(
  props: WelcomeEmailProps
) {
  return `${welcomeSubject}

Your vault is ready whenever you are.

Open your vault:
${props.dashboardUrl}

${emailTheme.brand.name}
${emailTheme.brand.tagline}`;
}
