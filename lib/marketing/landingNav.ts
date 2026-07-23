import { MARKETING_ROUTES } from "@/lib/marketing/routes";

export const LANDING_SECTION_IDS = {
  smartConnector: "smart-connector",
  howItWorks: "how-it-works",
  homePulse: "home-pulse",
  vault: "vault",
  pricing: "pricing",
} as const;

export type LandingSectionId =
  (typeof LANDING_SECTION_IDS)[keyof typeof LANDING_SECTION_IDS];

export const LANDING_NAV_LINKS = [
  {
    label: "Smart Connector",
    sectionId: LANDING_SECTION_IDS.smartConnector,
  },
  {
    label: "How It Works",
    sectionId: LANDING_SECTION_IDS.howItWorks,
  },
  {
    label: "Home Pulse",
    sectionId: LANDING_SECTION_IDS.homePulse,
  },
  {
    label: "Your Vault",
    sectionId: LANDING_SECTION_IDS.vault,
  },
  {
    label: "Pricing",
    sectionId: LANDING_SECTION_IDS.pricing,
  },
] as const;

export const LANDING_ANNOUNCEMENT =
  "Your home's digital memory — Home Tech Vault remembers the details so you can enjoy your home.";

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
      "No. Open the interactive demo to browse a sample vault. Create a free account when you are ready to start remembering your home.",
    href: MARKETING_ROUTES.demo,
    linkLabel: "Open the demo",
  },
  {
    question: "What does the Smart Connector do?",
    answer:
      "It quietly watches over your home's technology — discovering devices, keeping network details up to date, and helping Home Tech Vault remember what matters.",
    href: MARKETING_ROUTES.demo,
    linkLabel: "See it in the demo",
  },
  {
    question: "Can I share with household members?",
    answer:
      "Family plans let everyone who helps care for your home work from the same trusted memory — viewers, members, or admins.",
    href: MARKETING_ROUTES.faq,
    linkLabel: "Learn about sharing",
  },
] as const;
