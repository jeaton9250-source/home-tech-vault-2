import { MARKETING_ROUTES } from "@/lib/marketing/routes";
import type { BreadcrumbItem } from "@/components/seo/Breadcrumb";
import type { FeatureHighlight } from "@/components/seo/FeatureHighlights";
import type { RelatedArticle } from "@/components/seo/RelatedArticles";
import type { SeoFaqItem } from "@/components/seo/Faq";

export type SeoLandingScreenshot = {
  title: string;
  caption: string;
  /** Optional image under /public. When omitted, a placeholder is shown. */
  src?: string;
  alt?: string;
  /** Span the full screenshots row (good for wide product shots). */
  wide?: boolean;
};

export type SeoLandingBenefit = {
  title: string;
  description: string;
};

export type SeoLandingPageContent = {
  slug: string;
  path: string;
  /** Short label for breadcrumbs / nav */
  navLabel: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroPrimaryLabel: string;
  heroPrimaryHref: string;
  heroSecondaryLabel: string;
  heroSecondaryHref: string;
  benefitsTitle: string;
  benefits: SeoLandingBenefit[];
  screenshotsTitle: string;
  screenshots: SeoLandingScreenshot[];
  featuresTitle: string;
  featuresDescription: string;
  features: FeatureHighlight[];
  faqTitle: string;
  faqDescription: string;
  faqItems: SeoFaqItem[];
  relatedTitle: string;
  related: RelatedArticle[];
  ctaTitle: string;
  ctaDescription: string;
};

function related(
  entries: Array<{
    slug: string;
    title: string;
    description: string;
  }>
): RelatedArticle[] {
  return entries.map((entry) => ({
    href: `/${entry.slug}`,
    title: entry.title,
    description: entry.description,
  }));
}

export const SEO_LANDING_PAGES: Record<
  string,
  SeoLandingPageContent
