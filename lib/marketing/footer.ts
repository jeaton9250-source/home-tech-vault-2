import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { SEO_LANDING_PAGES } from "@/lib/seo/landingPages";
import { CORE_INTERNAL_LINKS } from "@/lib/seo/internalLinks";

export type FooterLink = {
  label: string;
  href: string;
};

export const FOOTER_BRAND_DESCRIPTION =
  "Home Tech Vault remembers the details so you can enjoy your home.";

/** Product areas — descriptive anchors from the core link registry. */
export const FOOTER_PRODUCT_LINKS: FooterLink[] =
  CORE_INTERNAL_LINKS.map((link) => ({
    label: link.label,
    href: link.href,
  }));

export const FOOTER_SUPPORT_LINKS: FooterLink[] = [
  {
    label: "Knowledge Center",
    href: "/knowledge",
  },
  {
    label: "Brand Guides",
    href: "/guides",
  },
  {
    label: "Compare",
    href: "/compare",
  },
  {
    label: "Help Center",
    href: MARKETING_ROUTES.faq,
  },
  {
    label: "Contact",
    href: MARKETING_ROUTES.contact,
  },
];

export const FOOTER_LEGAL_LINKS: FooterLink[] = [
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

/** SEO landing pages — keep labels short for the footer column. */
export const FOOTER_GUIDE_LINKS: FooterLink[] =
  Object.values(SEO_LANDING_PAGES).map((page) => ({
    label: page.navLabel,
    href: page.path,
  }));

export const FOOTER_COPYRIGHT =
  "© 2026 Home Tech Vault. All rights reserved.";
