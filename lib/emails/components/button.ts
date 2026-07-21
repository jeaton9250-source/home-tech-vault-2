import { emailBrand } from "@/lib/emails/brand";
import { escapeHtml } from "@/lib/emails/utils";

type EmailButtonProps = {
  href: string;
  label: string;
};

export function renderEmailButton({
  href,
  label,
}: EmailButtonProps) {
  const safeLabel = escapeHtml(label);
  const safeHref = escapeHtml(href);

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 32px auto 0;">
      <tr>
        <td align="center">
          <a
            href="${safeHref}"
            class="email-button-link email-button"
            style="
              display: inline-block;
              min-width: 220px;
              padding: 16px 28px;
              background-color: ${emailBrand.colors.button};
              color: ${emailBrand.colors.buttonText};
              font-size: 15px;
              font-weight: 600;
              line-height: 1;
              text-align: center;
              text-decoration: none;
              border-radius: ${emailBrand.radius};
            "
          >
            ${safeLabel}
          </a>
        </td>
      </tr>
    </table>
  `.trim();
}
