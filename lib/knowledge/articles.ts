import type { KnowledgeCategorySlug } from "@/lib/knowledge/categories";
import { KNOWLEDGE_CATALOG } from "@/lib/knowledge/catalog";
import type { KnowledgeArticle } from "@/lib/knowledge/types";
import { countArticleWords } from "@/lib/knowledge/types";

type ArticleModule = {
  default: KnowledgeArticle;
};

const articleLoaders: Record<
  string,
  () => Promise<ArticleModule>
> = {
  "how-to-inventory-every-device-in-your-home": () =>
    import(
      "@/content/knowledge/devices/how-to-inventory-every-device-in-your-home"
    ),
  "serial-numbers-and-why-they-matter": () =>
    import(
      "@/content/knowledge/devices/serial-numbers-and-why-they-matter"
    ),
  "room-by-room-device-audit": () =>
    import(
      "@/content/knowledge/devices/room-by-room-device-audit"
    ),
  "labeling-electronics-without-clutter": () =>
    import(
      "@/content/knowledge/devices/labeling-electronics-without-clutter"
    ),
  "tracking-laptops-phones-and-tablets": () =>
    import(
      "@/content/knowledge/devices/tracking-laptops-phones-and-tablets"
    ),
  "appliance-records-beyond-the-kitchen": () =>
    import(
      "@/content/knowledge/devices/appliance-records-beyond-the-kitchen"
    ),
  "what-to-record-when-you-unbox-a-device": () =>
    import(
      "@/content/knowledge/devices/what-to-record-when-you-unbox-a-device"
    ),
  "what-home-technology-information-should-you-keep": () =>
    import(
      "@/content/knowledge/devices/what-home-technology-information-should-you-keep"
    ),
  "documenting-your-home-network": () =>
    import(
      "@/content/knowledge/networking/documenting-your-home-network"
    ),
  "router-admin-notes-worth-keeping": () =>
    import(
      "@/content/knowledge/networking/router-admin-notes-worth-keeping"
    ),
  "wifi-network-names-passwords-and-guests": () =>
    import(
      "@/content/knowledge/networking/wifi-network-names-passwords-and-guests"
    ),
  "mapping-access-points-and-mesh-nodes": () =>
    import(
      "@/content/knowledge/networking/mapping-access-points-and-mesh-nodes"
    ),
  "isp-account-details-for-outages": () =>
    import(
      "@/content/knowledge/networking/isp-account-details-for-outages"
    ),
  "ethernet-ports-and-wired-device-notes": () =>
    import(
      "@/content/knowledge/networking/ethernet-ports-and-wired-device-notes"
    ),
  "network-equipment-replacement-checklist": () =>
    import(
      "@/content/knowledge/networking/network-equipment-replacement-checklist"
    ),
  "organizing-smart-home-devices": () =>
    import(
      "@/content/knowledge/smart-home/organizing-smart-home-devices"
    ),
  "hubs-bridges-and-controllers-inventory": () =>
    import(
      "@/content/knowledge/smart-home/hubs-bridges-and-controllers-inventory"
    ),
  "smart-lights-switches-and-scenes-records": () =>
    import(
      "@/content/knowledge/smart-home/smart-lights-switches-and-scenes-records"
    ),
  "voice-assistants-and-speaker-notes": () =>
    import(
      "@/content/knowledge/smart-home/voice-assistants-and-speaker-notes"
    ),
  "sensors-cameras-and-automation-gear": () =>
    import(
      "@/content/knowledge/smart-home/sensors-cameras-and-automation-gear"
    ),
  "smart-thermostats-and-climate-devices": () =>
    import(
      "@/content/knowledge/smart-home/smart-thermostats-and-climate-devices"
    ),
  "when-smart-devices-need-manual-backups": () =>
    import(
      "@/content/knowledge/smart-home/when-smart-devices-need-manual-backups"
    ),
  "private-records-for-home-technology": () =>
    import(
      "@/content/knowledge/security/private-records-for-home-technology"
    ),
  "safe-sharing-of-device-details": () =>
    import(
      "@/content/knowledge/security/safe-sharing-of-device-details"
    ),
  "insurance-ready-electronics-documentation": () =>
    import(
      "@/content/knowledge/security/insurance-ready-electronics-documentation"
    ),
  "what-to-store-before-you-travel": () =>
    import(
      "@/content/knowledge/security/what-to-store-before-you-travel"
    ),
  "household-access-without-oversharing": () =>
    import(
      "@/content/knowledge/security/household-access-without-oversharing"
    ),
  "documenting-security-cameras-and-alarms": () =>
    import(
      "@/content/knowledge/security/documenting-security-cameras-and-alarms"
    ),
  "preparing-tech-records-for-emergencies": () =>
    import(
      "@/content/knowledge/security/preparing-tech-records-for-emergencies"
    ),
  "warranty-tracker-habits-that-stick": () =>
    import(
      "@/content/knowledge/warranties/warranty-tracker-habits-that-stick"
    ),
  "proof-of-purchase-for-electronics": () =>
    import(
      "@/content/knowledge/warranties/proof-of-purchase-for-electronics"
    ),
  "extended-warranties-worth-documenting": () =>
    import(
      "@/content/knowledge/warranties/extended-warranties-worth-documenting"
    ),
  "manufacturer-vs-retailer-coverage": () =>
    import(
      "@/content/knowledge/warranties/manufacturer-vs-retailer-coverage"
    ),
  "filing-claims-with-organized-records": () =>
    import(
      "@/content/knowledge/warranties/filing-claims-with-organized-records"
    ),
  "expiration-alerts-and-renewal-notes": () =>
    import(
      "@/content/knowledge/warranties/expiration-alerts-and-renewal-notes"
    ),
  "warranties-for-gifted-and-used-devices": () =>
    import(
      "@/content/knowledge/warranties/warranties-for-gifted-and-used-devices"
    ),
  "seasonal-home-tech-maintenance": () =>
    import(
      "@/content/knowledge/maintenance/seasonal-home-tech-maintenance"
    ),
  "firmware-update-habits-for-households": () =>
    import(
      "@/content/knowledge/maintenance/firmware-update-habits-for-households"
    ),
  "battery-replacement-schedules": () =>
    import(
      "@/content/knowledge/maintenance/battery-replacement-schedules"
    ),
  "cleaning-and-care-for-electronics": () =>
    import(
      "@/content/knowledge/maintenance/cleaning-and-care-for-electronics"
    ),
  "filter-and-vent-maintenance-for-tech": () =>
    import(
      "@/content/knowledge/maintenance/filter-and-vent-maintenance-for-tech"
    ),
  "when-to-retire-aging-devices": () =>
    import(
      "@/content/knowledge/maintenance/when-to-retire-aging-devices"
    ),
  "maintenance-logs-that-save-service-calls": () =>
    import(
      "@/content/knowledge/maintenance/maintenance-logs-that-save-service-calls"
    ),
  "what-to-capture-before-you-buy": () =>
    import(
      "@/content/knowledge/buying-guides/what-to-capture-before-you-buy"
    ),
  "comparing-devices-with-a-household-checklist": () =>
    import(
      "@/content/knowledge/buying-guides/comparing-devices-with-a-household-checklist"
    ),
  "after-you-buy-setup-documentation": () =>
    import(
      "@/content/knowledge/buying-guides/after-you-buy-setup-documentation"
    ),
  "gifts-and-returns-with-better-records": () =>
    import(
      "@/content/knowledge/buying-guides/gifts-and-returns-with-better-records"
    ),
  "choosing-devices-that-fit-your-network": () =>
    import(
      "@/content/knowledge/buying-guides/choosing-devices-that-fit-your-network"
    ),
  "used-and-refurbished-buying-checklist": () =>
    import(
      "@/content/knowledge/buying-guides/used-and-refurbished-buying-checklist"
    ),
  "buying-for-a-shared-household": () =>
    import(
      "@/content/knowledge/buying-guides/buying-for-a-shared-household"
    ),
  "upgrade-vs-repair-decision-guide": () =>
    import(
      "@/content/knowledge/buying-guides/upgrade-vs-repair-decision-guide"
    ),
};

