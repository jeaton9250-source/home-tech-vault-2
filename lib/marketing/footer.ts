import { MARKETING_ROUTES } from "@/lib/marketing/routes";

export type FooterLink = {
  label: string;
  href: string;
};

export const FOOTER_BRAND_DESCRIPTION =
  "The secure home for your devices, warranties, documents, and household technology.";

export const FOOTER_SUPPORT_LINKS: FooterLink[] =
  [
    {
      label: "Help Center",
      href: MARKETING_ROUTES.faq,
    },
    {
      label: "Contact",
      href: MARKETING_ROUTES.contact,
    },
  ];

export const FOOTER_LEGAL_LINKS: FooterLink[] =
  [
    {
      label: "Privacy Policy",
      href: MARKETING_ROUTES.privacy,
    },
    {
      label: "Terms of Service",
      href: MARKETING_ROUTES.terms,
    },
    {
      label: "Trust Center",
      href: MARKETING_ROUTES.trust,
    },
  ];

export const FOOTER_COPYRIGHT =
  "© 2026 Home Tech Vault. All rights reserved.";
