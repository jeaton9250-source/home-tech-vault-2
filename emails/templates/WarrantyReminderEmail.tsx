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

export type WarrantyReminderEmailProps = {
  deviceName: string;
  expirationLabel: string;
  daysRemaining: number;
  deviceUrl: string;
};

export const warrantyReminderSubject =
  "Warranty expiring soon";

export default function WarrantyReminderEmail({
  deviceName,
  expirationLabel,
  daysRemaining,
  deviceUrl,
}: WarrantyReminderEmailProps) {
  return (
    <EmailLayout
      preview={`${deviceName} warranty expires in ${daysRemaining} days.`}
    >
      <EmailHeader
        headline="Warranty expiring soon."
        subheading="A little attention now can save a costly surprise later."
      />

      <EmailCard>
        <EmailParagraph>
          One of your devices needs a quick review before coverage
          runs out.
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
            label="Device"
            value={deviceName}
          />
          <EmailDetailBlock
            label="Expires"
            value={expirationLabel}
          />
          <EmailDetailBlock
            label="Time remaining"
            value={`${daysRemaining} days`}
          />
        </Section>

        <EmailButton
          href={deviceUrl}
          label="Review Device"
        />
      </EmailCard>
    </EmailLayout>
  );
}

WarrantyReminderEmail.PreviewProps = {
  deviceName: "Living Room Smart TV",
  expirationLabel: "August 20, 2026",
  daysRemaining: 30,
  deviceUrl:
    "https://www.hometechvault.com/devices/sample-device",
} satisfies WarrantyReminderEmailProps;
