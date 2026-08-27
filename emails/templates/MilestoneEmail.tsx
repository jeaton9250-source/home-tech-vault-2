import { EmailButton } from "@/emails/components/EmailButton";
import {
  EmailCard,
  EmailParagraph,
} from "@/emails/components/EmailCard";
import { EmailHeader } from "@/emails/components/EmailHeader";
import { EmailLayout } from "@/emails/components/EmailLayout";
import { emailTheme } from "@/emails/styles/emailTheme";

export type MilestoneEmailType =
  | "first_device"
  | "onboarding_complete";

export type MilestoneEmailProps = {
  type: MilestoneEmailType;
  firstName?: string;
  dashboardUrl: string;
};

export function getMilestoneSubject(
  type: MilestoneEmailType
) {
  switch (type) {
    case "first_device":
      return "Your first device is in the Vault";
    case "onboarding_complete":
      return "Your Home Tech Vault is ready";
  }
}

export default function MilestoneEmail({
  type,
  firstName,
  dashboardUrl,
}: MilestoneEmailProps) {
  const name = firstName
    ? `, ${firstName}`
    : "";

  if (type === "first_device") {
    return (
      <EmailLayout preview="Your first device is officially in your Home Tech Vault.">
        <EmailHeader
          headline={`Nice work${name}.`}
          subheading="Your first device is officially in the Vault."
        />

        <EmailCard>
          <EmailParagraph>
            You have started building a useful digital record of
            your home. Add the model number, serial number,
            warranty, receipt, or manual whenever you have them.
          </EmailParagraph>

          <EmailParagraph>
            You do not have to organize everything at once.
            Building your vault one device at a time is exactly
            how it is meant to work.
          </EmailParagraph>

          <EmailButton
            href={dashboardUrl}
            label="Open Your Vault"
          />
        </EmailCard>
      </EmailLayout>
    );
  }

  return (
    <EmailLayout preview="Your Home Tech Vault setup is complete.">
      <EmailHeader
        headline={`Your vault is ready${name}.`}
        subheading="The foundation of your Home Tech Vault is officially in place."
      />

      <EmailCard>
        <EmailParagraph>
          Your home now has a place for the details that are easy
          to lose: devices, warranties, manuals, receipts,
          documents, and maintenance records.
        </EmailParagraph>

        <EmailParagraph>
          Keep adding things as you need them. The more your vault
          grows, the more useful it becomes when something breaks,
          needs service, or you simply need to find a detail fast.
        </EmailParagraph>

        <EmailButton
          href={dashboardUrl}
          label="Go to Your Dashboard"
        />
      </EmailCard>
    </EmailLayout>
  );
}

export function renderMilestonePlainText({
  type,
  firstName,
  dashboardUrl,
}: MilestoneEmailProps) {
  const greeting = firstName
    ? `Hi ${firstName},`
    : "Hi,";

  if (type === "first_device") {
    return `${getMilestoneSubject(type)}

${greeting}

Your first device is officially in your Home Tech Vault.

Add its model number, serial number, warranty, receipt, or manual whenever you have them. You do not have to organize everything at once.

Open your vault:
${dashboardUrl}

${emailTheme.brand.name}
${emailTheme.brand.tagline}`;
  }

  return `${getMilestoneSubject(type)}

${greeting}

The foundation of your Home Tech Vault is officially in place.

Keep adding devices, warranties, manuals, receipts, documents, and maintenance records as you need them.

Open your dashboard:
${dashboardUrl}

${emailTheme.brand.name}
${emailTheme.brand.tagline}`;
}
