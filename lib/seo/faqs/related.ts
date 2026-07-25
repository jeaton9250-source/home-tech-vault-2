/**
 * Shared related-link presets for SEO FAQ pages.
 * Points at Knowledge Center, brand guides, comparisons, and landing pages.
 */

export type SeoFaqRelatedLink = {
  href: string;
  label: string;
  description: string;
};

const L = {
  warrantyTracker: {
    href: "/warranty-tracker",
    label: "Warranty tracker",
    description:
      "See how coverage dates and proof live next to each device.",
  },
  deviceInventory: {
    href: "/device-inventory",
    label: "Device inventory",
    description: "Build a living list of the technology in your home.",
  },
  documentOrganizer: {
    href: "/home-document-organizer",
    label: "Document organizer",
    description: "Keep receipts and manuals attached to the right records.",
  },
  networkDocs: {
    href: "/network-documentation",
    label: "Network documentation",
    description: "Document routers, Wi-Fi notes, and ISP details.",
  },
  smartHome: {
    href: "/smart-home-organizer",
    label: "Smart home organizer",
    description: "Inventory hubs, sensors, and connected gear.",
  },
  digitalVault: {
    href: "/digital-home-vault",
    label: "Digital home vault",
    description: "One place for household tech records and proof.",
  },
  homeInventory: {
    href: "/home-inventory-software",
    label: "Home inventory software",
    description: "Overview of Home Tech Vault for household inventories.",
  },
  trust: {
    href: "/trust",
    label: "Trust Center",
    description: "How Home Tech Vault approaches security and privacy.",
  },
  pricing: {
    href: "/pricing",
    label: "Pricing",
    description: "Compare Free, Pro, and Family plans.",
  },
  features: {
    href: "/features",
    label: "Features",
    description: "See what Home Tech Vault includes.",
  },
  familySharing: {
    href: "/knowledge/security/household-access-without-oversharing",
    label: "Household access without oversharing",
    description: "Roles and boundaries for shared home tech records.",
  },
  warrantyHabits: {
    href: "/knowledge/warranties/warranty-tracker-habits-that-stick",
    label: "Warranty tracker habits",
    description: "Practical habits for capturing coverage that lasts.",
  },
  proofOfPurchase: {
    href: "/knowledge/warranties/proof-of-purchase-for-electronics",
    label: "Proof of purchase for electronics",
    description: "Store receipts so claims do not depend on inbox search.",
  },
  inventoryGuide: {
    href: "/knowledge/devices/how-to-inventory-every-device-in-your-home",
    label: "How to inventory every device",
    description: "A practical system for listing household electronics.",
  },
  serials: {
    href: "/knowledge/devices/serial-numbers-and-why-they-matter",
    label: "Serial numbers and why they matter",
    description: "Where to find serials and how to store them safely.",
  },
  networkGuide: {
    href: "/knowledge/networking/documenting-your-home-network",
    label: "Documenting your home network",
    description: "Build network notes you can use during an outage.",
  },
  wifiGuide: {
    href: "/knowledge/networking/wifi-network-names-passwords-and-guests",
    label: "Wi-Fi names, passwords, and guests",
    description: "Organize SSID context without texting secrets forever.",
  },
  routerPasswordsGuide: {
    href: "/guides/how-to-store-router-passwords",
    label: "How to store router passwords",
    description: "Split secrets and household network context cleanly.",
  },
  smartHomeKnowledge: {
    href: "/knowledge/smart-home/organizing-smart-home-devices",
    label: "Organizing smart home devices",
    description: "Inventory above vendor apps for hubs and endpoints.",
  },
  smartHomeGuide: {
    href: "/guides/how-to-organize-smart-home-devices",
    label: "How to organize smart home devices",
    description: "Brand-agnostic habits for connected homes.",
  },
  insuranceDocs: {
    href: "/knowledge/security/insurance-ready-electronics-documentation",
    label: "Insurance-ready electronics documentation",
    description: "Photos, serials, and receipts before you need a claim.",
  },
  privateRecords: {
    href: "/knowledge/security/private-records-for-home-technology",
    label: "Private records for home technology",
    description: "What belongs in a vault versus a password manager.",
  },
  unbox: {
    href: "/knowledge/devices/what-to-record-when-you-unbox-a-device",
    label: "What to record when you unbox",
    description: "Capture serials and receipts while everything is handy.",
  },
  maintenance: {
    href: "/knowledge/maintenance/seasonal-home-tech-maintenance",
    label: "Seasonal home tech maintenance",
    description: "Light checkups that prevent seasonal surprises.",
  },
  vsSheets: {
    href: "/compare/home-tech-vault-vs-google-sheets",
    label: "Home Tech Vault vs Google Sheets",
    description: "When a sheet is enough — and when a vault fits better.",
  },
  vsNotion: {
    href: "/compare/home-tech-vault-vs-notion",
    label: "Home Tech Vault vs Notion",
    description: "Flexible workspace versus purpose-built home tech records.",
  },
  bestInventory: {
    href: "/compare/best-home-inventory-software",
    label: "Best home inventory software",
    description: "Objective criteria for choosing an inventory approach.",
  },
  bestWarranty: {
    href: "/compare/best-warranty-tracker",
    label: "Best warranty tracker",
    description: "Compare approaches that keep dates and proof together.",
  },
  demo: {
    href: "/demo",
    label: "Interactive demo",
    description: "Explore a sample vault without creating an account.",
  },
  signup: {
    href: "/signup",
    label: "Create a free account",
    description: "Start your household inventory on the Free plan.",
  },
} as const satisfies Record<string, SeoFaqRelatedLink>;

export const FAQ_RELATED = L;

export function related(
  ...keys: Array<keyof typeof L>
): SeoFaqRelatedLink[] {
  return keys.map((key) => L[key]);
}
