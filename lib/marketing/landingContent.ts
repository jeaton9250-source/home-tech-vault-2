/** Marketing homepage content — static copy and demo fixtures. */

export const LANDING_TAGLINE = "Your home's digital memory.";

export const LANDING_SUPPORTING_MESSAGE =
  "Home Tech Vault quietly remembers the details, so you can enjoy your home.";

export const LANDING_DEMO_LABEL = "Demo data";

export const landingHeroPulse = {
  headline: "Everything looks good today.",
  connectedDevices: 28,
  warrantiesExpiring: 2,
  maintenanceReminders: 1,
  lastScanLabel: "2 minutes ago",
} as const;

export const landingHomePulseSummary = {
  headline: landingHeroPulse.headline,
  items: [
    {
      text: "Your home is organized.",
      tone: "success" as const,
    },
    {
      text: "Your devices are up to date.",
      tone: "success" as const,
    },
    {
      text: "One warranty expires next month.",
      tone: "warning" as const,
    },
    {
      text: "One new device needs your attention.",
      tone: "info" as const,
    },
  ],
} as const;

export const landingHomeStories = [
  {
    id: "tv",
    prompt: "Bought a new TV?",
    response: "We'll remember the receipt.",
    accent: "from-amber-50/80 to-orange-50/40",
    ring: "ring-amber-200/40",
  },
  {
    id: "manual",
    prompt: "Need a manual?",
    response: "It's already here.",
    accent: "from-sky-50/80 to-blue-50/40",
    ring: "ring-sky-200/40",
  },
  {
    id: "wifi",
    prompt: "Wondering what's on your Wi‑Fi?",
    response: "We'll help you identify it.",
    accent: "from-emerald-50/80 to-teal-50/40",
    ring: "ring-emerald-200/40",
  },
  {
    id: "warranty",
    prompt: "Warranty about to expire?",
    response: "We'll remind you.",
    accent: "from-rose-50/80 to-pink-50/40",
    ring: "ring-rose-200/40",
  },
] as const;

export const landingConnectorFlow = [
  { step: "Download", detail: "Install once on your Mac or PC" },
  { step: "Scan Your Home", detail: "A quiet check of what's connected" },
  {
    step: "Home Tech Vault remembers everything",
    detail: "Devices, details, and updates — kept for you",
  },
] as const;

export const landingConnectorCategories = [
  "Computers",
  "TVs",
  "Printers",
  "Smart Speakers",
  "Game Consoles",
  "Home Office",
  "Aquarium Equipment",
  "Security Devices",
  "Smart Home",
] as const;

export const landingRoomCards = [
  {
    room: "Living Room",
    accent: "from-[#f7f2eb] to-[#efe8de]",
    devices: ["Samsung TV", "Apple TV", "Xbox", "Soundbar"],
  },
  {
    room: "Kitchen",
    accent: "from-[#f0f5f0] to-[#e6efe6]",
    devices: ["Nest Hub", "Smart Fridge"],
  },
  {
    room: "Office",
    accent: "from-[#eef2f7] to-[#e4eaf2]",
    devices: ["MacBook Pro", "Printer", "NAS"],
  },
  {
    room: "Garage",
    accent: "from-[#f3f0ee] to-[#ebe6e2]",
    devices: ["Camera", "Door Sensor", "Robot Vacuum"],
  },
] as const;

export const landingMemoryMoments = [
  {
    text: "Warranty expires next month.",
    tone: "warning" as const,
  },
  {
    text: "Printer changed IP address.",
    tone: "info" as const,
  },
  {
    text: "Robot Vacuum came back online.",
    tone: "success" as const,
  },
  {
    text: "Receipt uploaded.",
    tone: "success" as const,
  },
  {
    text: "Manual saved.",
    tone: "success" as const,
  },
  {
    text: "Maintenance reminder tomorrow.",
    tone: "warning" as const,
  },
] as const;

export const landingVaultCards = [
  {
    label: "Devices",
    detail: "Every gadget, where it lives, and when you got it.",
    wash: "from-[#f8f6f2] to-[#f0ece4]",
  },
  {
    label: "Network",
    detail: "Know what's connected — and when it was last seen.",
    wash: "from-[#eef6f1] to-[#e3efe8]",
  },
  {
    label: "Documents",
    detail: "Serial numbers, notes, and records — safe together.",
    wash: "from-[#f0f3f8] to-[#e6ebf2]",
  },
  {
    label: "Receipts",
    detail: "Never lose another receipt when something matters.",
    wash: "from-[#faf3ee] to-[#f2e8df]",
  },
  {
    label: "Manuals",
    detail: "Every manual, ready when you need it.",
    wash: "from-[#f2f4fa] to-[#e8ecf5]",
  },
  {
    label: "Maintenance",
    detail: "Filters, service dates, and gentle reminders.",
    wash: "from-[#f3f6f0] to-[#e8efe3]",
  },
  {
    label: "Subscriptions",
    detail: "Streaming, apps, and renewals — nothing sneaks up on you.",
    wash: "from-[#f8f2f8] to-[#efe6ef]",
  },
  {
    label: "Warranties",
    detail: "Coverage, expiration dates, and peace of mind.",
    wash: "from-[#fdf6ee] to-[#f5ebdf]",
  },
] as const;

export const landingPricingPlans = [
  {
    id: "free" as const,
    price: "$0",
    period: "forever",
    note: "A calm starting point for remembering your home.",
    highlighted: false,
    badge: null,
    features: [
      "Devices & documents",
      "Receipts & manuals",
      "Manual network scans",
      "Discovery review",
      "Import devices",
    ],
  },
  {
    id: "pro" as const,
    price: "$7.99",
    period: "per month",
    note: "Home Pulse keeps watch, so you don't have to.",
    highlighted: false,
    badge: null,
    features: [
      "Automatic monitoring",
      "Home Pulse",
      "Timeline",
      "Live network updates",
      "Recommendations",
    ],
  },
  {
    id: "family" as const,
    price: "$14.99",
    period: "per month",
    note: "For households who care for their home together.",
    highlighted: true,
    badge: "Best Value",
    features: [
      "Everything in Pro",
      "Shared households",
      "Roles",
      "Permissions",
    ],
  },
] as const;

export const landingConnectorDemoSummary = {
  connectorName: "Morgan Home Mac",
  connectorStatus: "Watching quietly",
  lastScanLabel: "4 minutes ago",
  devicesDiscovered: 18,
  devicesMatched: 12,
  needsReview: 3,
  onlineNow: 14,
} as const;
