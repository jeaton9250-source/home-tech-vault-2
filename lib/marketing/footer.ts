import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { siteConfig } from "@/lib/marketing/site";
import { SUPPORT_EMAIL } from "@/lib/marketing/trust";

export type FooterLink =
  | {
      label: string;
      href: string;
      external?: boolean;
    }
  | {
      label: string;
      comingSoon: true;
    };

export type FooterSocialLink =
  | {
      label: string;
      href: string;
      external: true;
    }
  | {
      label: string;
      comingSoon: true;
    };

export const FOOTER_BRAND_DESCRIPTION =
  "One secure place to organize your household devices, warranties, documents, and subscriptions.";

export const FOOTER_PRODUCT_LINKS: FooterLink[] =
  [
    {
      label: "Features",
      href: MARKETING_ROUTES.features,
    },
    {
      label: "Demo",
      href: MARKETING_ROUTES.demo,
    },
    {
      label: "Roadmap",
      comingSoon: true,
    },
    {
      label: "Changelog",
      comingSoon: true,
    },
    {
      label: "Pricing",
      href: MARKETING_ROUTES.pricing,
    },
  ];

export const FOOTER_RESOURCE_LINKS: FooterLink[] =
  [
    {
      label: "Help Center",
      href: MARKETING_ROUTES.faq,
    },
    {
      label: "Video Walkthrough",
      href: MARKETING_ROUTES.demo,
    },
    {
      label: "Contact Support",
      href: MARKETING_ROUTES.contact,
    },
    {
      label: "Blog",
      comingSoon: true,
    },
  ];

export const FOOTER_COMPANY_LINKS: FooterLink[] =
  [
    {
      label: "About",
      href: MARKETING_ROUTES.home,
    },
    {
      label: "Founder Story",
      href: MARKETING_ROUTES.contact,
    },
    {
      label: "Contact",
      href: `mailto:${SUPPORT_EMAIL}`,
    },
    {
      label: "Press Kit",
      comingSoon: true,
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
      label: "Cookie Policy",
      comingSoon: true,
    },
    {
      label: "Trust Center",
      href: MARKETING_ROUTES.trust,
    },
    {
      label: "Security",
      href: MARKETING_ROUTES.trust,
    },
  ];

export const FOOTER_SOCIAL_LINKS: FooterSocialLink[] =
  [
    {
      label: "X (Twitter)",
      href: `https://x.com/${siteConfig.twitterHandle.replace("@", "")}`,
      external: true,
    },
    {
      label: "LinkedIn",
      comingSoon: true,
    },
  ];

export const FOOTER_BOTTOM_LINKS = [
  {
    label: "Status",
    comingSoon: true as const,
  },
  {
    label: "Privacy",
    href: MARKETING_ROUTES.privacy,
  },
  {
    label: "Terms",
    href: MARKETING_ROUTES.terms,
  },
  {
    label: "Contact",
    href: MARKETING_ROUTES.contact,
  },
] as const;
