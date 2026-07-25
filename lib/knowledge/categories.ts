export const KNOWLEDGE_CATEGORIES = [
  {
    slug: "devices",
    name: "Devices",
    description:
      "Inventory, labeling, and record-keeping for the electronics that run your home.",
  },
  {
    slug: "networking",
    name: "Networking",
    description:
      "Router notes, Wi-Fi details, and documentation that makes outages less painful.",
  },
  {
    slug: "smart-home",
    name: "Smart Home",
    description:
      "Hubs, sensors, speakers, and connected gear — organized without another control app.",
  },
  {
    slug: "security",
    name: "Security",
    description:
      "Private records, safe sharing, and insurance-ready documentation habits.",
  },
  {
    slug: "warranties",
    name: "Warranties",
    description:
      "Coverage dates, proof of purchase, and claim-ready paperwork for home devices.",
  },
  {
    slug: "maintenance",
    name: "Maintenance",
    description:
      "Care schedules, firmware habits, and seasonal checkups for household technology.",
  },
  {
    slug: "buying-guides",
    name: "Buying Guides",
    description:
      "What to capture before and after you buy — so new gear joins a real system.",
  },
] as const;

export type KnowledgeCategorySlug =
  (typeof KNOWLEDGE_CATEGORIES)[number]["slug"];

export function getKnowledgeCategory(
  slug: string
) {
  return (
    KNOWLEDGE_CATEGORIES.find(
      (category) => category.slug === slug
    ) ?? null
  );
}

export function knowledgeCategoryPath(
  slug: KnowledgeCategorySlug
) {
  return `/knowledge/${slug}`;
}

export function knowledgeArticlePath(
  category: KnowledgeCategorySlug,
  slug: string
) {
  return `/knowledge/${category}/${slug}`;
}
