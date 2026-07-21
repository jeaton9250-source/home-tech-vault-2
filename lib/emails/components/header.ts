import { emailBrand } from "@/lib/emails/brand";
import { escapeHtml } from "@/lib/emails/utils";

type EmailHeaderProps = {
  overline?: string;
  headline: string;
  subheading?: string;
};

export function renderEmailHeader({
  overline = emailBrand.overline,
  headline,
  subheading,
}: EmailHeaderProps) {
  const safeHeadline = escapeHtml(headline);
  const safeSubheading = subheading
    ? escapeHtml(subheading)
    : "";

  return `
    <tr>
      <td align="center" style="padding: 0 0 28px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
          <tr>
            <td align="center" style="padding-bottom: 18px;">
              <img
                src="${emailBrand.logoUrl}"
                width="180"
                height="40"
                alt="Home Tech Vault logo"
                style="display: block; margin: 0 auto; max-width: 180px; height: auto; border: 0;"
              />
            </td>
          </tr>
        </table>

        <p
          class="email-text-secondary"
          style="
            margin: 0;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: ${emailBrand.colors.textSecondary};
          "
        >
          ${escapeHtml(overline)}
        </p>

        <h1
          class="email-headline email-text-primary"
          style="
            margin: 14px 0 0;
            font-size: 32px;
            line-height: 1.12;
            font-weight: 600;
            letter-spacing: -0.03em;
            color: ${emailBrand.colors.textPrimary};
          "
        >
          ${safeHeadline}
        </h1>

        ${
          safeSubheading
            ? `<p
                class="email-text-secondary"
                style="
                  margin: 14px 0 0;
                  font-size: 16px;
                  line-height: 1.7;
                  color: ${emailBrand.colors.textSecondary};
                "
              >
                ${safeSubheading}
              </p>`
            : ""
        }
      </td>
    </tr>
  `.trim();
}
