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

function resolveAuthEmailActionUrl(
  template: AuthEmailTemplateDefinition
) {
  if (template.id === "invite") {
    return supabaseVars.inviteConfirmUrl;
  }

  return supabaseVars.confirmationUrl;
}

export function renderAuthEmailHtml(
  template: AuthEmailTemplateDefinition
) {
  const actionUrl = resolveAuthEmailActionUrl(template);

  const cardBody = `
    ${renderEmailParagraphs(template.paragraphs)}
    ${renderEmailButton({
      href: actionUrl,
      label: template.buttonLabel,
    })}
    ${
      template.includeOtp
        ? renderOtpBlock(supabaseVars.token)
        : ""
    }
    ${renderSecurityNote(template.securityNote)}
    ${renderFallbackLink(actionUrl)}
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
  const actionUrl = resolveAuthEmailActionUrl(template);

  const lines = [
    template.headline,
    "",
    ...template.paragraphs,
    "",
    `${template.buttonLabel}: ${actionUrl}`,
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
