import type { BrandCategory, SeoBrand } from "@/lib/seo/programmatic/brands";

export type GuideIntentId =
  | "organize-devices"
  | "organize-product"
  | "track-warranties"
  | "store-router-passwords"
  | "organize-smart-home"
  | "document-serials"
  | "insurance-ready";

export type GuideIntent = {
  id: GuideIntentId;
  /** Hub grouping label */
  group: string;
  /** Which brand categories this intent applies to (empty = all brands) */
  brandCategories?: BrandCategory[];
  /** Prefer brands that include this product keyword (case-insensitive) */
  productMatch?: string;
  /** When true, also emit a brand-agnostic topic page */
  includeTopicPage?: boolean;
  topicSlug?: string;
  topicTitle?: string;
  topicDescription?: string;
};

export const GUIDE_INTENTS: GuideIntent[] = [
  {
    id: "organize-devices",
    group: "Organization",
  },
  {
    id: "organize-product",
    group: "Organization",
    productMatch: "TV",
    brandCategories: ["tv", "streaming"],
  },
  {
    id: "organize-product",
    group: "Organization",
    productMatch: "router",
    brandCategories: ["networking"],
  },
  {
    id: "organize-product",
    group: "Organization",
    productMatch: "printer",
    brandCategories: ["printing"],
  },
  {
    id: "organize-product",
    group: "Organization",
    productMatch: "console",
    brandCategories: ["gaming"],
  },
  {
    id: "track-warranties",
    group: "Warranties",
    includeTopicPage: true,
    topicSlug: "how-to-track-tv-warranties",
    topicTitle: "How to Track TV Warranties",
    topicDescription:
      "Capture panel coverage, purchase proof, and claim contacts for every television in the house before something fails.",
  },
  {
    id: "store-router-passwords",
    group: "Networking",
    brandCategories: ["networking"],
    includeTopicPage: true,
    topicSlug: "how-to-store-router-passwords",
    topicTitle: "How to Store Router Passwords",
    topicDescription:
      "Keep admin and Wi-Fi credentials available to the household without texting secrets forever or hiding them in a junk drawer.",
  },
  {
    id: "organize-smart-home",
    group: "Smart Home",
    brandCategories: ["smart-home"],
    includeTopicPage: true,
    topicSlug: "how-to-organize-smart-home-devices",
    topicTitle: "How to Organize Smart Home Devices",
    topicDescription:
      "Build a household inventory above vendor apps so hubs, sensors, speakers, and cameras stay understandable.",
  },
  {
    id: "document-serials",
    group: "Records",
  },
  {
    id: "insurance-ready",
    group: "Insurance",
  },
];

export function brandMatchesIntent(
  brand: SeoBrand,
  intent: GuideIntent
): boolean {
  if (intent.brandCategories?.length) {
    const overlap = intent.brandCategories.some((category) =>
      brand.categories.includes(category)
    );
    if (!overlap) {
      return false;
    }
  }

  if (intent.productMatch) {
    const needle = intent.productMatch.toLowerCase();
    const hit = brand.products.some((product) =>
      product.toLowerCase().includes(needle)
    );
    // gaming consoles: Xbox/PlayStation products may not say "console"
    if (!hit && needle === "console") {
      return brand.categories.includes("gaming");
    }
    // routers: match router/mesh/Orbi/Deco/Dream Machine
    if (!hit && needle === "router") {
      return brand.categories.includes("networking");
    }
    // printers
    if (!hit && needle === "printer") {
      return brand.categories.includes("printing");
    }
    // TVs
    if (!hit && needle === "tv") {
      return (
        brand.categories.includes("tv") ||
        brand.categories.includes("streaming")
      );
    }
    return hit;
  }

  return true;
}

export function primaryProductForIntent(
  brand: SeoBrand,
  intent: GuideIntent
): string | null {
  if (intent.id !== "organize-product" || !intent.productMatch) {
    return null;
  }

  const needle = intent.productMatch.toLowerCase();
  const match = brand.products.find((product) =>
    product.toLowerCase().includes(needle)
  );

  if (match) {
    return match;
  }

  if (needle === "console") {
    return brand.products[0] ?? `${brand.name} console`;
  }

  if (needle === "router") {
    return (
      brand.products.find((product) =>
        /router|orbi|deco|dream|mesh|nighthawk/i.test(product)
      ) ?? `${brand.name} router`
    );
  }

  if (needle === "printer") {
    return (
      brand.products.find((product) =>
        /printer|pixma|ecotank|laser/i.test(product)
      ) ?? `${brand.name} printer`
    );
  }

  if (needle === "tv") {
    return (
      brand.products.find((product) =>
        /tv|bravia|fire tv|roku tv/i.test(product)
      ) ?? `${brand.name} TV`
    );
  }

  return brand.products[0] ?? null;
}
