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

export type MonthlyVaultReportEmailProps = {
  householdName: string;
  vaultScore: number;
  deviceCount: number;
  protectedValue: string;
  expiringWarranties: number;
  reportUrl: string;
};

export const monthlyVaultReportSubject =
  "Your monthly vault report";

export default function MonthlyVaultReportEmail({
  householdName,
  vaultScore,
  deviceCount,
  protectedValue,
  expiringWarranties,
  reportUrl,
}: MonthlyVaultReportEmailProps) {
  return (
    <EmailLayout
      preview={`${householdName} vault score: ${vaultScore}.`}
    >
      <EmailHeader
        headline="Your monthly vault report."
        subheading={`A calm snapshot of ${householdName}.`}
      />

      <EmailCard>
        <EmailParagraph>
          Here&apos;s how organized and protected your home
          technology looked this month.
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
            label="Vault score"
            value={`${vaultScore} / 100`}
          />
          <EmailDetailBlock
            label="Devices tracked"
            value={String(deviceCount)}
          />
          <EmailDetailBlock
            label="Protected value"
            value={protectedValue}
          />
          <EmailDetailBlock
            label="Warranties expiring soon"
            value={String(expiringWarranties)}
          />
        </Section>

        <EmailButton
          href={reportUrl}
          label="View Report"
        />
      </EmailCard>
    </EmailLayout>
  );
}

MonthlyVaultReportEmail.PreviewProps = {
  householdName: "The Morgan Household",
  vaultScore: 92,
  deviceCount: 24,
  protectedValue: "$18,400",
  expiringWarranties: 2,
  reportUrl: "https://www.hometechvault.com/reports",
} satisfies MonthlyVaultReportEmailProps;
