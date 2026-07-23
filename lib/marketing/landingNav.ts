import { MARKETING_ROUTES } from "@/lib/marketing/routes";

export const LANDING_SECTION_IDS = {
  smartConnector: "smart-connector",
  howItWorks: "how-it-works",
  monitoring: "monitoring",
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
    label: "Monitoring",
    sectionId: LANDING_SECTION_IDS.monitoring,
  },
  {
    label: "Pricing",
    sectionId: LANDING_SECTION_IDS.pricing,
  },
] as const;

export const LANDING_ANNOUNCEMENT =
  "Discover, organize, and monitor your home technology automatically.";

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
      "No. Open the interactive demo to browse a sample vault. Create a free account when you are ready to scan your own home.",
    href: MARKETING_ROUTES.demo,
    linkLabel: "Open the demo",
  },
  {
    question: "What does the Smart Connector do?",
    answer:
      "The connector passively scans your local network to discover devices, then syncs observations to your vault for matching and monitoring.",
    href: MARKETING_ROUTES.demo,
    linkLabel: "See it in the demo",
  },
  {
    question: "Can I share with household members?",
    answer:
      "Family plans let you invite viewers, members, or admins so everyone works from the same trusted record.",
    href: MARKETING_ROUTES.faq,
    linkLabel: "Learn about sharing",
  },
] as const;
