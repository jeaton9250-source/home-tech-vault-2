import type { KnowledgeCategorySlug } from "@/lib/knowledge/categories";

export type KnowledgeArticleMeta = {
  slug: string;
  category: KnowledgeCategorySlug;
  title: string;
  description: string;
  publishedAt: string;
  keywords: string[];
  relatedSlugs: string[];
};

/**
 * Canonical Knowledge Center catalog — 50 articles across 7 categories.
 */
export const KNOWLEDGE_CATALOG: KnowledgeArticleMeta[] = [
  // Devices (7)
  {
    slug: "how-to-inventory-every-device-in-your-home",
    category: "devices",
    title: "How to Inventory Every Device in Your Home",
    description:
      "A practical system for listing laptops, TVs, appliances, and gadgets so you always know what you own and where it lives.",
    publishedAt: "2026-03-02",
    keywords: [
      "home device inventory",
      "electronics list",
      "household tech catalog",
    ],
    relatedSlugs: [
      "room-by-room-device-audit",
      "what-to-record-when-you-unbox-a-device",
      "serial-numbers-and-why-they-matter",
    ],
  },
  {
    slug: "serial-numbers-and-why-they-matter",
    category: "devices",
    title: "Serial Numbers and Why They Matter for Home Tech",
    description:
      "Where to find serials, how to store them safely, and why they unlock warranties, insurance claims, and support tickets.",
    publishedAt: "2026-03-04",
    keywords: [
      "device serial number",
      "electronics serial",
      "warranty serial number",
    ],
    relatedSlugs: [
      "how-to-inventory-every-device-in-your-home",
      "proof-of-purchase-for-electronics",
      "insurance-ready-electronics-documentation",
    ],
  },
  {
    slug: "room-by-room-device-audit",
    category: "devices",
    title: "Room-by-Room Device Audit for Busy Households",
    description:
      "Walk each room once, capture what matters, and leave with a complete inventory instead of another abandoned spreadsheet.",
    publishedAt: "2026-03-06",
    keywords: [
      "room device audit",
      "home electronics audit",
      "inventory by room",
    ],
    relatedSlugs: [
      "how-to-inventory-every-device-in-your-home",
      "labeling-electronics-without-clutter",
      "organizing-smart-home-devices",
    ],
  },
  {
    slug: "labeling-electronics-without-clutter",
    category: "devices",
    title: "Labeling Electronics Without Adding Clutter",
    description:
      "Simple labeling habits that help family members identify cables, chargers, and gear without covering everything in stickers.",
    publishedAt: "2026-03-08",
    keywords: [
      "label electronics",
      "cable labeling",
      "device tags home",
    ],
    relatedSlugs: [
      "room-by-room-device-audit",
      "tracking-laptops-phones-and-tablets",
      "mapping-access-points-and-mesh-nodes",
    ],
  },
  {
    slug: "tracking-laptops-phones-and-tablets",
    category: "devices",
    title: "Tracking Laptops, Phones, and Tablets at Home",
    description:
      "Keep personal devices documented across family members without turning your household into an IT help desk.",
    publishedAt: "2026-03-10",
    keywords: [
      "track family devices",
      "laptop inventory home",
      "phone serial number list",
    ],
    relatedSlugs: [
      "serial-numbers-and-why-they-matter",
      "safe-sharing-of-device-details",
      "what-to-store-before-you-travel",
    ],
  },
  {
    slug: "appliance-records-beyond-the-kitchen",
    category: "devices",
    title: "Appliance Records Beyond the Kitchen",
    description:
      "Washers, HVAC, garage openers, and more — the appliance details worth capturing before you need a service call.",
    publishedAt: "2026-03-12",
    keywords: [
      "appliance records",
      "home appliance inventory",
      "HVAC model number",
    ],
    relatedSlugs: [
      "filter-and-vent-maintenance-for-tech",
      "warranty-tracker-habits-that-stick",
      "seasonal-home-tech-maintenance",
    ],
  },
  {
    slug: "what-to-record-when-you-unbox-a-device",
    category: "devices",
    title: "What to Record When You Unbox a Device",
    description:
      "A short unboxing checklist that captures receipts, serials, and setup notes while everything is still in one place.",
    publishedAt: "2026-03-14",
    keywords: [
      "unboxing checklist",
      "new device setup records",
      "electronics documentation",
    ],
    relatedSlugs: [
      "after-you-buy-setup-documentation",
      "proof-of-purchase-for-electronics",
      "how-to-inventory-every-device-in-your-home",
    ],
  },

  // Networking (7)
  {
    slug: "documenting-your-home-network",
    category: "networking",
    title: "Documenting Your Home Network the Practical Way",
    description:
      "Build a living network notebook: gear, logins, ISP details, and topology notes you can actually use during an outage.",
    publishedAt: "2026-03-16",
    keywords: [
      "home network documentation",
      "network inventory",
      "router notes",
    ],
    relatedSlugs: [
      "router-admin-notes-worth-keeping",
      "wifi-network-names-passwords-and-guests",
      "isp-account-details-for-outages",
    ],
  },
  {
    slug: "router-admin-notes-worth-keeping",
    category: "networking",
    title: "Router Admin Notes Worth Keeping",
    description:
      "Which router settings, credentials, and firmware details belong in your household records — and which ones should stay out.",
    publishedAt: "2026-03-18",
    keywords: [
      "router admin password",
      "router documentation",
      "home router settings",
    ],
    relatedSlugs: [
      "documenting-your-home-network",
      "firmware-update-habits-for-households",
      "network-equipment-replacement-checklist",
    ],
  },
  {
    slug: "wifi-network-names-passwords-and-guests",
    category: "networking",
    title: "Wi-Fi Names, Passwords, and Guest Access Notes",
    description:
      "Keep household Wi-Fi details organized for family and guests without texting passwords forever.",
    publishedAt: "2026-03-20",
    keywords: [
      "wifi password organizer",
      "guest wifi notes",
      "ssid documentation",
    ],
    relatedSlugs: [
      "documenting-your-home-network",
      "safe-sharing-of-device-details",
      "household-access-without-oversharing",
    ],
  },
  {
    slug: "mapping-access-points-and-mesh-nodes",
    category: "networking",
    title: "Mapping Access Points and Mesh Nodes",
    description:
      "Sketch where each node lives, what it covers, and how to replace a dead unit without starting from scratch.",
    publishedAt: "2026-03-22",
    keywords: [
      "mesh wifi map",
      "access point inventory",
      "wifi node locations",
    ],
    relatedSlugs: [
      "documenting-your-home-network",
      "labeling-electronics-without-clutter",
      "choosing-devices-that-fit-your-network",
    ],
  },
  {
    slug: "isp-account-details-for-outages",
    category: "networking",
    title: "ISP Account Details to Keep for Outages",
    description:
      "Account numbers, modem identifiers, and support notes that shorten hold times when the internet drops.",
    publishedAt: "2026-03-24",
    keywords: [
      "ISP account number",
      "internet outage prep",
      "modem documentation",
    ],
    relatedSlugs: [
      "documenting-your-home-network",
      "router-admin-notes-worth-keeping",
      "preparing-tech-records-for-emergencies",
    ],
  },
  {
    slug: "ethernet-ports-and-wired-device-notes",
    category: "networking",
    title: "Ethernet Ports and Wired Device Notes",
    description:
      "Document wall jacks, switch ports, and hardwired gear so moves and troubleshooting do not turn into cable archaeology.",
    publishedAt: "2026-03-26",
    keywords: [
      "ethernet port map",
      "wired network documentation",
      "home switch ports",
    ],
    relatedSlugs: [
      "documenting-your-home-network",
      "mapping-access-points-and-mesh-nodes",
      "network-equipment-replacement-checklist",
    ],
  },
  {
    slug: "network-equipment-replacement-checklist",
    category: "networking",
    title: "Network Equipment Replacement Checklist",
    description:
      "A calm checklist for swapping routers, mesh nodes, or modems without losing passwords, port mappings, or ISP settings.",
    publishedAt: "2026-03-28",
    keywords: [
      "replace home router",
      "mesh node replacement",
      "network upgrade checklist",
    ],
    relatedSlugs: [
      "router-admin-notes-worth-keeping",
      "firmware-update-habits-for-households",
      "upgrade-vs-repair-decision-guide",
    ],
  },

  // Smart Home (7)
  {
    slug: "organizing-smart-home-devices",
    category: "smart-home",
    title: "Organizing Smart Home Devices Without Another App",
    description:
      "Create a clear inventory of hubs, sensors, bulbs, and speakers that sits above the vendor apps you already use.",
    publishedAt: "2026-04-01",
    keywords: [
      "smart home inventory",
      "organize smart devices",
      "home automation records",
    ],
    relatedSlugs: [
      "hubs-bridges-and-controllers-inventory",
      "sensors-cameras-and-automation-gear",
      "smart-lights-switches-and-scenes-records",
    ],
  },
  {
    slug: "hubs-bridges-and-controllers-inventory",
    category: "smart-home",
    title: "Hubs, Bridges, and Controllers: What to Inventory",
    description:
      "Capture the “brains” of your smart home — hubs, bridges, and controllers — so replacements and migrations are less painful.",
    publishedAt: "2026-04-03",
    keywords: [
      "smart home hub inventory",
      "zigbee bridge records",
      "home assistant documentation",
    ],
    relatedSlugs: [
      "organizing-smart-home-devices",
      "when-smart-devices-need-manual-backups",
      "documenting-your-home-network",
    ],
  },
  {
    slug: "smart-lights-switches-and-scenes-records",
    category: "smart-home",
    title: "Smart Lights, Switches, and Scene Records",
    description:
      "Track which bulbs and switches run which rooms and scenes so guests and family can understand the house.",
    publishedAt: "2026-04-05",
    keywords: [
      "smart light inventory",
      "smart switch documentation",
      "home lighting scenes",
    ],
    relatedSlugs: [
      "organizing-smart-home-devices",
      "labeling-electronics-without-clutter",
      "room-by-room-device-audit",
    ],
  },
  {
    slug: "voice-assistants-and-speaker-notes",
    category: "smart-home",
    title: "Voice Assistants and Speaker Placement Notes",
    description:
      "Document speakers, accounts, and rooms so streaming, announcements, and replacements stay straightforward.",
    publishedAt: "2026-04-07",
    keywords: [
      "smart speaker inventory",
      "voice assistant records",
      "speaker placement notes",
    ],
    relatedSlugs: [
      "organizing-smart-home-devices",
      "household-access-without-oversharing",
      "wifi-network-names-passwords-and-guests",
    ],
  },
  {
    slug: "sensors-cameras-and-automation-gear",
    category: "smart-home",
    title: "Sensors, Cameras, and Automation Gear Records",
    description:
      "Keep battery sensors, cameras, and automation devices documented before they fail quietly in a closet or attic.",
    publishedAt: "2026-04-09",
    keywords: [
      "smart sensor inventory",
      "home camera documentation",
      "automation device list",
    ],
    relatedSlugs: [
      "documenting-security-cameras-and-alarms",
      "battery-replacement-schedules",
      "hubs-bridges-and-controllers-inventory",
    ],
  },
  {
    slug: "smart-thermostats-and-climate-devices",
    category: "smart-home",
    title: "Smart Thermostats and Climate Device Records",
    description:
      "Model numbers, schedules, and installer notes for thermostats, air quality monitors, and related climate gear.",
    publishedAt: "2026-04-11",
    keywords: [
      "smart thermostat records",
      "climate device inventory",
      "HVAC thermostat documentation",
    ],
    relatedSlugs: [
      "appliance-records-beyond-the-kitchen",
      "seasonal-home-tech-maintenance",
      "filter-and-vent-maintenance-for-tech",
    ],
  },
  {
    slug: "when-smart-devices-need-manual-backups",
    category: "smart-home",
    title: "When Smart Devices Need Manual Backups",
    description:
      "Which automations and hub configs deserve an offline note — and how to keep those backups current without busywork.",
    publishedAt: "2026-04-13",
    keywords: [
      "smart home backup",
      "hub configuration backup",
      "automation documentation",
    ],
    relatedSlugs: [
      "hubs-bridges-and-controllers-inventory",
      "preparing-tech-records-for-emergencies",
      "network-equipment-replacement-checklist",
    ],
  },

  // Security (7)
  {
    slug: "private-records-for-home-technology",
    category: "security",
    title: "Private Records for Home Technology",
    description:
      "Decide what tech details belong in a household vault versus a password manager — and how to keep sensitive notes private.",
    publishedAt: "2026-04-15",
    keywords: [
      "private home tech records",
      "secure device documentation",
      "household information vault",
    ],
    relatedSlugs: [
      "safe-sharing-of-device-details",
      "household-access-without-oversharing",
      "preparing-tech-records-for-emergencies",
    ],
  },
  {
    slug: "safe-sharing-of-device-details",
    category: "security",
    title: "Safe Sharing of Device Details with Family",
    description:
      "Share enough for day-to-day life and emergencies without handing everyone admin access to everything.",
    publishedAt: "2026-04-17",
    keywords: [
      "share device info family",
      "household tech access",
      "family device records",
    ],
    relatedSlugs: [
      "private-records-for-home-technology",
      "buying-for-a-shared-household",
      "wifi-network-names-passwords-and-guests",
    ],
  },
  {
    slug: "insurance-ready-electronics-documentation",
    category: "security",
    title: "Insurance-Ready Electronics Documentation",
    description:
      "Build a claim-ready packet of photos, serials, receipts, and values before you ever need an adjuster.",
    publishedAt: "2026-04-19",
    keywords: [
      "electronics insurance inventory",
      "home inventory for insurance",
      "device claim documentation",
    ],
    relatedSlugs: [
      "serial-numbers-and-why-they-matter",
      "proof-of-purchase-for-electronics",
      "how-to-inventory-every-device-in-your-home",
    ],
  },
  {
    slug: "what-to-store-before-you-travel",
    category: "security",
    title: "What Tech Records to Store Before You Travel",
    description:
      "A pre-trip checklist for device lists, network notes, and emergency contacts when someone else is watching the house.",
    publishedAt: "2026-04-21",
    keywords: [
      "travel tech checklist",
      "house sitter tech notes",
      "vacation home technology",
    ],
    relatedSlugs: [
      "preparing-tech-records-for-emergencies",
      "safe-sharing-of-device-details",
      "documenting-security-cameras-and-alarms",
    ],
  },
  {
    slug: "household-access-without-oversharing",
    category: "security",
    title: "Household Access Without Oversharing",
    description:
      "Roles, viewers, and practical boundaries so kids, partners, and helpers see what they need — and nothing more.",
    publishedAt: "2026-04-23",
    keywords: [
      "household access control",
      "family sharing permissions",
      "viewer access home tech",
    ],
    relatedSlugs: [
      "safe-sharing-of-device-details",
      "private-records-for-home-technology",
      "buying-for-a-shared-household",
    ],
  },
  {
    slug: "documenting-security-cameras-and-alarms",
    category: "security",
    title: "Documenting Security Cameras and Alarms",
    description:
      "Locations, accounts, monitoring details, and reset notes for cameras and alarm systems — kept where the household can find them.",
    publishedAt: "2026-04-25",
    keywords: [
      "security camera documentation",
      "home alarm records",
      "camera system inventory",
    ],
    relatedSlugs: [
      "sensors-cameras-and-automation-gear",
      "what-to-store-before-you-travel",
      "preparing-tech-records-for-emergencies",
    ],
  },
  {
    slug: "preparing-tech-records-for-emergencies",
    category: "security",
    title: "Preparing Tech Records for Emergencies",
    description:
      "Flood, fire, theft, or sudden travel — the minimum tech packet that helps you recover faster.",
    publishedAt: "2026-04-27",
    keywords: [
      "emergency tech records",
      "disaster home inventory",
      "electronics recovery checklist",
    ],
    relatedSlugs: [
      "insurance-ready-electronics-documentation",
      "isp-account-details-for-outages",
      "when-smart-devices-need-manual-backups",
    ],
  },

  // Warranties (7)
  {
    slug: "warranty-tracker-habits-that-stick",
    category: "warranties",
    title: "Warranty Tracker Habits That Actually Stick",
    description:
      "Lightweight habits for capturing coverage dates and documents so warranties stop disappearing into email archives.",
    publishedAt: "2026-05-01",
    keywords: [
      "warranty tracker",
      "track device warranties",
      "electronics warranty organizer",
    ],
    relatedSlugs: [
      "proof-of-purchase-for-electronics",
      "expiration-alerts-and-renewal-notes",
      "filing-claims-with-organized-records",
    ],
  },
  {
    slug: "proof-of-purchase-for-electronics",
    category: "warranties",
    title: "Proof of Purchase for Electronics That Lasts",
    description:
      "Receipts, order emails, and photos — how to store proof so claims and returns do not depend on a forgotten inbox.",
    publishedAt: "2026-05-03",
    keywords: [
      "electronics receipt storage",
      "proof of purchase devices",
      "warranty proof documents",
    ],
    relatedSlugs: [
      "warranty-tracker-habits-that-stick",
      "what-to-record-when-you-unbox-a-device",
      "filing-claims-with-organized-records",
    ],
  },
  {
    slug: "extended-warranties-worth-documenting",
    category: "warranties",
    title: "Extended Warranties Worth Documenting",
    description:
      "When an extended plan is worth tracking, what details to save, and how to avoid duplicate coverage confusion.",
    publishedAt: "2026-05-05",
    keywords: [
      "extended warranty tracking",
      "protection plan records",
      "electronics extended coverage",
    ],
    relatedSlugs: [
      "manufacturer-vs-retailer-coverage",
      "warranty-tracker-habits-that-stick",
      "upgrade-vs-repair-decision-guide",
    ],
  },
  {
    slug: "manufacturer-vs-retailer-coverage",
    category: "warranties",
    title: "Manufacturer vs Retailer Coverage Explained",
    description:
      "Sort manufacturer warranties, store plans, and credit-card protections so you know which policy applies first.",
    publishedAt: "2026-05-07",
    keywords: [
      "manufacturer warranty vs retailer",
      "credit card purchase protection",
      "store protection plan",
    ],
    relatedSlugs: [
      "extended-warranties-worth-documenting",
      "filing-claims-with-organized-records",
      "proof-of-purchase-for-electronics",
    ],
  },
  {
    slug: "filing-claims-with-organized-records",
    category: "warranties",
    title: "Filing Warranty Claims with Organized Records",
    description:
      "A claim walkthrough: what support asks for, how to prepare, and how a clean device record shortens the process.",
    publishedAt: "2026-05-09",
    keywords: [
      "file electronics warranty claim",
      "warranty claim checklist",
      "device support documentation",
    ],
    relatedSlugs: [
      "serial-numbers-and-why-they-matter",
      "proof-of-purchase-for-electronics",
      "warranty-tracker-habits-that-stick",
    ],
  },
  {
    slug: "expiration-alerts-and-renewal-notes",
    category: "warranties",
    title: "Warranty Expiration Alerts and Renewal Notes",
    description:
      "Set reminders that matter, skip noise, and decide whether renewing coverage is worth it before a date slips by.",
    publishedAt: "2026-05-11",
    keywords: [
      "warranty expiration reminder",
      "warranty renewal notes",
      "coverage end date tracking",
    ],
    relatedSlugs: [
      "warranty-tracker-habits-that-stick",
      "extended-warranties-worth-documenting",
      "when-to-retire-aging-devices",
    ],
  },
  {
    slug: "warranties-for-gifted-and-used-devices",
    category: "warranties",
    title: "Warranties for Gifted and Used Devices",
    description:
      "How to capture coverage when you did not buy the device yourself — gifts, hand-me-downs, and marketplace finds.",
    publishedAt: "2026-05-13",
    keywords: [
      "used device warranty",
      "gift electronics warranty",
      "secondhand device documentation",
    ],
    relatedSlugs: [
      "used-and-refurbished-buying-checklist",
      "gifts-and-returns-with-better-records",
      "proof-of-purchase-for-electronics",
    ],
  },

  // Maintenance (7)
  {
    slug: "seasonal-home-tech-maintenance",
    category: "maintenance",
    title: "Seasonal Home Tech Maintenance Checklist",
    description:
      "Spring and fall tech checkups: filters, outdoor gear, backups, and the small tasks that prevent summer and winter surprises.",
    publishedAt: "2026-05-15",
    keywords: [
      "seasonal tech maintenance",
      "home electronics checkup",
      "fall device maintenance",
    ],
    relatedSlugs: [
      "filter-and-vent-maintenance-for-tech",
      "firmware-update-habits-for-households",
      "battery-replacement-schedules",
    ],
  },
  {
    slug: "firmware-update-habits-for-households",
    category: "maintenance",
    title: "Firmware Update Habits for Households",
    description:
      "A sane cadence for routers, cameras, hubs, and appliances — without updating everything on a random Tuesday night.",
    publishedAt: "2026-05-17",
    keywords: [
      "firmware update schedule",
      "router firmware habit",
      "smart device updates",
    ],
    relatedSlugs: [
      "router-admin-notes-worth-keeping",
      "seasonal-home-tech-maintenance",
      "when-smart-devices-need-manual-backups",
    ],
  },
  {
    slug: "battery-replacement-schedules",
    category: "maintenance",
    title: "Battery Replacement Schedules for Home Devices",
    description:
      "Smoke detectors, remotes, sensors, and locks — build a replacement rhythm that does not rely on chirps at 2 a.m.",
    publishedAt: "2026-05-19",
    keywords: [
      "device battery schedule",
      "sensor battery replacement",
      "smoke detector battery reminder",
    ],
    relatedSlugs: [
      "sensors-cameras-and-automation-gear",
      "seasonal-home-tech-maintenance",
      "maintenance-logs-that-save-service-calls",
    ],
  },
  {
    slug: "cleaning-and-care-for-electronics",
    category: "maintenance",
    title: "Cleaning and Care for Household Electronics",
    description:
      "Safe cleaning habits for screens, keyboards, cameras, and vents that extend life without voiding common-sense care.",
    publishedAt: "2026-05-21",
    keywords: [
      "clean electronics safely",
      "device care tips home",
      "screen and keyboard cleaning",
    ],
    relatedSlugs: [
      "filter-and-vent-maintenance-for-tech",
      "seasonal-home-tech-maintenance",
      "when-to-retire-aging-devices",
    ],
  },
  {
    slug: "filter-and-vent-maintenance-for-tech",
    category: "maintenance",
    title: "Filter and Vent Maintenance for Home Tech",
    description:
      "HVAC filters, robot vacuums, game consoles, and NAS boxes — the airflow tasks that keep gear cooler and quieter.",
    publishedAt: "2026-05-23",
    keywords: [
      "electronics filter maintenance",
      "device vent cleaning",
      "HVAC filter schedule tech",
    ],
    relatedSlugs: [
      "appliance-records-beyond-the-kitchen",
      "smart-thermostats-and-climate-devices",
      "seasonal-home-tech-maintenance",
    ],
  },
  {
    slug: "when-to-retire-aging-devices",
    category: "maintenance",
    title: "When to Retire Aging Devices",
    description:
      "Security updates, repair costs, and household frustration — a clear framework for retiring gear on purpose.",
    publishedAt: "2026-05-25",
    keywords: [
      "retire old electronics",
      "device end of life",
      "upgrade aging tech",
    ],
    relatedSlugs: [
      "upgrade-vs-repair-decision-guide",
      "expiration-alerts-and-renewal-notes",
      "firmware-update-habits-for-households",
    ],
  },
  {
    slug: "maintenance-logs-that-save-service-calls",
    category: "maintenance",
    title: "Maintenance Logs That Save Service Calls",
    description:
      "Short logs for filters, firmware, and repairs that help technicians — and you — skip the guesswork.",
    publishedAt: "2026-05-27",
    keywords: [
      "device maintenance log",
      "home tech service history",
      "appliance repair notes",
    ],
    relatedSlugs: [
      "seasonal-home-tech-maintenance",
      "appliance-records-beyond-the-kitchen",
      "filing-claims-with-organized-records",
    ],
  },

  // Buying Guides (8)
  {
    slug: "what-to-capture-before-you-buy",
    category: "buying-guides",
    title: "What to Capture Before You Buy Home Tech",
    description:
      "Measurements, network constraints, and household needs to record before checkout so the right device arrives once.",
    publishedAt: "2026-06-01",
    keywords: [
      "before you buy electronics",
      "home tech buying checklist",
      "device purchase prep",
    ],
    relatedSlugs: [
      "comparing-devices-with-a-household-checklist",
      "choosing-devices-that-fit-your-network",
      "after-you-buy-setup-documentation",
    ],
  },
  {
    slug: "comparing-devices-with-a-household-checklist",
    category: "buying-guides",
    title: "Comparing Devices with a Household Checklist",
    description:
      "Score options against your home’s real constraints — ports, rooms, accounts, and who will actually use the thing.",
    publishedAt: "2026-06-03",
    keywords: [
      "compare electronics checklist",
      "home device comparison",
      "buying decision framework",
    ],
    relatedSlugs: [
      "what-to-capture-before-you-buy",
      "upgrade-vs-repair-decision-guide",
      "buying-for-a-shared-household",
    ],
  },
  {
    slug: "after-you-buy-setup-documentation",
    category: "buying-guides",
    title: "After You Buy: Setup Documentation That Sticks",
    description:
      "Turn the first hour of ownership into lasting records: serials, accounts, warranty dates, and where the device lives.",
    publishedAt: "2026-06-05",
    keywords: [
      "new device setup checklist",
      "after purchase documentation",
      "electronics onboarding home",
    ],
    relatedSlugs: [
      "what-to-record-when-you-unbox-a-device",
      "proof-of-purchase-for-electronics",
      "what-to-capture-before-you-buy",
    ],
  },
  {
    slug: "gifts-and-returns-with-better-records",
    category: "buying-guides",
    title: "Gifts and Returns with Better Records",
    description:
      "Keep gift receipts, return windows, and serials organized so exchanges are calm instead of frantic.",
    publishedAt: "2026-06-07",
    keywords: [
      "gift receipt electronics",
      "return window tracking",
      "holiday gadget documentation",
    ],
    relatedSlugs: [
      "warranties-for-gifted-and-used-devices",
      "proof-of-purchase-for-electronics",
      "after-you-buy-setup-documentation",
    ],
  },
  {
    slug: "choosing-devices-that-fit-your-network",
    category: "buying-guides",
    title: "Choosing Devices That Fit Your Network",
    description:
      "Wi-Fi standards, wired needs, guest isolation, and mesh quirks — buy gear that matches how your home actually connects.",
    publishedAt: "2026-06-09",
    keywords: [
      "wifi compatible devices",
      "buy for home network",
      "mesh compatible gear",
    ],
    relatedSlugs: [
      "documenting-your-home-network",
      "what-to-capture-before-you-buy",
      "mapping-access-points-and-mesh-nodes",
    ],
  },
  {
    slug: "used-and-refurbished-buying-checklist",
    category: "buying-guides",
    title: "Used and Refurbished Buying Checklist",
    description:
      "Serial checks, remaining warranty, reset status, and documentation to demand before a secondhand purchase sticks.",
    publishedAt: "2026-06-11",
    keywords: [
      "refurbished electronics checklist",
      "used device buying guide",
      "secondhand tech warranty",
    ],
    relatedSlugs: [
      "warranties-for-gifted-and-used-devices",
      "serial-numbers-and-why-they-matter",
      "upgrade-vs-repair-decision-guide",
    ],
  },
  {
    slug: "buying-for-a-shared-household",
    category: "buying-guides",
    title: "Buying Tech for a Shared Household",
    description:
      "Decide ownership, accounts, and documentation up front when multiple people will use — and inherit — the device.",
    publishedAt: "2026-06-13",
    keywords: [
      "shared household devices",
      "family tech purchases",
      "joint device ownership",
    ],
    relatedSlugs: [
      "household-access-without-oversharing",
      "safe-sharing-of-device-details",
      "comparing-devices-with-a-household-checklist",
    ],
  },
  {
    slug: "upgrade-vs-repair-decision-guide",
    category: "buying-guides",
    title: "Upgrade vs Repair: A Practical Decision Guide",
    description:
      "Weigh repair cost, remaining warranty, security support, and household friction before you replace or revive a device.",
    publishedAt: "2026-06-15",
    keywords: [
      "repair or replace electronics",
      "upgrade vs repair guide",
      "device replacement decision",
    ],
    relatedSlugs: [
      "when-to-retire-aging-devices",
      "filing-claims-with-organized-records",
      "comparing-devices-with-a-household-checklist",
    ],
  },
];

export function getCatalogEntry(slug: string) {
  return (
    KNOWLEDGE_CATALOG.find((entry) => entry.slug === slug) ??
    null
  );
}

export function getCatalogByCategory(
  category: KnowledgeCategorySlug
) {
  return KNOWLEDGE_CATALOG.filter(
    (entry) => entry.category === category
  );
}
