import { EmailButton } from "@/emails/components/EmailButton";
import {
  EmailCard,
  EmailDetailBlock,
  EmailParagraph,
} from "@/emails/components/EmailCard";
import { EmailHeader } from "@/emails/components/EmailHeader";
import { EmailLayout } from "@/emails/components/EmailLayout";
import { emailTheme } from "@/emails/styles/emailTheme";

export type SupportRequestReceivedEmailProps = {
  firstName?: string;
  customerEmail: string;
  ticketNumber: string;
  subject: string;
  category: string;
  contactUrl: string;
};

export const supportRequestReceivedSubject =
  "We received your Home Tech Vault support request";

export default function SupportRequestReceivedEmail({
  firstName,
  customerEmail,
  ticketNumber,
  subject,
  category,
  contactUrl,
}: SupportRequestReceivedEmailProps) {
  const greeting = firstName
    ? `Hi ${firstName},`
    : "Hi there,";

  return (
    <EmailLayout preview="Your support request has been received.">
      <EmailHeader
        headline="Message received."
        subheading="Your request is in good hands."
      />

      <EmailCard>
        <EmailParagraph>{greeting}</EmailParagraph>

        <EmailParagraph>
          We received your message and created support request{" "}
          <strong>{ticketNumber}</strong>.
        </EmailParagraph>

        <EmailParagraph>
          Our team will review it and reply to{" "}
          <strong>{customerEmail}</strong>.
        </EmailParagraph>

        <EmailDetailBlock
          label="Ticket number"
          value={ticketNumber}
        />

        <EmailDetailBlock
          label="Subject"
          value={subject}
        />

        <EmailDetailBlock
          label="Category"
          value={category}
        />

        <EmailParagraph>
          If you need to add more detail, reply to this email or send
          another message from the contact page.
        </EmailParagraph>

        <EmailButton
          href={contactUrl}
          label="Contact Home Tech Vault"
        />
      </EmailCard>
    </EmailLayout>
  );
}

SupportRequestReceivedEmail.PreviewProps = {
  firstName: "Alex",
  customerEmail: "alex@example.com",
  ticketNumber: "HTV-2026-000123",
  subject: "Need help syncing my devices",
  category: "Devices",
  contactUrl: "https://hometechvault.com/contact",
} satisfies SupportRequestReceivedEmailProps;

export function renderSupportRequestReceivedPlainText(
  props: SupportRequestReceivedEmailProps
) {
  const greeting = props.firstName
    ? `Hi ${props.firstName},`
    : "Hi there,";

  return `${supportRequestReceivedSubject}

${greeting}

We received your message and created support request ${props.ticketNumber}.

Our team will review it and reply to ${props.customerEmail}.

Ticket number: ${props.ticketNumber}
Subject: ${props.subject}
Category: ${props.category}

Contact page:
${props.contactUrl}

${emailTheme.brand.name}
${emailTheme.brand.tagline}`;
}
