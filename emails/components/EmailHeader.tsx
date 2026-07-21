import {
  Heading,
  Img,
  Section,
  Text,
} from "@react-email/components";

import { emailTheme } from "@/emails/styles/emailTheme";

type EmailHeaderProps = {
  headline: string;
  subheading?: string;
};

export function EmailHeader({
  headline,
  subheading,
}: EmailHeaderProps) {
  const { colors, brand } = emailTheme;

  return (
    <Section style={{ textAlign: "center", marginBottom: "28px" }}>
      <Img
        src={brand.logoUrl}
        width="180"
        height="40"
        alt={`${brand.name} logo`}
        style={{
          display: "block",
          margin: "0 auto 18px",
        }}
      />

      <Text
        style={{
          margin: "0",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: colors.textMuted,
        }}
      >
        {brand.overline}
      </Text>

      <Heading
        as="h1"
        style={{
          margin: "14px 0 0",
          fontSize: "32px",
          lineHeight: "1.12",
          fontWeight: 600,
          letterSpacing: "-0.03em",
          color: colors.textPrimary,
        }}
      >
        {headline}
      </Heading>

      {subheading ? (
        <Text
          style={{
            margin: "14px 0 0",
            fontSize: "16px",
            lineHeight: "1.7",
            color: colors.textSecondary,
          }}
        >
          {subheading}
        </Text>
      ) : null}
    </Section>
  );
}
