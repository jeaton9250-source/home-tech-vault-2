import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import {
  LANDING_SUPPORTING_MESSAGE,
  LANDING_TAGLINE,
} from "@/lib/marketing/landingContent";

export const LANDING_SECTION_IDS = {
  forHomes: "for-homes",
  smartConnector: "smart-connector",
  yourHome: "your-home",
  memories: "memories",
  vault: "vault",
  pricing: "pricing",
} as const;

export type LandingSectionId =
  (typeof LANDING_SECTION_IDS)[keyof typeof LANDING_SECTION_IDS];

export const LANDING_NAV_LINKS = [
  {
    label: "For Your Home",
    sectionId: LANDING_SECTION_IDS.forHomes,
  },
  {
    label: "Smart Connector",
    sectionId: LANDING_SECTION_IDS.smartConnector,
  },
  {
    label: "Your Home",
    sectionId: LANDING_SECTION_IDS.yourHome,
  },
  {
    label: "Pricing",
    sectionId: LANDING_SECTION_IDS.pricing,
  },
] as const;

export const LANDING_ANNOUNCEMENT = `${LANDING_TAGLINE} — ${LANDING_SUPPORTING_MESSAGE}`;

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
      "No. Tap Explore Demo to walk through a sample home. Create a free account when you're ready to start remembering yours.",
    href: MARKETING_ROUTES.demo,
    linkLabel: "Explore the demo",
  },
  {
    question: "What does the Smart Connector do?",
    answer:
      "Install it once and it quietly helps keep your home's technology up to date — discovering devices and syncing what matters to your vault.",
    href: MARKETING_ROUTES.demo,
    linkLabel: "See it in the demo",
  },
  {
    question: "Can I share with household members?",
    answer:
      "Family plans let everyone who helps care for your home share the same trusted memory — with roles and permissions that fit your household.",
    href: MARKETING_ROUTES.faq,
    linkLabel: "Learn about sharing",
  },
] as const;
