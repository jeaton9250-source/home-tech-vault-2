import { Button, Section } from "@react-email/components";

import { emailTheme } from "@/emails/styles/emailTheme";

type EmailButtonProps = {
  href: string;
  label: string;
};

export function EmailButton({
  href,
  label,
}: EmailButtonProps) {
  const { colors, radius } = emailTheme;

  return (
    <Section style={{ textAlign: "center", margin: "32px 0 0" }}>
      <Button
        href={href}
        style={{
          display: "inline-block",
          minWidth: "220px",
          padding: "16px 28px",
          backgroundColor: colors.button,
          color: colors.buttonText,
          fontSize: "15px",
          fontWeight: 600,
          lineHeight: "1",
          textDecoration: "none",
          borderRadius: radius,
        }}
      >
        {label}
      </Button>
    </Section>
  );
}
