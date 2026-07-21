import { emailBrand } from "@/lib/emails/brand";
import { escapeHtml } from "@/lib/emails/utils";

export function renderEmailCard(children: string) {
  return `
    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      class="email-card"
      style="
        width: 100%;
        max-width: ${emailBrand.maxWidth};
        background-color: ${emailBrand.colors.card};
        border: 1px solid ${emailBrand.colors.border};
        border-radius: ${emailBrand.radius};
      "
    >
      <tr>
        <td class="email-card-cell" style="padding: 36px 32px;">
          ${children}
        </td>
      </tr>
    </table>
  `.trim();
}

export function renderEmailParagraphs(
  paragraphs: string[]
) {
  return paragraphs
    .map(
      (paragraph) => `
        <p
          class="email-text-secondary"
          style="
            margin: 0 0 16px;
            font-size: 15px;
            line-height: 1.75;
            color: ${emailBrand.colors.textSecondary};
          "
        >
          ${escapeHtml(paragraph)}
        </p>
      `
    )
    .join("");
}

export function renderSecurityNote(note: string) {
  return `
    <p
      class="email-text-secondary"
      style="
        margin: 28px 0 0;
        padding: 16px 18px;
        background-color: ${emailBrand.colors.background};
        border: 1px solid ${emailBrand.colors.border};
        border-radius: ${emailBrand.radius};
        font-size: 13px;
        line-height: 1.7;
        color: ${emailBrand.colors.textSecondary};
      "
    >
      ${escapeHtml(note)}
    </p>
  `.trim();
}

export function renderFallbackLink(href: string) {
  return `
    <p
      class="email-text-secondary"
      style="
        margin: 18px 0 0;
        font-size: 12px;
        line-height: 1.7;
        word-break: break-all;
        color: ${emailBrand.colors.footerMuted};
      "
    >
      Button not working? Copy and paste this link:<br />
      <a href="${escapeHtml(href)}" style="color: ${emailBrand.colors.textSecondary};">
        ${escapeHtml(href)}
      </a>
    </p>
  `.trim();
}

export function renderOtpBlock(tokenVariable: string) {
  return `
    <p
      class="email-text-primary"
      style="
        margin: 24px 0 0;
        font-size: 28px;
        font-weight: 600;
        letter-spacing: 0.28em;
        text-align: center;
        color: ${emailBrand.colors.textPrimary};
      "
      aria-label="Verification code"
    >
      ${escapeHtml(tokenVariable)}
    </p>
  `.trim();
}
