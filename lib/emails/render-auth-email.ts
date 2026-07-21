import { renderEmailButton } from "@/lib/emails/components/button";
import {
  renderEmailCard,
  renderEmailParagraphs,
  renderFallbackLink,
  renderOtpBlock,
  renderSecurityNote,
} from "@/lib/emails/components/card";
import { renderAuthEmailLayout } from "@/lib/emails/components/layout";
import {
  type AuthEmailTemplateDefinition,
  supabaseVars,
} from "@/lib/emails/auth-templates";

export function renderAuthEmailHtml(
  template: AuthEmailTemplateDefinition
) {
  const cardBody = `
    ${renderEmailParagraphs(template.paragraphs)}
    ${renderEmailButton({
      href: supabaseVars.confirmationUrl,
      label: template.buttonLabel,
    })}
    ${
      template.includeOtp
        ? renderOtpBlock(supabaseVars.token)
        : ""
    }
    ${renderSecurityNote(template.securityNote)}
    ${renderFallbackLink(supabaseVars.confirmationUrl)}
  `;

  return renderAuthEmailLayout({
    preheader: template.preheader,
    headline: template.headline,
    subheading: template.subheading,
    body: renderEmailCard(cardBody),
  });
}

export function renderAuthEmailText(
  template: AuthEmailTemplateDefinition
) {
  const lines = [
    template.headline,
    "",
    ...template.paragraphs,
    "",
    `${template.buttonLabel}: ${supabaseVars.confirmationUrl}`,
  ];

  if (template.includeOtp) {
    lines.push(
      "",
      `Verification code: ${supabaseVars.token}`
    );
  }

  lines.push(
    "",
    template.securityNote,
    "",
    "Home Tech Vault",
    "Organize. Protect. Simplify.",
    "support@hometechvault.com",
    "https://hometechvault.com"
  );

  return lines.join("\n");
}
