import { emailBrand } from "@/lib/emails/brand";

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function emailStyles() {
  const { colors, fontFamily } = emailBrand;

  return `
    :root {
      color-scheme: light dark;
    }

    body {
      margin: 0;
      padding: 0;
      background-color: ${colors.background};
      font-family: ${fontFamily};
      color: ${colors.textPrimary};
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .email-bg {
      background-color: ${colors.background};
    }

    .email-card {
      background-color: ${colors.card};
      border: 1px solid ${colors.border};
      border-radius: ${emailBrand.radius};
    }

    .email-text-primary {
      color: ${colors.textPrimary};
    }

    .email-text-secondary {
      color: ${colors.textSecondary};
    }

    .email-button {
      background-color: ${colors.button};
      color: ${colors.buttonText};
      border-radius: ${emailBrand.radius};
      transition: opacity 0.2s ease, transform 0.2s ease;
    }

    .email-button:hover {
      opacity: 0.92;
    }

    @media (prefers-color-scheme: dark) {
      body,
      .email-bg {
        background-color: #141312 !important;
      }

      .email-card {
        background-color: #1C1917 !important;
        border-color: #3F3A36 !important;
      }

      .email-text-primary {
        color: #FAFAF9 !important;
      }

      .email-text-secondary {
        color: #A8A29E !important;
      }

      .email-button {
        background-color: #FAFAF9 !important;
        color: #1C1917 !important;
      }
    }

    @media only screen and (max-width: 620px) {
      .email-shell {
        padding: 20px 12px !important;
      }

      .email-card-cell {
        padding: 28px 22px !important;
      }

      .email-headline {
        font-size: 28px !important;
        line-height: 1.15 !important;
      }

      .email-button-link {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
        text-align: center !important;
      }
    }
  `.trim();
}
