import { MARKETING_ROUTES } from "@/lib/marketing/routes";

export const LANDING_SECTION_IDS = {
  features: "features",
  howItWorks: "how-it-works",
  trust: "trust",
  support: "support",
} as const;

export type LandingSectionId =
  (typeof LANDING_SECTION_IDS)[keyof typeof LANDING_SECTION_IDS];

export const LANDING_NAV_LINKS = [
  {
    label: "Features",
    sectionId: LANDING_SECTION_IDS.features,
  },
  {
    label: "How It Works",
    sectionId: LANDING_SECTION_IDS.howItWorks,
  },
  {
    label: "Trust",
    sectionId: LANDING_SECTION_IDS.trust,
  },
  {
    label: "Support",
    sectionId: LANDING_SECTION_IDS.support,
  },
] as const;

export const LANDING_ANNOUNCEMENT =
  "Trusted by homeowners to organize and protect their home technology.";

export function landingSectionHref(
  sectionId: LandingSectionId
) {
  return `${MARKETING_ROUTES.home}#${sectionId}`;
}

export const LANDING_SUPPORT_QUESTIONS = [
  {
    question:
      "Do I need an account to explore Home Tech Vault?",
    answer:
      "No. Open the interactive demo to browse a sample vault. Create a free account when you are ready to save your own records.",
    href: MARKETING_ROUTES.demo,
    linkLabel: "Open the demo",
  },
  {
    question: "How many devices can I track?",
    answer:
      "Free includes a starter device limit. Paid plans expand capacity for larger households.",
    href: MARKETING_ROUTES.faq,
    linkLabel: "View plan details",
  },
  {
    question: "Can I share with household members?",
    answer:
      "Family plans let you invite viewers, members, or admins so everyone works from the same trusted record.",
    href: MARKETING_ROUTES.faq,
    linkLabel: "Learn about sharing",
  },
] as const;