> = {
  "device-inventory": {
    slug: "device-inventory",
    path: "/device-inventory",
    navLabel: "Device inventory",
    metaTitle: "Device Inventory for Your Home",
    metaDescription:
      "Build a clear device inventory for every laptop, TV, appliance, and gadget in your home. Track location, cost, and details in one place.",
    keywords: [
      "device inventory",
      "home device list",
      "electronics inventory",
      "track home devices",
    ],
    heroEyebrow: "Device inventory",
    heroTitle: "Know every device you own — without a spreadsheet.",
    heroDescription:
      "Home Tech Vault turns scattered receipts and memory into a living inventory of the technology in your home, room by room.",
    heroPrimaryLabel: "Start free inventory",
    heroPrimaryHref: MARKETING_ROUTES.signup,
    heroSecondaryLabel: "See how it works",
    heroSecondaryHref: MARKETING_ROUTES.demo,
    benefitsTitle: "Why households keep a device inventory",
    benefits: [
      {
        title: "Stop guessing what you own",
        description:
          "See brand, model, serial numbers, and where each device lives before you buy duplicates or file a claim.",
      },
      {
        title: "Ready when something breaks",
        description:
          "Pull up purchase details and linked documents in seconds instead of digging through email.",
      },
      {
        title: "Share the list with family",
        description:
          "Give household members the same inventory so anyone can help troubleshoot or replace a device.",
      },
    ],
    screenshotsTitle: "What your inventory looks like",
    screenshots: [
      {
        title: "Device directory",
        caption: "Searchable list of every device with room, category, and status.",
        src: "/seo/screenshots/device-directory.png",
        alt: "Home Tech Vault devices page with search, category filters, and device cards",
      },
      {
        title: "Device profile",
        caption: "One page for specs, photos, notes, and linked documents.",
        src: "/seo/screenshots/device-profile.png",
        alt: "Air Purifier device profile with specs, warranty status, and recent activity",
      },
      {
        title: "Quick add",
        caption: "Add a new device in a calm form built for real households.",
        src: "/seo/screenshots/quick-add.png",
        alt: "Quick Add menu with options for device, document, maintenance task, and subscription",
      },
    ],
    featuresTitle: "Inventory features that stay useful",
    featuresDescription:
      "Built for home technology — not warehouse barcode workflows.",
    features: [
      {
        title: "Room and category tags",
        description:
          "Group devices by where they live and what they are so search stays fast.",
      },
      {
        title: "Photos and serials",
        description:
          "Store the details insurance and support teams ask for.",
      },
      {
        title: "Linked documents",
        description:
          "Attach manuals and receipts to the exact device they belong to.",
      },
    ],
    faqTitle: "Device inventory FAQ",
    faqDescription: "Common questions about keeping a home device inventory.",
    faqItems: [
      {
        question: "What counts as a device in Home Tech Vault?",
        answer:
          "Anything you want on record — computers, TVs, routers, appliances, game consoles, smart speakers, and more.",
      },
      {
        question: "Can I start with only a few devices?",
        answer:
          "Yes. Add what matters most first, then grow the inventory as you go. Home plans include a starter device allowance.",
      },
      {
        question: "Is this different from a general home inventory app?",
        answer:
          "Yes. Home Tech Vault focuses on technology — serials, warranties, manuals, and network context — not furniture catalogs.",
      },
    ],
    relatedTitle: "Keep going",
    related: related([
      {
        slug: "warranty-tracker",
        title: "Warranty tracker",
        description: "Attach coverage dates to every device you inventory.",
      },
      {
        slug: "home-document-organizer",
        title: "Home document organizer",
        description: "Store manuals and receipts next to each device.",
      },
      {
        slug: "home-tech-checklist",
        title: "Home tech checklist",
        description: "A practical list for building your inventory room by room.",
      },
    ]),
    ctaTitle: "Start your home device inventory today",
    ctaDescription:
      "Create a free account and add your first devices in minutes.",
  },

  "home-tech-inventory": {
    slug: "home-tech-inventory",
    path: "/home-tech-inventory",
    navLabel: "Home tech inventory",
    metaTitle: "Home Tech Inventory Software",
    metaDescription:
      "Organize your home tech inventory — devices, accessories, and connected gear — in a vault designed for households, not enterprises.",
    keywords: [
      "home tech inventory",
      "home technology inventory",
      "tech inventory software",
      "household electronics tracker",
    ],
    heroEyebrow: "Home tech inventory",
    heroTitle: "A home tech inventory that matches how families actually live.",
    heroDescription:
      "From the living-room TV to the basement NAS, keep one calm record of the technology that runs your household.",
    heroPrimaryLabel: "Create free vault",
    heroPrimaryHref: MARKETING_ROUTES.signup,
    heroSecondaryLabel: "Explore features",
    heroSecondaryHref: MARKETING_ROUTES.features,
    benefitsTitle: "Built for home technology, not office IT",
    benefits: [
      {
        title: "Household language, not IT tickets",
        description:
          "Rooms, family roles, and everyday device names — without enterprise jargon.",
      },
      {
        title: "Technology plus context",
        description:
          "Inventory sits next to documents, warranties, and network notes so nothing lives alone.",
      },
      {
        title: "Scales with your setup",
        description:
          "Start small on Home, then expand capacity on Home Plus or Household as your home grows.",
      },
    ],
    screenshotsTitle: "Your home tech at a glance",
    screenshots: [
      {
        title: "Household overview",
        caption: "A calm dashboard of devices and recent activity across the home.",
        src: "/seo/screenshots/home-tech-overview.png",
        alt: "Home Pulse dashboard with home health score and today's highlights",
      },
      {
        title: "Filtered inventory",
        caption: "Filter by room, category, or warranty status when you need answers fast.",
        src: "/seo/screenshots/home-tech-filtered.png",
        alt: "Devices page filtered by Bedroom location and Smart Home category",
      },
      {
        title: "Household access",
        caption: "Shared visibility for the people who help manage the house.",
        src: "/seo/screenshots/home-tech-family.png",
        alt: "Family sharing page with household members, seats, and roles",
      },
    ],
    featuresTitle: "What makes a home tech inventory work",
    featuresDescription:
      "The pieces households need after the novelty of a new gadget wears off.",
    features: [
      {
        title: "Unified device records",
        description:
          "Purchase dates, locations, and notes stay attached to each item.",
      },
      {
        title: "Document vault links",
        description:
          "Manuals and receipts open from the device — not a separate folder maze.",
      },
      {
        title: "Plan that fits the home",
        description:
          "Free to start; Home Plus and Household when you need more devices or sharing.",
      },
    ],
    faqTitle: "Home tech inventory FAQ",
    faqDescription: "How Home Tech Vault approaches household technology records.",
    faqItems: [
      {
        question: "Who is home tech inventory for?",
        answer:
          "Homeowners, renters, and families who want their electronics organized without running IT software.",
      },
      {
        question: "Can multiple people maintain the inventory?",
        answer:
          "Yes on Household plans — invite members with roles so viewers stay read-only while others can edit.",
      },
      {
        question: "Do I need a connector or scanner?",
        answer:
          "No. You can add devices manually. Optional monitoring tools can help later if you choose them.",
      },
    ],
    relatedTitle: "Related guides",
    related: related([
      {
        slug: "device-inventory",
        title: "Device inventory",
        description: "Focus on listing and locating every device.",
      },
      {
        slug: "smart-home-organizer",
        title: "Smart home organizer",
        description: "Organize connected devices and hubs.",
      },
      {
        slug: "home-inventory-software",
        title: "Home inventory software",
        description: "See how Home Tech Vault compares as software.",
      },
    ]),
    ctaTitle: "Build your home tech inventory",
    ctaDescription:
      "Open a free vault and record the technology that already powers your home.",
  },

  "warranty-tracker": {
    slug: "warranty-tracker",
    path: "/warranty-tracker",
    navLabel: "Warranty tracker",
    metaTitle: "Warranty Tracker for Home Devices",
    metaDescription:
      "Track warranties, coverage dates, and claim-ready details for every home device. Never miss an expiration again.",
    keywords: [
      "warranty tracker",
      "device warranty tracker",
      "warranty expiration reminder",
      "home electronics warranty",
    ],
    heroEyebrow: "Warranty tracker",
    heroTitle: "Know what is still covered — before you pay for a repair.",
    heroDescription:
      "Home Tech Vault keeps warranty windows next to each device so claims, returns, and service calls start with facts.",
    heroPrimaryLabel: "Track warranties free",
    heroPrimaryHref: MARKETING_ROUTES.signup,
    heroSecondaryLabel: "View pricing",
    heroSecondaryHref: MARKETING_ROUTES.pricing,
    benefitsTitle: "Warranty tracking that earns its keep",
    benefits: [
      {
        title: "Coverage beside the device",
        description:
          "Expiration dates live on the device profile — not in a forgotten calendar event.",
      },
      {
        title: "Proof at hand",
        description:
          "Link receipts and warranty PDFs so you are ready when support asks for proof of purchase.",
      },
      {
        title: "Fewer surprise repair bills",
        description:
          "Check coverage first. Extend or replace with a clearer picture of what you still own.",
      },
    ],
    screenshotsTitle: "Warranty details where you need them",
    screenshots: [
      {
        title: "Warranty fields",
        caption: "Record coverage dates on each device profile.",
        src: "/seo/screenshots/warranty-center.png",
        alt: "Warranty center with active, expiring, and protected value summary cards",
      },
      {
        title: "Attached proof",
        caption: "Keep the receipt or warranty PDF linked to the same record.",
        src: "/seo/screenshots/device-documents.png",
        alt: "Device documents tab with receipt and warranty PDFs linked to the TV",
      },
      {
        title: "Device timeline",
        caption: "See purchase and service history in one place.",
        src: "/seo/screenshots/device-activity.png",
        alt: "Device history timeline showing network matching and activity events",
      },
    ],
    featuresTitle: "Built for claims, returns, and real life",
    featuresDescription:
      "Warranty tracking only works when it sits inside a complete device record.",
    features: [
      {
        title: "Purchase and warranty dates",
        description:
          "Capture the dates that matter for returns and manufacturer coverage.",
      },
      {
        title: "Document attachments",
        description:
          "Store the paperwork manufacturers and insurers request.",
      },
      {
        title: "Household visibility",
        description:
          "Family members can check coverage without hunting through your email.",
      },
    ],
    faqTitle: "Warranty tracker FAQ",
    faqDescription: "How warranty tracking works inside Home Tech Vault.",
    faqItems: [
      {
        question: "Does Home Tech Vault send warranty expiration emails?",
        answer:
          "You keep warranty dates on each device so they are visible whenever you open the vault. Use them as your source of truth for renewals and claims.",
      },
      {
        question: "Can I track extended warranties?",
        answer:
          "Yes. Record the coverage window that applies — manufacturer, retailer, or extended plan — on the device.",
      },
      {
        question: "What if I only care about warranties, not a full inventory?",
        answer:
          "Start with high-value devices and their warranty dates. You can expand the inventory later without changing tools.",
      },
    ],
    relatedTitle: "Pair with these pages",
    related: related([
      {
        slug: "device-inventory",
        title: "Device inventory",
        description: "List the devices your warranties protect.",
      },
      {
        slug: "home-document-organizer",
        title: "Home document organizer",
        description: "File receipts and warranty PDFs securely.",
      },
      {
        slug: "digital-home-vault",
        title: "Digital home vault",
        description: "Keep claim-ready records in one private place.",
      },
    ]),
    ctaTitle: "Put every warranty on the record",
    ctaDescription:
      "Add devices and coverage dates in a free Home Tech Vault account.",
  },

  "home-document-organizer": {
    slug: "home-document-organizer",
    path: "/home-document-organizer",
    navLabel: "Document organizer",
    metaTitle: "Home Document Organizer for Manuals & Receipts",
    metaDescription:
      "Organize manuals, receipts, and home technology documents in a digital vault linked to the devices they belong to.",
    keywords: [
      "home document organizer",
      "manual organizer",
      "receipt organizer home",
      "digital document vault",
    ],
    heroEyebrow: "Document organizer",
    heroTitle: "Manuals and receipts that are findable when something breaks.",
    heroDescription:
      "Stop scrolling old email threads. Home Tech Vault stores home technology documents next to the devices they support.",
    heroPrimaryLabel: "Organize documents free",
    heroPrimaryHref: MARKETING_ROUTES.signup,
    heroSecondaryLabel: "Open the demo",
    heroSecondaryHref: MARKETING_ROUTES.demo,
    benefitsTitle: "A document vault with device context",
    benefits: [
      {
        title: "Documents tied to devices",
        description:
          "Open a device and see its manual and receipt — no separate filing cabinet hunt.",
      },
      {
        title: "Search instead of scroll",
        description:
          "Find paperwork by device name or type when a technician is already on the phone.",
      },
      {
        title: "Private by design",
        description:
          "Your household records stay behind your account — shared only with people you invite.",
      },
    ],
    screenshotsTitle: "Documents in context",
    screenshots: [
      {
        title: "Document library",
        caption: "Browse manuals, receipts, and uploads in one vault view.",
        src: "/seo/screenshots/documents-library.png",
        alt: "Document vault with search, type filters, and household document cards",
      },
      {
        title: "Device attachments",
        caption: "Files appear on the device profile they belong to.",
        src: "/seo/screenshots/device-documents.png",
        alt: "Documents attached directly on a Samsung Frame TV device profile",
      },
      {
        title: "Secure viewing",
        caption: "Open documents when you need them without public links.",
        src: "/seo/screenshots/trust-security.png",
        alt: "Trust Center security and privacy overview for Home Tech Vault",
      },
    ],
    featuresTitle: "Organizer features for home tech paperwork",
    featuresDescription:
      "Paperwork only helps when it is attached to the right device.",
    features: [
      {
        title: "Upload and classify",
        description:
          "Add manuals, receipts, and notes with clear device associations.",
      },
      {
        title: "Device-linked storage",
        description:
          "Each file stays connected to the inventory item it supports.",
      },
      {
        title: "Household access controls",
        description:
          "Decide who can upload versus who can only view.",
      },
    ],
    faqTitle: "Document organizer FAQ",
    faqDescription: "Storing home technology documents the practical way.",
    faqItems: [
      {
        question: "What documents should I store?",
        answer:
          "Manuals, receipts, warranty PDFs, setup guides, and any paperwork you would need for support, insurance, or resale.",
      },
      {
        question: "Can I upload photos of paper receipts?",
        answer:
          "Yes. Capture paper documents and attach them to the matching device record.",
      },
      {
        question: "How is this different from Google Drive folders?",
        answer:
          "Folders forget context. Home Tech Vault links each file to a device, warranty, and household role model.",
      },
    ],
    relatedTitle: "Related pages",
    related: related([
      {
        slug: "digital-home-vault",
        title: "Digital home vault",
        description: "The private vault experience for household records.",
      },
      {
        slug: "warranty-tracker",
        title: "Warranty tracker",
        description: "Pair documents with coverage dates.",
      },
      {
        slug: "homeowner-tech-management",
        title: "Homeowner tech management",
        description: "Run the technology side of homeownership calmly.",
      },
    ]),
    ctaTitle: "Give every manual a permanent home",
    ctaDescription:
      "Upload your first documents free and link them to real devices.",
  },

  "network-documentation": {
    slug: "network-documentation",
    path: "/network-documentation",
    navLabel: "Network documentation",
    metaTitle: "Home Network Documentation",
    metaDescription:
      "Document your home network — router details, Wi-Fi notes, and connected devices — so setup and troubleshooting stay simple.",
    keywords: [
      "home network documentation",
      "router documentation",
      "wifi network notes",
      "home network inventory",
    ],
    heroEyebrow: "Network documentation",
    heroTitle: "Home network notes that survive the next outage.",
    heroDescription:
      "Keep router details, Wi-Fi context, and connected-device notes in the same vault as the rest of your home technology.",
    heroPrimaryLabel: "Document your network",
    heroPrimaryHref: MARKETING_ROUTES.signup,
    heroSecondaryLabel: "See network features",
    heroSecondaryHref: MARKETING_ROUTES.features,
    benefitsTitle: "Why network documentation belongs in the vault",
    benefits: [
      {
        title: "End the sticky-note router era",
        description:
          "Admin URLs, ISP details, and setup notes live somewhere searchable and shared.",
      },
      {
        title: "Connect devices to the network story",
        description:
          "Inventory and network context stay together when something drops offline.",
      },
      {
        title: "Help the next person who fixes it",
        description:
          "Family members or a technician can start with facts instead of a scavenger hunt.",
      },
    ],
    screenshotsTitle: "Network center snapshots",
    screenshots: [
      {
        title: "Network overview",
        caption: "A dedicated place for home network details and notes.",
        src: "/seo/screenshots/network-overview.png",
        alt: "Network center overview with connector status and discovered devices",
      },
      {
        title: "Connected context",
        caption: "Relate devices to how they sit on your home network.",
        src: "/seo/screenshots/devices-inventory.png",
        alt: "Device inventory list showing household technology records",
      },
      {
        title: "Shared household access",
        caption: "Let the right people see network notes without sharing passwords casually.",
        src: "/seo/screenshots/family-access.png",
        alt: "Family sharing page with household members and role permissions",
      },
    ],
    featuresTitle: "Documentation features for home networks",
    featuresDescription:
      "Enough structure to be useful — not a full enterprise NMS.",
    features: [
      {
        title: "Network info records",
        description:
          "Capture the details you always end up texting yourself later.",
      },
      {
        title: "Device inventory link",
        description:
          "Routers, access points, and clients stay in the same system.",
      },
      {
        title: "Optional monitoring tools",
        description:
          "Add deeper monitoring later on supported plans without changing your vault.",
      },
    ],
    faqTitle: "Network documentation FAQ",
    faqDescription: "Keeping home network details organized and private.",
    faqItems: [
      {
        question: "Should I store Wi-Fi passwords in Home Tech Vault?",
        answer:
          "Store what your household needs for recovery and setup, and use role-based sharing so viewers cannot change sensitive records.",
      },
      {
        question: "Is this a network monitoring product?",
        answer:
          "First it is documentation and inventory. Monitoring options can complement that picture on eligible plans.",
      },
      {
        question: "Can a family member update network notes?",
        answer:
          "Yes if you grant edit access. Viewers can read without making changes.",
      },
    ],
    relatedTitle: "Explore next",
    related: related([
      {
        slug: "smart-home-organizer",
        title: "Smart home organizer",
        description: "Organize hubs and connected devices.",
      },
      {
        slug: "device-inventory",
        title: "Device inventory",
        description: "List every network-connected device you own.",
      },
      {
        slug: "home-tech-inventory",
        title: "Home tech inventory",
        description: "See the broader household technology picture.",
      },
    ]),
    ctaTitle: "Write down your network once — properly",
    ctaDescription:
      "Start free and keep router and Wi-Fi context with the rest of your home tech.",
  },

  "homeowner-tech-management": {
    slug: "homeowner-tech-management",
    path: "/homeowner-tech-management",
    navLabel: "Homeowner tech management",
    metaTitle: "Homeowner Tech Management",
    metaDescription:
      "Manage the technology side of homeownership — devices, documents, warranties, and network notes — in one household vault.",
    keywords: [
      "homeowner tech management",
      "manage home technology",
      "homeownership technology",
      "household tech organizer",
    ],
    heroEyebrow: "Homeowner tech management",
    heroTitle: "Run the technology side of homeownership with less friction.",
    heroDescription:
      "Homeownership already has enough lists. Home Tech Vault is the calm system for the devices and documents that keep the house working.",
    heroPrimaryLabel: "Start managing free",
    heroPrimaryHref: MARKETING_ROUTES.signup,
    heroSecondaryLabel: "Read the trust center",
    heroSecondaryHref: MARKETING_ROUTES.trust,
    benefitsTitle: "For homeowners who want fewer blind spots",
    benefits: [
      {
        title: "One record for the whole house",
        description:
          "Inventory, paperwork, warranties, and network notes stop living in five different apps.",
      },
      {
        title: "Handoffs get easier",
        description:
          "Spouses, family, or a trusted helper can see what they need when you are traveling or busy.",
      },
      {
        title: "Prepared for insurance and service calls",
        description:
          "Pull device and document details quickly when something fails or a claim starts.",
      },
    ],
    screenshotsTitle: "A homeowner’s command view",
    screenshots: [
      {
        title: "Household dashboard",
        caption: "See the state of your home technology without opening ten tabs.",
        src: "/seo/screenshots/home-dashboard.png",
        alt: "Home Pulse dashboard with home health score and today's highlights",
      },
      {
        title: "Device and document pairing",
        caption: "Every important file sits with the equipment it protects.",
        src: "/seo/screenshots/device-documents.png",
        alt: "Device profile documents tab pairing receipts and warranties to a TV",
      },
      {
        title: "Family roles",
        caption: "Invite help with clear edit vs view permissions.",
        src: "/seo/screenshots/family-access.png",
        alt: "Household access roles for owner, admin, member, and viewer",
      },
    ],
    featuresTitle: "Management tools homeowners actually use",
    featuresDescription:
      "Practical structure for the long arc of owning and maintaining a home.",
    features: [
      {
        title: "Durable inventory",
        description:
          "Keep equipment records through upgrades, moves, and replacements.",
      },
      {
        title: "Document vault",
        description:
          "Retain manuals and receipts for the life of the device.",
      },
      {
        title: "Shared household access",
        description:
          "Coordinate with the people who help run the home.",
      },
    ],
    faqTitle: "Homeowner tech management FAQ",
    faqDescription: "How homeowners use Home Tech Vault day to day.",
    faqItems: [
      {
        question: "Is this only for smart homes?",
        answer:
          "No. It helps with any home technology — from a single router to a full connected setup.",
      },
      {
        question: "What if I am not technical?",
        answer:
          "The product is written for households. Add what you know; improve details over time.",
      },
      {
        question: "Can I use it when selling or refinancing later?",
        answer:
          "A clear device and document record helps you answer questions about what is installed and covered.",
      },
    ],
    relatedTitle: "Useful next reads",
    related: related([
      {
        slug: "digital-home-vault",
        title: "Digital home vault",
        description: "Private storage for household technology records.",
      },
      {
        slug: "home-tech-checklist",
        title: "Home tech checklist",
        description: "A room-by-room checklist to get started.",
      },
      {
        slug: "home-inventory-software",
        title: "Home inventory software",
        description: "Why specialized home tech software beats generic lists.",
      },
    ]),
    ctaTitle: "Take ownership of your home’s technology record",
    ctaDescription:
      "Create a free vault and start with the devices that matter most.",
  },

  "smart-home-organizer": {
    slug: "smart-home-organizer",
    path: "/smart-home-organizer",
    navLabel: "Smart home organizer",
    metaTitle: "Smart Home Organizer",
    metaDescription:
      "Organize smart home hubs, sensors, speakers, and connected devices in one household inventory with documents and network context.",
    keywords: [
      "smart home organizer",
      "smart home inventory",
      "iot device organizer",
      "connected home management",
    ],
    heroEyebrow: "Smart home organizer",
    heroTitle: "Your smart home should not be a mystery box of gadgets.",
    heroDescription:
      "Catalog hubs, sensors, speakers, and screens so updates, replacements, and guest Wi-Fi questions get simpler.",
    heroPrimaryLabel: "Organize smart devices",
    heroPrimaryHref: MARKETING_ROUTES.signup,
    heroSecondaryLabel: "Try the demo",
    heroSecondaryHref: MARKETING_ROUTES.demo,
    benefitsTitle: "Clarity for connected homes",
    benefits: [
      {
        title: "Know which hub owns what",
        description:
          "Track devices and the ecosystem notes that explain how they fit together.",
      },
      {
        title: "Replace smarter",
        description:
          "When a bulb, lock, or speaker fails, you already know model and purchase history.",
      },
      {
        title: "Onboard family without chaos",
        description:
          "Shared inventory helps everyone understand what is installed — without shared logins everywhere.",
      },
    ],
    screenshotsTitle: "Smart home records, calmly",
    screenshots: [
      {
        title: "Connected device list",
        caption: "Inventory smart devices alongside traditional electronics.",
        src: "/seo/screenshots/home-rooms.png",
        alt: "Room-by-room home view with Office, Bedroom, and Living Room device lists",
      },
      {
        title: "Notes and manuals",
        caption: "Keep setup guides with the device that needed them.",
        src: "/seo/screenshots/documents-library.png",
        alt: "Document vault filtered for manuals, receipts, and warranties",
      },
      {
        title: "Network adjacency",
        caption: "Reference network documentation when connectivity acts up.",
        src: "/seo/screenshots/network-overview.png",
        alt: "Network center linking discovered devices to vault records",
      },
    ],
    featuresTitle: "Organizer features for connected gear",
    featuresDescription:
      "Smart homes change often — your records should keep up without becoming a second job.",
    features: [
      {
        title: "Flexible categories",
        description:
          "Label hubs, sensors, cameras, and speakers the way your home uses them.",
      },
      {
        title: "Photo references",
        description:
          "Snap install locations and nameplates for faster support calls.",
      },
      {
        title: "Family-aware sharing",
        description:
          "Let helpers view or edit without exposing every account password.",
      },
    ],
    faqTitle: "Smart home organizer FAQ",
    faqDescription: "Organizing connected devices without another complex app.",
    faqItems: [
      {
        question: "Does Home Tech Vault control my smart devices?",
        answer:
          "No. It organizes records about them. Automations stay in the apps you already use.",
      },
      {
        question: "Can I track both smart and regular devices?",
        answer:
          "Yes. One inventory covers TVs, PCs, appliances, and connected gadgets together.",
      },
      {
        question: "What about vendor lock-in across ecosystems?",
        answer:
          "Your vault is ecosystem-agnostic — it documents what you own regardless of brand.",
      },
    ],
    relatedTitle: "Continue exploring",
    related: related([
      {
        slug: "network-documentation",
        title: "Network documentation",
        description: "Document the network your smart devices rely on.",
      },
      {
        slug: "home-tech-inventory",
        title: "Home tech inventory",
        description: "Widen the lens to all household technology.",
      },
      {
        slug: "device-inventory",
        title: "Device inventory",
        description: "Start with a clean list of what is installed.",
      },
    ]),
    ctaTitle: "Bring order to your smart home roster",
    ctaDescription:
      "Add your hubs and devices to a free Home Tech Vault account.",
  },

  "home-inventory-software": {
    slug: "home-inventory-software",
    path: "/home-inventory-software",
    navLabel: "Home inventory software",
    metaTitle: "Home Inventory Software for Technology",
    metaDescription:
      "Home Tech Vault is home inventory software focused on technology — devices, warranties, manuals, and household sharing.",
    keywords: [
      "home inventory software",
      "home inventory app",
      "electronics inventory software",
      "household inventory software",
    ],
    heroEyebrow: "Home inventory software",
    heroTitle: "Home inventory software that specializes in technology.",
    heroDescription:
      "Generic inventory apps treat a router like a sofa. Home Tech Vault is built for serials, warranties, manuals, and household access.",
    heroPrimaryLabel: "Try it free",
    heroPrimaryHref: MARKETING_ROUTES.signup,
    heroSecondaryLabel: "Compare plans",
    heroSecondaryHref: MARKETING_ROUTES.pricing,
    benefitsTitle: "Why specialized software wins for home tech",
    benefits: [
      {
        title: "Fields that match electronics",
        description:
          "Serial numbers, warranty dates, and manuals are first-class — not bolted-on notes.",
      },
      {
        title: "Household collaboration",
        description:
          "Family roles let people help without a shared master password.",
      },
      {
        title: "A product path that grows with you",
        description:
          "Free for getting started; Home Plus and Household when capacity or sharing matters.",
      },
    ],
    screenshotsTitle: "Software shaped for households",
    screenshots: [
      {
        title: "Clean inventory UI",
        caption: "A modern interface designed for clarity, not warehouse ops.",
        src: "/seo/screenshots/devices-inventory.png",
        alt: "Home Tech Vault devices inventory with search and device cards",
      },
      {
        title: "Plans overview",
        caption: "Transparent Home, Home Plus, and Household options.",
        src: "/seo/screenshots/pricing-plans.png",
        alt: "Pricing page showing Home, Home Plus, and Household plan cards",
      },
      {
        title: "Security posture",
        caption: "Account-based access with privacy-minded document handling.",
        src: "/seo/screenshots/trust-security.png",
        alt: "Trust Center outlining security and privacy practices",
      },
    ],
    featuresTitle: "What to expect from the software",
    featuresDescription:
      "Opinionated for home technology so you spend less time configuring and more time recording.",
    features: [
      {
        title: "Web app access",
        description:
          "Use it from the browsers your household already trusts.",
      },
      {
        title: "Secure cloud records",
        description:
          "Your vault travels with you — backed by authenticated access.",
      },
      {
        title: "Upgradeable plans",
        description:
          "Expand devices and sharing when your home needs more room.",
      },
    ],
    faqTitle: "Home inventory software FAQ",
    faqDescription: "Choosing software for household technology records.",
    faqItems: [
      {
        question: "Is Home Tech Vault free home inventory software?",
        answer:
          "Yes, you can start on Free. Paid plans unlock more capacity and family sharing.",
      },
      {
        question: "How is it different from spreadsheets?",
        answer:
          "Spreadsheets do not attach files, enforce roles, or keep a product experience that stays consistent across devices.",
      },
      {
        question: "Do I need to install desktop software?",
        answer:
          "No. Use the web app. Optional connector tools exist for advanced monitoring scenarios.",
      },
    ],
    relatedTitle: "Dig deeper",
    related: related([
      {
        slug: "home-tech-inventory",
        title: "Home tech inventory",
        description: "The inventory experience in plain language.",
      },
      {
        slug: "digital-home-vault",
        title: "Digital home vault",
        description: "How the vault protects household records.",
      },
      {
        slug: "homeowner-tech-management",
        title: "Homeowner tech management",
        description: "The homeownership angle on the same system.",
      },
    ]),
    ctaTitle: "Choose inventory software built for home tech",
    ctaDescription:
      "Create a free account and see if Home Tech Vault fits your household.",
  },

  "digital-home-vault": {
    slug: "digital-home-vault",
    path: "/digital-home-vault",
    navLabel: "Digital home vault",
    metaTitle: "Digital Home Vault for Technology Records",
    metaDescription:
      "A digital home vault for device records, manuals, receipts, and warranties — private, organized, and shareable with your household.",
    keywords: [
      "digital home vault",
      "home records vault",
      "digital document vault home",
      "secure home tech vault",
    ],
    heroEyebrow: "Digital home vault",
    heroTitle: "A private vault for the technology records your home depends on.",
    heroDescription:
      "Home Tech Vault keeps inventory and documents together so your household’s tech history is secure, searchable, and shared on purpose.",
    heroPrimaryLabel: "Open your vault free",
    heroPrimaryHref: MARKETING_ROUTES.signup,
    heroSecondaryLabel: "Security & privacy",
    heroSecondaryHref: MARKETING_ROUTES.trust,
    benefitsTitle: "Vault benefits beyond a folder dump",
    benefits: [
      {
        title: "Private by default",
        description:
          "Records live behind your account. You choose who else can see or edit.",
      },
      {
        title: "Structure without busywork",
        description:
          "Devices and documents stay linked, so the vault stays usable years later.",
      },
      {
        title: "Ready for real interruptions",
        description:
          "Outages, claims, and replacements are easier when the vault already has the facts.",
      },
    ],
    screenshotsTitle: "Inside the vault",
    screenshots: [
      {
        title: "Secure document access",
        caption: "Open files when you need them with authenticated access.",
        src: "/seo/screenshots/documents-library.png",
        alt: "Authenticated document vault listing household manuals and receipts",
      },
      {
        title: "Inventory + vault together",
        caption: "The vault is not separate from your device list — it completes it.",
        src: "/seo/screenshots/device-detail.png",
        alt: "Device profile combining inventory fields, warranty, and linked documents",
      },
      {
        title: "Role-based sharing",
        caption: "Invite family with viewer or editor access.",
        src: "/seo/screenshots/family-access.png",
        alt: "Family sharing with member roles and pending invitations",
      },
    ],
    featuresTitle: "What the digital vault protects",
    featuresDescription:
      "A home tech vault is only valuable if both privacy and findability are strong.",
    features: [
      {
        title: "Authenticated access",
        description:
          "Sign-in required — no public dumping ground for household files.",
      },
      {
        title: "Device-linked files",
        description:
          "Every upload can live with the equipment it belongs to.",
      },
      {
        title: "Household permissions",
        description:
          "Share the vault without sharing unrestricted control.",
      },
    ],
    faqTitle: "Digital home vault FAQ",
    faqDescription: "Privacy and practicality for household technology records.",
    faqItems: [
      {
        question: "Is my data private?",
        answer:
          "Your vault is account-protected. Review the Trust Center for how Home Tech Vault approaches security and privacy.",
      },
      {
        question: "Can I export or leave later?",
        answer:
          "You control your household records. Keep the vault current so you always own a clear picture of what you stored.",
      },
      {
        question: "Who should be invited to the vault?",
        answer:
          "Anyone who helps run the home. Use viewer roles for people who only need to look things up.",
      },
    ],
    relatedTitle: "Related pages",
    related: related([
      {
        slug: "home-document-organizer",
        title: "Home document organizer",
        description: "Focus on manuals and receipts.",
      },
      {
        slug: "warranty-tracker",
        title: "Warranty tracker",
        description: "Keep coverage details inside the vault.",
      },
      {
        slug: "homeowner-tech-management",
        title: "Homeowner tech management",
        description: "Use the vault as part of owning a home.",
      },
    ]),
    ctaTitle: "Create your digital home vault",
    ctaDescription:
      "Start free and give your household technology records a private home.",
  },

  "new-homeowner-checklist": {
    slug: "new-homeowner-checklist",
    path: "/new-homeowner-checklist",
    navLabel: "New homeowner checklist",
    metaTitle: "New Homeowner Checklist: First 30 Days",
    metaDescription:
      "Use this new homeowner checklist to organize manuals, warranties, appliance details, maintenance records, utilities, and smart-home handoff after closing.",
    keywords: [
      "new homeowner checklist",
      "first time homeowner checklist",
      "what to do after buying a house",
      "new house checklist after closing",
      "homeowner documents checklist",
    ],
    heroEyebrow: "New homeowner checklist",
    heroTitle: "The first 30 days in a new home are easier when the house has a record.",
    heroDescription:
      "Use this practical checklist to capture the manuals, warranties, model numbers, maintenance history, utilities, and smart-home details that are easiest to lose right after closing.",
    heroPrimaryLabel: "Start your home record free",
    heroPrimaryHref: MARKETING_ROUTES.signup,
    heroSecondaryLabel: "See the demo",
    heroSecondaryHref: MARKETING_ROUTES.demo,
    benefitsTitle: "What to organize right after closing",
    benefits: [
      {
        title: "Collect what came with the house",
        description:
          "Gather appliance manuals, warranty paperwork, service records, paint notes, garage remotes, and other handoff information before it disappears into moving boxes.",
      },
      {
        title: "Record the equipment you inherited",
        description:
          "Save model and serial numbers for appliances, HVAC equipment, routers, cameras, thermostats, and other systems you may need serviced later.",
      },
      {
        title: "Create a maintenance starting point",
        description:
          "Write down filter sizes, recent service dates, recurring tasks, and the contractors or providers tied to the home.",
      },
    ],
    screenshotsTitle: "Turn move-in information into a lasting record",
    screenshots: [
      {
        title: "Home overview",
        caption: "Keep the devices and systems that came with the property in one household record.",
        src: "/seo/screenshots/home-tech-overview.png",
        alt: "Home Tech Vault home overview with household device and maintenance information",
      },
      {
        title: "Device details",
        caption: "Save appliance model numbers, serials, purchase details, and linked documents.",
        src: "/seo/screenshots/device-detail.png",
        alt: "Home Tech Vault device profile with model number, serial number, warranty, and documents",
      },
      {
        title: "Document vault",
        caption: "Keep manuals, receipts, warranties, and home records searchable after move-in.",
        src: "/seo/screenshots/documents-library.png",
        alt: "Home Tech Vault document library with household manuals and warranty records",
      },
    ],
    featuresTitle: "A first-time homeowner checklist that stays useful",
    featuresDescription:
      "The goal is not another one-time moving checklist. It is a home record you can keep updating after the boxes are gone.",
    features: [
      {
        title: "Appliance and system records",
        description:
          "Document major equipment with brand, model, serial number, room, and notes.",
      },
      {
        title: "Manuals and warranties",
        description:
          "Attach the paperwork you will need when something breaks or needs service.",
      },
      {
        title: "Maintenance history",
        description:
          "Start a timeline for filters, repairs, service visits, and recurring home-care tasks.",
      },
      {
        title: "Household handoff details",
        description:
          "Keep useful non-secret context for smart-home devices, network equipment, and shared systems.",
      },
    ],
    faqTitle: "New homeowner checklist FAQ",
    faqDescription:
      "Common questions about what to document and organize after buying a home.",
    faqItems: [
      {
        question: "What documents should a new homeowner keep?",
        answer:
          "Keep closing and insurance records in the appropriate secure place, plus appliance manuals, warranty documents, receipts, service history, contractor information, and equipment details you may need for repairs or claims.",
      },
      {
        question: "What appliance information should I save after closing?",
        answer:
          "Record the brand, model number, serial number, approximate age or install date when known, warranty information, and a photo of the product label for major appliances and home systems.",
      },
      {
        question: "Should I document smart-home devices left by the seller?",
        answer:
          "Yes. Confirm ownership has been transferred or reset, then record the device name, location, model, and the household account responsible for it without storing passwords in plain text.",
      },
      {
        question: "Do I have to finish the whole checklist at once?",
        answer:
          "No. Start with HVAC, water heating, kitchen appliances, security, networking, and other expensive or frequently serviced equipment, then expand room by room.",
      },
    ],
    relatedTitle: "Next steps for your home record",
    related: related([
      {
        slug: "home-document-organizer",
        title: "Organize home documents",
        description: "Give manuals, warranties, and receipts a permanent searchable home.",
      },
      {
        slug: "warranty-tracker",
        title: "Track appliance warranties",
        description: "Keep coverage dates and proof attached to each device.",
      },
      {
        slug: "home-maintenance-checklist",
        title: "Home maintenance checklist",
        description: "Build a realistic monthly and seasonal maintenance rhythm.",
      },
    ]),
    ctaTitle: "Give your new home a memory from day one",
    ctaDescription:
      "Start free and build the household record you will wish you had the first time something breaks.",
  },

  "appliance-model-serial-number": {
    slug: "appliance-model-serial-number",
    path: "/appliance-model-serial-number",
    navLabel: "Appliance model & serial numbers",
    metaTitle: "How to Find Appliance Model & Serial Numbers",
    metaDescription:
      "Find the model and serial number on refrigerators, dishwashers, washers, dryers, ranges, and other home appliances, then save them for repairs and warranties.",
    keywords: [
      "how to find appliance model number",
      "where is appliance serial number",
      "refrigerator model number location",
      "dishwasher serial number location",
      "washer model number",
      "appliance model and serial number",
    ],
    heroEyebrow: "Appliance model numbers",
    heroTitle: "Find the model and serial number before you need a repair.",
    heroDescription:
      "Appliance labels are easy to ignore until a technician, parts site, warranty claim, or manual asks for the exact model. Use this guide to know where to look and what to save.",
    heroPrimaryLabel: "Save your appliance details free",
    heroPrimaryHref: MARKETING_ROUTES.signup,
    heroSecondaryLabel: "See device inventory",
    heroSecondaryHref: "/device-inventory",
    benefitsTitle: "Why model and serial numbers matter",
    benefits: [
      {
        title: "Order the right parts",
        description:
          "The marketing name is often not specific enough. The model number identifies the exact product configuration a parts lookup or technician needs.",
      },
      {
        title: "Speed up warranty and service calls",
        description:
          "Support teams commonly ask for both model and serial number before confirming coverage, parts, recalls, or service options.",
      },
      {
        title: "Find the correct manual",
        description:
          "The exact model is the fastest path to the right installation, care, troubleshooting, and owner documentation.",
      },
    ],
    screenshotsTitle: "Save the label once, use it for years",
    screenshots: [
      {
        title: "Device profile",
        caption: "Store model and serial numbers on the appliance record instead of relying on the label forever.",
        src: "/seo/screenshots/device-detail.png",
        alt: "Home Tech Vault device profile showing model and serial number fields",
      },
      {
        title: "Linked documents",
        caption: "Attach the correct manual, receipt, and warranty to the exact appliance.",
        src: "/seo/screenshots/device-documents.png",
        alt: "Home Tech Vault device documents with appliance receipt and manual",
      },
      {
        title: "Searchable inventory",
        caption: "Find the appliance record quickly when a technician or parts site asks for it.",
        src: "/seo/screenshots/device-directory.png",
        alt: "Searchable Home Tech Vault device directory for household appliances",
      },
    ],
    featuresTitle: "Where to look on common appliances",
    featuresDescription:
      "Manufacturers vary, but rating plates and product labels tend to appear in predictable places. Check the label before moving or disconnecting an appliance.",
    features: [
      {
        title: "Refrigerator",
        description:
          "Look inside the fresh-food compartment, along a side wall, near the crisper drawers, around the door frame, or behind the lower kick plate.",
      },
      {
        title: "Dishwasher",
        description:
          "Open the door and inspect the inner door edge, frame, or side of the tub near the opening.",
      },
      {
        title: "Washer and dryer",
        description:
          "Check the door or lid opening, rear panel, control-console area, or inside the door jamb.",
      },
      {
        title: "Range, oven, and cooktop",
        description:
          "Look around the oven door frame, storage drawer opening, rear panel, or underside of a removable cooktop area when the manufacturer directs it.",
      },
      {
        title: "Water heater and HVAC",
        description:
          "The data plate is usually on the equipment cabinet or tank. Photograph it while access is clear and include install or service notes when known.",
      },
    ],
    faqTitle: "Appliance model and serial number FAQ",
    faqDescription:
      "What to capture when you locate an appliance product label.",
    faqItems: [
      {
        question: "Is the model number the same as the serial number?",
        answer:
          "No. The model identifies the product type or configuration, while the serial number identifies the individual unit. Service and warranty teams may ask for both.",
      },
      {
        question: "What should I do if the appliance label is faded?",
        answer:
          "Check purchase records, retailer order history, manufacturer apps, old service invoices, or documentation left with the home. Photograph any readable portion before it gets worse.",
      },
      {
        question: "Should I save a photo of the appliance label?",
        answer:
          "Yes. A clear label photo gives you the exact spelling and punctuation of the model and serial and can help when manually typed records contain an error.",
      },
      {
        question: "Why does the exact model number matter for manuals?",
        answer:
          "Appliance families often have several similar versions with different parts, controls, or installation requirements. The exact model helps you select the correct documentation.",
      },
    ],
    relatedTitle: "Keep the information useful",
    related: related([
      {
        slug: "device-inventory",
        title: "Home device inventory",
        description: "Keep model and serial numbers in the broader household inventory.",
      },
      {
        slug: "warranty-tracker",
        title: "Warranty tracker",
        description: "Pair serials with coverage dates and proof of purchase.",
      },
      {
        slug: "home-document-organizer",
        title: "Manual and receipt organizer",
        description: "Attach the correct paperwork to each appliance record.",
      },
    ]),
    ctaTitle: "Stop crawling behind appliances twice",
    ctaDescription:
      "Save the label, model, serial, manual, and warranty in Home Tech Vault while you can reach them.",
  },

  "home-maintenance-checklist": {
    slug: "home-maintenance-checklist",
    path: "/home-maintenance-checklist",
    navLabel: "Home maintenance checklist",
    metaTitle: "Home Maintenance Checklist by Month & Season",
    metaDescription:
      "A practical home maintenance checklist organized by monthly, seasonal, and annual tasks, with a simple way to keep service history and reminders together.",
    keywords: [
      "home maintenance checklist",
      "monthly home maintenance checklist",
      "seasonal home maintenance checklist",
      "annual home maintenance checklist",
      "home maintenance schedule",
      "homeowner maintenance checklist",
    ],
    heroEyebrow: "Home maintenance checklist",
    heroTitle: "A home maintenance checklist you can actually keep up with.",
    heroDescription:
      "Separate quick recurring checks from seasonal and annual work, record what was done, and follow the manufacturer instructions and professional guidance that apply to your home.",
    heroPrimaryLabel: "Track maintenance free",
    heroPrimaryHref: MARKETING_ROUTES.signup,
    heroSecondaryLabel: "Browse maintenance guides",
    heroSecondaryHref: "/knowledge/maintenance",
    benefitsTitle: "Build a maintenance rhythm instead of a giant to-do list",
    benefits: [
      {
        title: "Monthly: inspect the basics",
        description:
          "Check visible leaks or moisture, review the HVAC filter condition, test safety devices according to their instructions, and notice anything that changed.",
      },
      {
        title: "Seasonally: prepare for weather",
        description:
          "Review HVAC needs, exterior drainage, weather-sensitive equipment, outdoor devices, and other tasks that change with your climate and home.",
      },
      {
        title: "Annually: review the big systems",
        description:
          "Revisit service history, manufacturer maintenance schedules, recurring professional inspections, warranties, and equipment nearing replacement age.",
      },
    ],
    screenshotsTitle: "Make maintenance part of the home record",
    screenshots: [
      {
        title: "Maintenance dashboard",
        caption: "Keep recurring home-care tasks visible instead of rebuilding a checklist each year.",
        src: "/seo/screenshots/home-dashboard.png",
        alt: "Home Tech Vault dashboard with household maintenance tasks and reminders",
      },
      {
        title: "Service history",
        caption: "Record what was done, when it happened, and which device or home system it belongs to.",
        src: "/seo/screenshots/device-activity.png",
        alt: "Home Tech Vault device activity timeline with maintenance and service history",
      },
      {
        title: "Equipment records",
        caption: "Keep filter sizes, model numbers, manuals, and warranty information next to the maintained equipment.",
        src: "/seo/screenshots/device-detail.png",
        alt: "Home Tech Vault equipment profile with model, warranty, and maintenance context",
      },
    ],
    featuresTitle: "A simple maintenance schedule",
    featuresDescription:
      "Use this as a planning framework, not a substitute for the manual, local requirements, or a qualified professional. Your home may not contain every system listed.",
    features: [
      {
        title: "Every month",
        description:
          "Walk the home for visible leaks or moisture, inspect frequently used filters and vents, check drains, and test safety equipment on the schedule required by its manufacturer.",
      },
      {
        title: "Spring",
        description:
          "Review cooling equipment, drainage, exterior water management, outdoor devices, screens, and weather-related wear before heavier warm-season use.",
      },
      {
        title: "Summer",
        description:
          "Watch cooling performance, condensation and drainage, outdoor equipment, irrigation, and heat-sensitive electronics or networking gear.",
      },
      {
        title: "Fall",
        description:
          "Prepare heating equipment, replace or inspect filters as needed, review exterior drainage, winterize appropriate outdoor systems, and document any service.",
      },
      {
        title: "Winter",
        description:
          "Watch for moisture, freezing risk, heating issues, indoor air problems, and equipment that is working harder during cold weather.",
      },
      {
        title: "Once a year",
        description:
          "Review the service history for HVAC, water heating, appliances, alarms, electrical or plumbing concerns, and any manufacturer-specified maintenance you may have missed.",
      },
    ],
    faqTitle: "Home maintenance checklist FAQ",
    faqDescription:
      "How to make a recurring home maintenance schedule manageable.",
    faqItems: [
      {
        question: "What home maintenance should I do every month?",
        answer:
          "A short monthly inspection can include looking for leaks or moisture, checking filter condition, making sure drains and vents are functioning normally, and testing safety equipment according to the product instructions. Use your equipment manuals for exact service intervals.",
      },
      {
        question: "Should I replace my HVAC filter every month?",
        answer:
          "Not automatically. Filter type, system use, pets, air quality, and manufacturer guidance affect replacement frequency. Inspect it regularly and follow the HVAC and filter manufacturer's recommendations.",
      },
      {
        question: "How should I keep home maintenance records?",
        answer:
          "For each major system or appliance, keep the service date, what was done, provider or DIY notes, receipts when relevant, and the model or serial number tied to that work.",
      },
      {
        question: "What is the easiest way to keep a maintenance checklist current?",
        answer:
          "Use recurring tasks and a service history tied to the actual equipment. That is easier to maintain than a static printable checklist that starts over every year.",
      },
    ],
    relatedTitle: "Build the rest of your home record",
    related: related([
      {
        slug: "new-homeowner-checklist",
        title: "New homeowner checklist",
        description: "Create the baseline record for a home you just bought.",
      },
      {
        slug: "device-inventory",
        title: "Device inventory",
        description: "Tie maintenance to the appliances and equipment it belongs to.",
      },
      {
        slug: "home-document-organizer",
        title: "Home document organizer",
        description: "Keep service invoices, manuals, and warranty paperwork searchable.",
      },
    ]),
    ctaTitle: "Make the checklist remember what you already did",
    ctaDescription:
      "Track recurring tasks and service history inside the same record as your home equipment and documents.",
  },

  "home-tech-checklist": {
    slug: "home-tech-checklist",
    path: "/home-tech-checklist",
    navLabel: "Home tech checklist",
    metaTitle: "Home Tech Checklist",
    metaDescription:
      "Use a practical home tech checklist to inventory devices, file manuals, capture warranties, and document your network — then keep it in Home Tech Vault.",
    keywords: [
      "home tech checklist",
      "home technology checklist",
      "electronics inventory checklist",
      "home device checklist",
    ],
    heroEyebrow: "Home tech checklist",
    heroTitle: "A home tech checklist you can finish — and keep current.",
    heroDescription:
      "Use this checklist to stand up a reliable household technology record, then maintain it in Home Tech Vault instead of starting over every year.",
    heroPrimaryLabel: "Start the checklist in-app",
    heroPrimaryHref: MARKETING_ROUTES.signup,
    heroSecondaryLabel: "Browse FAQ",
    heroSecondaryHref: MARKETING_ROUTES.faq,
    benefitsTitle: "A checklist with a permanent home",
    benefits: [
      {
        title: "Room-by-room progress",
        description:
          "Work through living spaces methodically so nothing obvious gets skipped.",
      },
      {
        title: "Paperwork in the same pass",
        description:
          "Capture manuals and receipts while you are already looking at each device.",
      },
      {
        title: "Maintenance that sticks",
        description:
          "The checklist becomes an inventory — not a PDF you lose after moving day.",
      },
    ],
    screenshotsTitle: "From checklist to living system",
    screenshots: [
      {
        title: "Add devices as you go",
        caption: "Turn each checklist item into a real inventory record.",
        src: "/seo/screenshots/home-rooms.png",
        alt: "Room-by-room checklist view with Add Device for each space",
      },
      {
        title: "Attach documents immediately",
        caption: "Upload manuals while you still have them open.",
        src: "/seo/screenshots/documents-library.png",
        alt: "Document vault upload flow for manuals, receipts, and warranties",
      },
      {
        title: "Revisit anytime",
        caption: "Update the vault when you buy, replace, or retire gear.",
        src: "/seo/screenshots/home-dashboard.png",
        alt: "Home Pulse dashboard for revisiting household tech status anytime",
      },
    ],
    featuresTitle: "Checklist themes covered in the product",
    featuresDescription:
      "Each theme maps to a Home Tech Vault capability so the list does not die in Notes.",
    features: [
      {
        title: "Inventory pass",
        description:
          "List devices by room with brand, model, and location.",
      },
      {
        title: "Warranty pass",
        description:
          "Record coverage windows for high-value items.",
      },
      {
        title: "Network pass",
        description:
          "Write down router and Wi-Fi details your future self will need.",
      },
    ],
    faqTitle: "Home tech checklist FAQ",
    faqDescription: "Getting started without boiling the ocean.",
    faqItems: [
      {
        question: "How long does the first checklist pass take?",
        answer:
          "Many households finish a useful first pass in an evening by focusing on high-value and frequently used devices.",
      },
      {
        question: "Should I include every cable and adapter?",
        answer:
          "Start with devices you would replace or claim. Add accessories later if they matter to you.",
      },
      {
        question: "How do I keep the checklist from going stale?",
        answer:
          "Update Home Tech Vault when something new arrives or leaves. The vault is the living checklist.",
      },
    ],
    relatedTitle: "Use these pages with the checklist",
    related: related([
      {
        slug: "device-inventory",
        title: "Device inventory",
        description: "The inventory destination for checklist items.",
      },
      {
        slug: "warranty-tracker",
        title: "Warranty tracker",
        description: "Add coverage while you walk each room.",
      },
      {
        slug: "network-documentation",
        title: "Network documentation",
        description: "Complete the network section of the checklist.",
      },
    ]),
    ctaTitle: "Turn the checklist into a lasting vault",
    ctaDescription:
      "Create a free account and check off your home tech the sustainable way.",
  },
};

export const SEO_LANDING_SLUGS = Object.keys(
  SEO_LANDING_PAGES
) as Array<keyof typeof SEO_LANDING_PAGES>;

export function getSeoLandingPage(
  slug: string
): SeoLandingPageContent | null {
  return SEO_LANDING_PAGES[slug] ?? null;
}

export function breadcrumbsForLanding(
  page: SeoLandingPageContent
): BreadcrumbItem[] {
  return [
    { name: "Home", href: "/" },
    { name: page.navLabel },
  ];
}
