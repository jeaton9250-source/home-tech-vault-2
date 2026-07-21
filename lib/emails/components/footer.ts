import { emailBrand } from "@/lib/emails/brand";
import { escapeHtml } from "@/lib/emails/utils";

export function renderEmailFooter() {
  const year = new Date().getFullYear();

  return `
    <tr>
      <td style="padding: 28px 8px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="border-top: 1px solid ${emailBrand.colors.divider}; padding-top: 24px;">
              <p
                class="email-text-primary"
                style="
                  margin: 0;
                  font-size: 14px;
                  line-height: 1.8;
                  font-weight: 500;
                  color: ${emailBrand.colors.textPrimary};
                "
              >
                Organize.<br />
                Protect.<br />
                Simplify.
              </p>

              <p
                class="email-text-secondary"
                style="
                  margin: 18px 0 0;
                  font-size: 13px;
                  line-height: 1.8;
                  color: ${emailBrand.colors.textSecondary};
                "
              >
                <a
                  href="mailto:${emailBrand.supportEmail}"
                  style="color: ${emailBrand.colors.textSecondary}; text-decoration: none;"
                >
                  ${escapeHtml(emailBrand.supportEmail)}
                </a>
                <br />
                <a
                  href="${emailBrand.siteUrl}"
                  style="color: ${emailBrand.colors.textSecondary}; text-decoration: none;"
                >
                  ${escapeHtml(emailBrand.siteUrl)}
                </a>
              </p>

              <p
                style="
                  margin: 16px 0 0;
                  font-size: 13px;
                  line-height: 1.8;
                "
              >
                <a
                  href="${emailBrand.siteUrl}/privacy"
                  style="color: ${emailBrand.colors.textSecondary}; text-decoration: none; margin-right: 16px;"
                >
                  Privacy
                </a>
                <a
                  href="${emailBrand.siteUrl}/terms"
                  style="color: ${emailBrand.colors.textSecondary}; text-decoration: none;"
                >
                  Terms
                </a>
              </p>

              <p
                style="
                  margin: 18px 0 0;
                  font-size: 12px;
                  line-height: 1.6;
                  color: ${emailBrand.colors.footerMuted};
                "
              >
                © ${year} Home Tech Vault
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `.trim();
}
