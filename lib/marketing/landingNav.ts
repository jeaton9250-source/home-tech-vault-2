import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import { LANDING_PUBLIC_SECTION_IDS } from "@/lib/marketing/landingPublicContent";

export const LANDING_SECTION_IDS = {
  ...LANDING_PUBLIC_SECTION_IDS,
  /** @deprecated Legacy landing section aliases */
  forHomes: LANDING_PUBLIC_SECTION_IDS.digitalBinder,
  smartConnector: LANDING_PUBLIC_SECTION_IDS.digitalBinder,
  yourHome: LANDING_PUBLIC_SECTION_IDS.features,
  memories: LANDING_PUBLIC_SECTION_IDS.features,
  vault: LANDING_PUBLIC_SECTION_IDS.features,
  homePulse: LANDING_PUBLIC_SECTION_IDS.features,
} as const;

export type LandingSectionId =
  (typeof LANDING_SECTION_IDS)[keyof typeof LANDING_SECTION_IDS];

export const LANDING_NAV_LINKS = [
  {
    label: "How It Works",
    sectionId: LANDING_SECTION_IDS.howItWorks,
  },
  {
    label: "Features",
    sectionId: LANDING_SECTION_IDS.features,
  },
  {
    label: "Pricing",
    sectionId: LANDING_SECTION_IDS.pricing,
  },
] as const;

export const LANDING_ANNOUNCEMENT =
  "Organize your home's technology in one secure place.";

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
      "No. Tap Explore Demo to walk through a sample home. Create a free account when you're ready to start organizing yours.",
    href: MARKETING_ROUTES.demo,
    linkLabel: "Explore the demo",
  },
  {
    question: "What does the Smart Connector do?",
    answer:
      "It is an optional desktop helper that can discover devices on your home network. It is not required to start organizing your home records.",
    href: MARKETING_ROUTES.demo,
    linkLabel: "See it in the demo",
  },
  {
    question: "Can I share with household members?",
    answer:
      "Yes. The Family plan lets you invite household members with viewer, member, or admin roles.",
    href: MARKETING_ROUTES.faq,
    linkLabel: "Learn about sharing",
  },
] as const;

export { LANDING_PUBLIC_SECTION_IDS };