export async function getKnowledgeArticle(
  slug: string
): Promise<KnowledgeArticle | null> {
  const loader = articleLoaders[slug];
  if (!loader) {
    return null;
  }

  const mod = await loader();
  return mod.default;
}

export async function getAllKnowledgeArticles(): Promise<
  KnowledgeArticle[]
> {
  const articles = await Promise.all(
    KNOWLEDGE_CATALOG.map(async (entry) => {
      const article = await getKnowledgeArticle(entry.slug);
      if (!article) {
        throw new Error(
          `Missing knowledge article module: ${entry.slug}`
        );
      }
      return article;
    })
  );

  return articles;
}

export async function getKnowledgeArticlesByCategory(
  category: KnowledgeCategorySlug
): Promise<KnowledgeArticle[]> {
  const all = await getAllKnowledgeArticles();
  return all.filter((article) => article.category === category);
}

export async function getRelatedKnowledgeArticles(
  article: KnowledgeArticle,
  limit = 3
): Promise<KnowledgeArticle[]> {
  const entry = KNOWLEDGE_CATALOG.find(
    (item) => item.slug === article.slug
  );
  const preferred = entry?.relatedSlugs ?? [];

  const related: KnowledgeArticle[] = [];

  for (const slug of preferred) {
    if (related.length >= limit) {
      break;
    }
    const item = await getKnowledgeArticle(slug);
    if (item && item.slug !== article.slug) {
      related.push(item);
    }
  }

  if (related.length < limit) {
    const sameCategory = await getKnowledgeArticlesByCategory(
      article.category
    );
    for (const item of sameCategory) {
      if (related.length >= limit) {
        break;
      }
      if (
        item.slug !== article.slug &&
        !related.some((r) => r.slug === item.slug)
      ) {
        related.push(item);
      }
    }
  }

  return related;
}

export function listKnowledgeStaticParams() {
  return KNOWLEDGE_CATALOG.map((entry) => ({
    category: entry.category,
    slug: entry.slug,
  }));
}

export function assertArticleWordCount(
  article: KnowledgeArticle,
  minimum = 2000
) {
  const words = countArticleWords(article);
  if (words < minimum) {
    throw new Error(
      `Article ${article.slug} has ${words} words (minimum ${minimum})`
    );
  }
  return words;
}
