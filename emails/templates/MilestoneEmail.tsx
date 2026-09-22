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
  | "core_setup"
  | "activated"
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
    case "core_setup":
      return "Your Home Tech Vault is taking shape";
    case "activated":
      return "Your Home Tech Vault foundation is ready";
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
            your home. Next, add a receipt, warranty, manual, or
            other document to keep the important details with the
            device they belong to.
          </EmailParagraph>

          <EmailParagraph>
            You do not have to organize everything at once.
            Building your vault one useful record at a time is
            exactly how it is meant to work.
          </EmailParagraph>

          <EmailButton
            href={dashboardUrl}
            label="Continue Building Your Vault"
          />
        </EmailCard>
      </EmailLayout>
    );
  }

  if (type === "core_setup") {
    return (
      <EmailLayout preview="Your device and document records are taking shape.">
        <EmailHeader
          headline={`You're making progress${name}.`}
          subheading="Your vault now has more than just a device list."
        />

        <EmailCard>
          <EmailParagraph>
            You have a device and supporting information saved in
            Home Tech Vault. That means the details you may need
            later are starting to live together in one place.
          </EmailParagraph>

          <EmailParagraph>
            A useful next step is adding a maintenance or care
            item. It can be something simple, like replacing a
            filter, checking for updates, cleaning equipment, or
            remembering a future service date.
          </EmailParagraph>

          <EmailButton
            href={dashboardUrl}
            label="Add a Care Item"
          />
        </EmailCard>
      </EmailLayout>
    );
  }

  if (type === "activated") {
    return (
      <EmailLayout preview="The foundation of your Home Tech Vault is in place.">
        <EmailHeader
          headline={`Your vault is working${name}.`}
          subheading="You now have the foundation of a useful home technology record."
        />

        <EmailCard>
          <EmailParagraph>
            You have added a device, supporting information, and
            a maintenance or care item. That is the foundation
            Home Tech Vault is designed to help you build.
          </EmailParagraph>

          <EmailParagraph>
            From here, there is no need to fill out everything at
            once. Keep adding devices, documents, warranties, and
            care records as they become useful to you.
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

Next, add a receipt, warranty, manual, or other document so the important details stay with the device they belong to.

Continue building your vault:
${dashboardUrl}

${emailTheme.brand.name}
${emailTheme.brand.tagline}`;
  }

  if (type === "core_setup") {
    return `${getMilestoneSubject(type)}

${greeting}

You now have a device and supporting information saved in Home Tech Vault.

A useful next step is adding a maintenance or care item, such as a future service date, filter change, update, or cleaning reminder.

Continue your setup:
${dashboardUrl}

${emailTheme.brand.name}
${emailTheme.brand.tagline}`;
  }

  if (type === "activated") {
    return `${getMilestoneSubject(type)}

${greeting}

You have added a device, supporting information, and a maintenance or care item. The foundation of your Home Tech Vault is now in place.

There is no need to fill out everything at once. Keep adding records whenever they become useful.

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
