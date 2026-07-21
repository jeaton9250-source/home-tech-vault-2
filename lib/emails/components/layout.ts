import { emailBrand } from "@/lib/emails/brand";
import { emailStyles } from "@/lib/emails/utils";
import { renderEmailFooter } from "@/lib/emails/components/footer";
import { renderEmailHeader } from "@/lib/emails/components/header";

type RenderAuthEmailLayoutInput = {
  preheader: string;
  overline?: string;
  headline: string;
  subheading?: string;
  body: string;
};

export function renderAuthEmailLayout({
  preheader,
  overline,
  headline,
  subheading,
  body,
}: RenderAuthEmailLayoutInput) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>${headline}</title>
    <style>${emailStyles()}</style>
  </head>
  <body>
    <div
      style="
        display: none;
        max-height: 0;
        overflow: hidden;
        opacity: 0;
        mso-hide: all;
      "
      aria-hidden="true"
    >
      ${preheader}
    </div>

    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      class="email-bg"
      style="
        width: 100%;
        background-color: ${emailBrand.colors.background};
        padding: 32px 16px;
      "
    >
      <tr>
        <td align="center" class="email-shell" style="padding: 32px 16px;">
          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="width: 100%; max-width: ${emailBrand.maxWidth};"
          >
            ${renderEmailHeader({
              overline,
              headline,
              subheading,
            })}

            <tr>
              <td>${body}</td>
            </tr>

            ${renderEmailFooter()}
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
