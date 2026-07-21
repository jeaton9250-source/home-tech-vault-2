import {
  Hr,
  Link,
  Section,
  Text,
} from "@react-email/components";

import { emailTheme } from "@/emails/styles/emailTheme";

export function EmailFooter() {
  const { colors, brand } = emailTheme;
  const year = new Date().getFullYear();

  return (
    <Section style={{ marginTop: "28px" }}>
      <Hr
        style={{
          borderColor: colors.border,
          margin: "0 0 24px",
        }}
      />

      <Text
        style={{
          margin: 0,
          fontSize: "14px",
          lineHeight: "1.8",
          fontWeight: 500,
          color: colors.textPrimary,
        }}
      >
        Organize.
        <br />
        Protect.
        <br />
        Simplify.
      </Text>

      <Text
        style={{
          margin: "18px 0 0",
          fontSize: "13px",
          lineHeight: "1.8",
          color: colors.textMuted,
        }}
      >
        {brand.name}
        <br />
        <Link
          href={brand.siteUrl}
          style={{
            color: colors.textMuted,
            textDecoration: "none",
          }}
        >
          {brand.siteUrl}
        </Link>
        <br />
        <Link
          href={`mailto:${brand.supportEmail}`}
          style={{
            color: colors.textMuted,
            textDecoration: "none",
          }}
        >
          {brand.supportEmail}
        </Link>
      </Text>

      <Text
        style={{
          margin: "16px 0 0",
          fontSize: "13px",
          lineHeight: "1.8",
        }}
      >
        <Link
          href={`${brand.siteUrl}/privacy`}
          style={{
            color: colors.textMuted,
            textDecoration: "none",
            marginRight: "16px",
          }}
        >
          Privacy
        </Link>
        <Link
          href={`${brand.siteUrl}/terms`}
          style={{
            color: colors.textMuted,
            textDecoration: "none",
          }}
        >
          Terms
        </Link>
      </Text>

      <Text
        style={{
          margin: "18px 0 0",
          fontSize: "12px",
          color: colors.textMuted,
        }}
      >
        © {year} {brand.name}
      </Text>
    </Section>
  );
}
