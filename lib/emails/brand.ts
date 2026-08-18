export const emailBrand = {
  name: "Home Tech Vault",
  tagline: "Organize. Protect. Simplify.",
  overline: "HOME TECH VAULT",
  siteUrl: "https://www.hometechvault.com",
  supportEmail: "support@hometechvault.com",
  logoUrl:
    "https://www.hometechvault.com/brand/logo.svg",
  colors: {
    background: "#FAF9F7",
    card: "#FDFCFA",
    border: "#E7E2DA",
    textPrimary: "#1C1917",
    textSecondary: "#78716C",
    button: "#1C1917",
    buttonText: "#FFFFFF",
    divider: "#E7E2DA",
    footerMuted: "#A8A29E",
  },
  radius: "16px",
  maxWidth: "600px",
  fontFamily:
    "'Geist Sans', Arial, Helvetica, sans-serif",
} as const;

export type EmailBrand = typeof emailBrand;
