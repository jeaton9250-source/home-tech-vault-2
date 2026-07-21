import { Section } from "@react-email/components";

import { EmailButton } from "@/emails/components/EmailButton";
import {
  EmailCard,
  EmailDetailBlock,
  EmailParagraph,
} from "@/emails/components/EmailCard";
import { EmailHeader } from "@/emails/components/EmailHeader";
import { EmailLayout } from "@/emails/components/EmailLayout";
import { emailTheme } from "@/emails/styles/emailTheme";

export type MaintenanceReminderEmailProps = {
  taskName: string;
  deviceName: string;
  dueLabel: string;
  maintenanceUrl: string;
};

export const maintenanceReminderSubject =
  "Maintenance is overdue";

export default function MaintenanceReminderEmail({
  taskName,
  deviceName,
  dueLabel,
  maintenanceUrl,
}: MaintenanceReminderEmailProps) {
  return (
    <EmailLayout
      preview={`${taskName} for ${deviceName} is overdue.`}
    >
      <EmailHeader
        headline="Maintenance is overdue."
        subheading="A small task now keeps your home technology reliable."
      />

      <EmailCard>
        <EmailParagraph>
          This maintenance item is ready for attention in your
          vault.
        </EmailParagraph>

        <Section
          style={{
            marginTop: "24px",
            padding: "20px",
            backgroundColor: emailTheme.colors.background,
            borderRadius: emailTheme.radius,
          }}
        >
          <EmailDetailBlock
            label="Task"
            value={taskName}
          />
          <EmailDetailBlock
            label="Device"
            value={deviceName}
          />
          <EmailDetailBlock
            label="Due"
            value={dueLabel}
          />
        </Section>

        <EmailButton
          href={maintenanceUrl}
          label="Review Maintenance"
        />
      </EmailCard>
    </EmailLayout>
  );
}

MaintenanceReminderEmail.PreviewProps = {
  taskName: "Replace air filter",
  deviceName: "Mesh Wi-Fi Router",
  dueLabel: "Overdue by 5 days",
  maintenanceUrl:
    "https://hometechvault.com/maintenance",
} satisfies MaintenanceReminderEmailProps;
