import {
  Body,
  Container,
  Head,
  Html,
  Preview,
} from "@react-email/components";
import type { ReactNode } from "react";

import { EmailFooter } from "@/emails/components/EmailFooter";
import { emailTheme } from "@/emails/styles/emailTheme";

type EmailLayoutProps = {
  preview: string;
  children: ReactNode;
};

export function EmailLayout({
  preview,
  children,
}: EmailLayoutProps) {
  const { colors, fontFamily, maxWidth } =
    emailTheme;

  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          margin: 0,
          padding: "32px 16px",
          backgroundColor: colors.background,
          fontFamily,
          color: colors.textPrimary,
        }}
      >
        <Container
          style={{
            maxWidth,
            margin: "0 auto",
          }}
        >
          {children}
          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
}
