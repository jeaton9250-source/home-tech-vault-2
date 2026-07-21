export const emailTheme = {
  colors: {
    background: "#FAF9F7",
    card: "#FDFCFA",
    border: "#E7E2DA",
    textPrimary: "#1C1917",
    textSecondary: "#44403C",
    textMuted: "#78716C",
    button: "#1C1917",
    buttonText: "#FDFCFA",
    premium: "#4A3561",
    homeHealth: "#1F5C45",
    warning: "#9A6B2F",
  },
  radius: "16px",
  maxWidth: "600px",
  fontFamily:
    "'Geist Sans', Arial, Helvetica, sans-serif",
  brand: {
    name: "Home Tech Vault",
    overline: "HOME TECH VAULT",
    tagline: "Organize. Protect. Simplify.",
    siteUrl: "https://hometechvault.com",
    logoUrl:
      "https://hometechvault.com/brand/logo.svg",
    supportEmail: "support@hometechvault.com",
    helloEmail: "hello@hometechvault.com",
  },
} as const;

export type EmailTheme = typeof emailTheme;
