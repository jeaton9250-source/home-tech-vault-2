import {
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

import { emailTheme } from "@/emails/styles/emailTheme";

type EmailCardProps = {
  children: ReactNode;
};

export function EmailCard({ children }: EmailCardProps) {
  const { colors, radius } = emailTheme;

  return (
    <Section
      style={{
        backgroundColor: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: radius,
        padding: "36px 32px",
      }}
    >
      {children}
    </Section>
  );
}

export function EmailParagraph({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Text
      style={{
        margin: "0 0 16px",
        fontSize: "15px",
        lineHeight: "1.75",
        color: emailTheme.colors.textSecondary,
      }}
    >
      {children}
    </Text>
  );
}

export function EmailDetailBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Section
      style={{
        marginTop: "12px",
        padding: "0",
      }}
    >
      <Text
        style={{
          margin: 0,
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: emailTheme.colors.warning,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          margin: "8px 0 0",
          fontSize: "16px",
          fontWeight: 600,
          color: emailTheme.colors.textPrimary,
        }}
      >
        {value}
      </Text>
    </Section>
  );
}

export function EmailSecurityNote({
  children,
}: {
  children: ReactNode;
}) {
  const { colors, radius } = emailTheme;

  return (
    <Text
      style={{
        margin: "28px 0 0",
        padding: "16px 18px",
        backgroundColor: colors.background,
        border: `1px solid ${colors.border}`,
        borderRadius: radius,
        fontSize: "13px",
        lineHeight: "1.7",
        color: colors.textMuted,
      }}
    >
      {children}
    </Text>
  );
}

export function EmailFallbackLink({
  href,
}: {
  href: string;
}) {
  return (
    <Text
      style={{
        margin: "18px 0 0",
        fontSize: "12px",
        lineHeight: "1.7",
        wordBreak: "break-all",
        color: emailTheme.colors.textMuted,
      }}
    >
      Button not working? Copy and paste this link:
      <br />
      <a
        href={href}
        style={{
          color: emailTheme.colors.textSecondary,
        }}
      >
        {href}
      </a>
    </Text>
  );
}
