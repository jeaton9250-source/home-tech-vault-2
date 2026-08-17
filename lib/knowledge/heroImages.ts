/**
 * Realistic hero photos for Knowledge Center articles.
 * Images live in /public/knowledge/heroes/{slug}.jpg
 */

export type KnowledgeHeroImage = {
  /** Path under /public */
  src: string;
  alt: string;
  caption: string;
};

export type KnowledgeHeroSource = {
  /** Unsplash photo id (without `photo-` prefix), or omit when using Pexels */
  unsplashId?: string;
  /** Pexels photo numeric id */
  pexelsId?: number;
  alt: string;
  caption: string;
};

/** Remote sources used to seed local hero files (w=1600 h=900). */
export const KNOWLEDGE_HERO_SOURCES: Record<string, KnowledgeHeroSource> = {
  "how-to-inventory-every-device-in-your-home": {
    unsplashId: "1516321318423-f06f85e504b3",
    alt: "Person reviewing devices and notes on a laptop at a kitchen table",
    caption:
      "A quiet Saturday inventory — list what you own while it is still in one place.",
  },
  "serial-numbers-and-why-they-matter": {
    unsplashId: "1550745165-9bc0b252726f",
    alt: "Close-up of consumer electronics on a desk",
    caption:
      "Serials hide on labels and in settings — photograph them before boxes disappear.",
  },
  "room-by-room-device-audit": {
    unsplashId: "1586023492125-27b2c045efd7",
    alt: "Lived-in living room with sofa and home electronics",
    caption:
      "Walk one room at a time so the audit finishes instead of becoming another abandoned list.",
  },
  "labeling-electronics-without-clutter": {
    unsplashId: "1497366216548-37526070297c",
    alt: "Organized home workspace with cables kept tidy",
    caption:
      "Small labels beat mystery cables — especially when someone else needs the charger.",
  },
  "tracking-laptops-phones-and-tablets": {
    unsplashId: "1512941937669-90a1b58e7e9c",
    alt: "Person using a phone and laptop together at home",
    caption:
      "Personal devices move between bags and rooms — ownership notes keep the household sane.",
  },
  "appliance-records-beyond-the-kitchen": {
    pexelsId: 28479466,
    alt: "Modern laundry room with washer, dryer, and household utility equipment",
    caption:
      "Laundry, HVAC, and utility equipment deserve the same model and warranty records as everyday electronics.",
  },
  "what-to-record-when-you-unbox-a-device": {
    unsplashId: "1607082348824-0a96f2a4b9da",
    alt: "Hands opening a newly delivered package on a table",
    caption:
      "Unboxing is the easiest moment to capture receipts, serials, and setup notes.",
  },
  "documenting-your-home-network": {
    unsplashId: "1558494949-ef010cbdcc31",
    alt: "Home desk with computer and networking equipment",
    caption:
      "A living network notebook beats scrambling during an outage.",
  },
  "router-admin-notes-worth-keeping": {
    unsplashId: "1488590528505-98d2b5aba04b",
    alt: "Laptop open on a desk while reviewing device settings",
    caption:
      "Admin context belongs in household notes — passwords stay in a password manager.",
  },
  "wifi-network-names-passwords-and-guests": {
    unsplashId: "1563986768609-322da13575f3",
    alt: "Someone connecting a phone to wireless internet",
    caption:
      "SSID names and guest access notes save endless text threads.",
  },
  "mapping-access-points-and-mesh-nodes": {
    unsplashId: "1606904825846-647eb07f5be2",
    alt: "Wireless access point on a shelf in a home hallway",
    caption:
      "Know which node covers which floor before a unit dies.",
  },
  "isp-account-details-for-outages": {
    unsplashId: "1454165804606-c3d57bc86b40",
    alt: "Laptop open with account paperwork nearby",
    caption:
      "Account numbers and modem IDs shorten hold times when the internet drops.",
  },
  "ethernet-ports-and-wired-device-notes": {
    pexelsId: 442150,
    alt: "Ethernet cables plugged into a network switch",
    caption:
      "Wall jacks and switch ports deserve labels before the next move.",
  },
  "network-equipment-replacement-checklist": {
    unsplashId: "1597872200969-2b65d56bd16b",
    alt: "Person working with home networking hardware",
    caption:
      "Swap gear calmly when passwords, ports, and ISP settings are already written down.",
  },
  "organizing-smart-home-devices": {
    unsplashId: "1558002038-1055907df827",
    alt: "Living room with smart speakers and connected home devices",
    caption:
      "One household inventory above the vendor apps everyone already uses.",
  },
  "hubs-bridges-and-controllers-inventory": {
    unsplashId: "1518444065439-e933c06ce9cd",
    alt: "Media shelf with smart home hubs and controllers",
    caption:
      "Document the brains of the house first — hubs and bridges.",
  },
  "smart-lights-switches-and-scenes-records": {
    unsplashId: "1565814329452-e1efa11c5b89",
    alt: "Warm lighting in a modern living room at dusk",
    caption:
      "Which switch runs which scene should not live only in one person’s head.",
  },
  "voice-assistants-and-speaker-notes": {
    unsplashId: "1545454675-3531b543be5d",
    alt: "Smart speaker on a kitchen counter",
    caption:
      "Room names and account ownership keep speakers replaceable.",
  },
  "sensors-cameras-and-automation-gear": {
    pexelsId: 27662879,
    alt: "Smart home security camera and sensors arranged together",
    caption:
      "Sensors, cameras, and automation gear are easier to maintain when every device has a clear record.",
  },
  "smart-thermostats-and-climate-devices": {
    unsplashId: "1545259741-2ea3ebf61fa3",
    alt: "Smart thermostat on a residential wall",
    caption:
      "Model numbers and installer notes matter on the first cold night.",
  },
  "when-smart-devices-need-manual-backups": {
    pexelsId: 27691024,
    alt: "Home technology workspace with laptop and external backup drives",
    caption:
      "A small offline backup of important settings can save hours when a smart device needs to be rebuilt.",
  },
  "private-records-for-home-technology": {
    unsplashId: "1614064641938-3bbee52942c7",
    alt: "Padlock resting on a laptop keyboard",
    caption:
      "Decide what belongs in a vault versus a password manager.",
  },
  "safe-sharing-of-device-details": {
    unsplashId: "1522071820081-009f0129c71c",
    alt: "Family collaborating around a laptop together",
    caption:
      "Share enough for daily life — not every admin credential.",
  },
  "insurance-ready-electronics-documentation": {
    unsplashId: "1450101499163-c8848c66ca85",
    alt: "Home desk with documents, receipts, and a laptop",
    caption:
      "Photos, serials, and receipts before you ever need an adjuster.",
  },
  "what-to-store-before-you-travel": {
    unsplashId: "1488646953014-85cb44e25828",
    alt: "Packed suitcase ready by the door for a trip",
    caption:
      "Leave the house sitter a clear tech packet, not a scavenger hunt.",
  },
  "household-access-without-oversharing": {
    unsplashId: "1511895426328-dc8714191300",
    alt: "Parents and child using devices together on a couch",
    caption:
      "Roles and viewers keep helpers useful without handing over everything.",
  },
  "documenting-security-cameras-and-alarms": {
    pexelsId: 16423102,
    alt: "Modern home security cameras and connected security devices",
    caption:
      "Document camera locations, accounts, and reset details before something needs troubleshooting.",
  },
  "preparing-tech-records-for-emergencies": {
    unsplashId: "1504384308090-c894fdcc538d",
    alt: "Emergency bag and documents prepared at home",
    caption:
      "A minimum tech packet helps you recover faster after flood, fire, or theft.",
  },
  "warranty-tracker-habits-that-stick": {
    unsplashId: "1554224155-6726b3ff858f",
    alt: "Notebook and calendar used for household tracking",
    caption:
      "Lightweight habits beat a perfect system you abandon in a week.",
  },
  "proof-of-purchase-for-electronics": {
    unsplashId: "1556742049-0cfed4f6a45d",
    alt: "Receipt after purchasing electronics",
    caption:
      "Save proof where claims and returns can find it — not only in email.",
  },
  "extended-warranties-worth-documenting": {
    pexelsId: 30559957,
    alt: "Electronic remote resting on a printed warranty document",
    caption:
      "Keep warranty terms and coverage dates beside the device record so the protection is actually usable.",
  },
  "manufacturer-vs-retailer-coverage": {
    pexelsId: 4792282,
    alt: "Expanding file folder with household paperwork on a wooden desk",
    caption:
      "Know which policy applies first — manufacturer, store, or card benefit.",
  },
  "filing-claims-with-organized-records": {
    unsplashId: "1486312338219-ce68d2c6f44d",
    alt: "Person on a laptop call with documents nearby",
    caption:
      "Serial, receipt, and symptom notes ready before you are on hold.",
  },
  "expiration-alerts-and-renewal-notes": {
    unsplashId: "1434030216411-0b793f4b4173",
    alt: "Planning deadlines with notes and a laptop",
    caption:
      "Remind early on expensive coverage — skip noise for trivial accessories.",
  },
  "warranties-for-gifted-and-used-devices": {
    unsplashId: "1513201099705-a9746e1e201f",
    alt: "Gift box with electronics accessories",
    caption:
      "Gifts and hand-me-downs still need serials and whatever proof you can gather.",
  },
  "seasonal-home-tech-maintenance": {
    pexelsId: 4008556,
    alt: "Person carefully cleaning and maintaining a laptop",
    caption:
      "Seasonal maintenance is a good time to clean, inspect, update, and document the technology around your home.",
  },
  "firmware-update-habits-for-households": {
    pexelsId: 34353879,
    alt: "Smartphone displaying a software and firmware update screen",
    caption:
      "Keep updates deliberate and documented instead of discovering outdated firmware during a problem.",
  },
  "battery-replacement-schedules": {
    unsplashId: "1609599006353-e629aaabfeae",
    alt: "Household batteries and remotes on a table",
    caption:
      "Replace on a rhythm — not when something chirps at 2 a.m.",
  },
  "cleaning-and-care-for-electronics": {
    unsplashId: "1496181133206-80ce9b88a853",
    alt: "Laptop being cleaned carefully at home",
    caption:
      "Safe cleaning habits extend life without heroic (or risky) methods.",
  },
  "filter-and-vent-maintenance-for-tech": {
    unsplashId: "1581578731548-c64695cc6952",
    alt: "Home air system and filter maintenance",
    caption:
      "Airflow tasks keep HVAC, consoles, and NAS boxes cooler and quieter.",
  },
  "when-to-retire-aging-devices": {
    pexelsId: 325153,
    alt: "Flat lay of older personal electronics on a wooden table",
    caption:
      "Retire on purpose when security updates and repair costs no longer make sense.",
  },
  "maintenance-logs-that-save-service-calls": {
    unsplashId: "1581092160562-40aa08e78837",
    alt: "Person reviewing technical notes and tools at a workbench",
    caption:
      "Short logs help technicians — and you — skip the guesswork.",
  },
  "what-to-capture-before-you-buy": {
    unsplashId: "1472851294608-062f824d29cc",
    alt: "Person comparing products before a purchase",
    caption:
      "Measurements and network constraints beat a wrong device at the door.",
  },
  "comparing-devices-with-a-household-checklist": {
    unsplashId: "1460925895917-afdab827c52f",
    alt: "Checklist and laptop used to compare options",
    caption:
      "Score options against your home’s real ports, rooms, and people.",
  },
  "after-you-buy-setup-documentation": {
    unsplashId: "1516321497487-e288fb19713f",
    alt: "Setting up a new computer with notes nearby",
    caption:
      "The first hour of ownership is the best time to create lasting records.",
  },
  "gifts-and-returns-with-better-records": {
    unsplashId: "1513885535751-8b9238bd345a",
    alt: "Wrapped gifts in a living room",
    caption:
      "Gift receipts and return windows stay calm when they are already filed.",
  },
  "choosing-devices-that-fit-your-network": {
    pexelsId: 28348054,
    alt: "Modern wireless router representing a home Wi-Fi network",
    caption:
      "Choose devices for the network you actually have, including Wi-Fi coverage, wired needs, and compatibility.",
  },
  "used-and-refurbished-buying-checklist": {
    unsplashId: "1556740758-90de374c12ad",
    alt: "Inspecting electronics before buying used",
    caption:
      "Serial checks and reset status before a secondhand purchase sticks.",
  },
  "buying-for-a-shared-household": {
    unsplashId: "1529156069898-49953e39b3ac",
    alt: "Friends discussing a shared purchase at home",
    caption:
      "Decide ownership and accounts up front when more than one person will inherit the device.",
  },
  "upgrade-vs-repair-decision-guide": {
    unsplashId: "1581091226825-a6a2a5aee158",
    alt: "Technician repairing electronics at a workbench",
    caption:
      "Weigh repair cost, remaining warranty, and household friction before you replace.",
  },
};

export function getKnowledgeHeroImage(
  slug: string
): KnowledgeHeroImage {
  const entry = KNOWLEDGE_HERO_SOURCES[slug];
  if (!entry) {
    return {
      src: "/knowledge/heroes/_fallback.jpg",
      alt: "Home technology in a lived-in household",
      caption: "Home Tech Vault Knowledge Center",
    };
  }

  return {
    src: `/knowledge/heroes/${slug}.jpg`,
    alt: entry.alt,
    caption: entry.caption,
  };
}
