import {
  FREE_DEVICE_LIMIT,
  FREE_DOCUMENT_LIMIT,
} from "@/lib/permissions/plans";

export const LANDING_PUBLIC_SECTION_IDS = {
  homeHealth: "home-health",
  problems: "problems",
  advisor: "advisor",
  discovery: "discovery",
  search: "smart-search",
  documents: "documents",
  family: "family",
  pricing: "pricing",
  faq: "faq",
  // Legacy anchors preserved for existing links
  digitalBinder: "home-health",
  howItWorks: "advisor",
  features: "advisor",
  estimator: "home-health",
} as const;

export type LandingPublicSectionId =
  (typeof LANDING_PUBLIC_SECTION_IDS)[keyof typeof LANDING_PUBLIC_SECTION_IDS];

export const LANDING_HERO_REASSURANCE = [
  "Free to get started",
  "No credit card required",
  "Built for real homes",
] as const;

export const LANDING_HERO_SUBHEADLINES = [
  "Understand everything connected to your home.",
  "Protect what matters.",
  "Stay ahead of problems.",
] as const;

export const LANDING_PROBLEM_CARDS = [
  {
    title: "What is connected right now?",
    text: "Most homeowners have dozens of devices, hubs, and networks running quietly—without a single view of what is online.",
    icon: "wifi" as const,
  },
  {
    title: "What is protected if something breaks?",
    text: "Warranties, receipts, and manuals live in drawers or buried in email. When something fails, finding proof takes hours.",
    icon: "shield" as const,
  },
  {
    title: "What needs attention today?",
    text: "Skip the mental checklist. Get proactive guidance on updates, filter changes, and security before issues arise.",
    icon: "pulse" as const,
  },
  {
    title: "What technology do we actually own?",
    text: "Understand every piece of technology in your home—from smart TVs and mesh routers to HVAC controls and appliances.",
    icon: "radar" as const,
  },
] as const;

export const LANDING_HOME_HEALTH = {
  eyebrow: "Home Health",
  title: "Meet Home Pulse. A serene view of your home.",
  text: "Opening Home Tech Vault feels like checking Apple Health for your home. One clear score, instant status, and quiet confidence that everything is operating smoothly.",
  score: 98,
  status: "Everything clear",
  summary:
    "Your home's technology is operating at peak health. All 34 connected devices are active and protected.",
  insights: [
    {
      title: "Living Room OLED TV Warranty",
      detail: "Protected · Coverage active through Sep 2026",
      tone: "protected" as const,
    },
    {
      title: "Eero Mesh Network Update",
      detail: "Recommended · Security patch ready for 3 AM",
      tone: "attention" as const,
    },
    {
      title: "3 New Connected Devices Discovered",
      detail: "Discovered · Ready to bring into your home profile",
      tone: "suggestion" as const,
    },
  ],
} as const;

export const LANDING_ADVISOR = {
  eyebrow: "Home Advisor",
  title: "Proactive guidance before problems happen.",
  text: "Home Advisor understands what is connected, what is protected, and what is due — giving you intelligent recommendations in plain language.",
  items: [
    {
      title: "LG OLED Warranty Auto-Protected",
      detail: "Receipt & serial number auto-linked to your warranty vault.",
      action: "Protected",
    },
    {
      title: "Eero Pro 6E Firmware Patch",
      detail: "Security update available. Can auto-install during off-peak hours.",
      action: "Ready",
    },
    {
      title: "HVAC Air Filter Replacement Due",
      detail: "Quarterly filter maintenance window opens next Tuesday.",
      action: "Scheduled",
    },
  ],
} as const;

export const LANDING_DISCOVERY = {
  eyebrow: "Discovery",
  title: "A home becoming understood.",
  text: "Home Tech Vault quietly discovers connected technology across your home—smart TVs, mesh hubs, printers, cameras, and audio systems—bringing them into one clear picture.",
  devices: [
    { name: "Sonos Arc Soundbar", room: "Living Room", state: "Connected & Protected" },
    { name: "Apple TV 4K", room: "Family Room", state: "Optimal Signal" },
    { name: "Eero Pro 6E Gateway", room: "Hallway", state: "34 Hubs Active" },
    { name: "Lutron Smart Bridge", room: "Utility", state: "Firmware Current" },
  ],
} as const;

export const LANDING_SEARCH = {
  eyebrow: "Search Your Home",
  title: "Ask your home anything in plain English.",
  text: "Search for expiring coverage, room technology, or network status. Natural language search understands what is in your home without technical jargon.",
  examples: [
    "What warranty expires next?",
    "Is my living room TV protected?",
    "Which devices are offline?",
    "What is connected to my Wi-Fi?",
  ],
} as const;

export const LANDING_DOCUMENTS = {
  eyebrow: "Protection",
  title: "Documents, receipts, warranties, and maintenance. All connected.",
  text: "Never search through email or drawers again. Every receipt, manual, warranty card, and maintenance schedule is attached directly to the technology it protects.",
  items: [
    "Warranties auto-tracked and linked to proof of purchase",
    "Receipts ready for insurance claims and returns",
    "Manuals and setup guides accessible in one tap",
    "Maintenance schedules to protect hardware longevity",
  ],
} as const;

export const LANDING_FAMILY = {
  eyebrow: "Household Sharing",
  title: "Confidence for the whole home.",
  text: "Share household awareness with family members so everyone knows what is connected, covered, and how to get help when technology acts up.",
  items: [
    "Invite family members with simple, secure access",
    "Shared peace of mind for parents, partners, and house sitters",
    "Keep sensitive network details protected with role-based access",
  ],
  members: [
    { name: "Alex", role: "Owner" },
    { name: "Jordan", role: "Family Member" },
    { name: "Sam", role: "Viewer" },
  ],
} as const;

export const LANDING_SECURITY_POINTS = [
  "Private account access with secure sign-in",
  "Private storage for device photos and documents",
  "Household access controlled by roles and permissions",
  "HTTPS plus modern browser security protections",
  "Data separated by account and household",
] as const;

export const LANDING_PRICING_PLANS = [
  {
    id: "free" as const,
    price: "$0",
    period: "forever",
    note: `Start with up to ${FREE_DEVICE_LIMIT} devices and ${FREE_DOCUMENT_LIMIT} documents.`,
    highlighted: false,
    badge: null as string | null,
  },
  {
    id: "pro" as const,
    price: "$7.99",
    period: "per month",
    note: "Unlimited home profile plus deeper network insights.",
    highlighted: false,
    badge: null as string | null,
  },
  {
    id: "family" as const,
    price: "$14.99",
    period: "per month",
    note: "Everything in Pro with shared household access.",
    highlighted: true,
    badge: "Best Value",
  },
] as const;

export const LANDING_FAQ_ITEMS = [
  {
    question: "What does Home Tech Vault actually do?",
    answer:
      "It provides a clear operating system for your home — from home health and device discovery to AI recommendations, natural language search, warranty protection, and shared household access.",
  },
  {
    question: "Is this just another inventory app?",
    answer:
      "No. Home Tech Vault is built around absolute awareness: what is connected, what is protected, what needs attention, and what to do next.",
  },
  {
    question: "Do I need special hardware?",
    answer:
      "No. Get started in your browser. An optional desktop connector helps discover devices already on your home network.",
  },
  {
    question: "Can I use it on my phone?",
    answer:
      "Yes. Home Tech Vault works in mobile browsers so you can check home health, search, and recommendations wherever you are.",
  },
  {
    question: "Is it free to get started?",
    answer: `Yes. The Free plan includes up to ${FREE_DEVICE_LIMIT} devices and ${FREE_DOCUMENT_LIMIT} documents with no credit card required.`,
  },
  {
    question: "Can other household members use it?",
    answer:
      "Yes. The Family plan lets you invite household members with viewer, member, or admin roles so everyone shares the same home view.",
  },
] as const;

export const LANDING_HERO_DEVICES = [
  { name: "Sonos Arc", status: "Optimal · Living Room" },
  { name: "LG OLED 4K", status: "Protected · Family Room" },
  { name: "Eero Pro 6E", status: "34 Devices · Gateway" },
  { name: "Apple TV 4K", status: "Active · Master Bedroom" },
] as const;

export const LANDING_BINDER_CATEGORIES = [
  {
    label: "Devices",
    detail: "TVs, computers, cameras, routers, and more.",
    icon: "laptop" as const,
  },
  {
    label: "Network",
    detail: "Connected devices and discovery.",
    icon: "wifi" as const,
  },
] as const;

export const LANDING_WORKFLOW_STEPS = [
  {
    step: "1",
    title: "See your home health",
    text: "Open a calm view of what looks healthy and what needs attention.",
  },
  {
    step: "2",
    title: "Discover connected devices",
    text: "Review what is already on your network.",
  },
  {
    step: "3",
    title: "Follow Home Advisor",
    text: "Take the next recommended step in plain language.",
  },
  {
    step: "4",
    title: "Ask anything later",
    text: "Search your home like you would ask a person.",
  },
] as const;

export const LANDING_ESTIMATOR_QUESTIONS = [
  {
    id: "tvs",
    label: "How many TVs?",
    options: [
      { label: "0–1", value: 1 },
      { label: "2–3", value: 3 },
      { label: "4+", value: 5 },
    ],
  },
  {
    id: "computers",
    label: "How many computers or tablets?",
    options: [
      { label: "0–2", value: 1 },
      { label: "3–5", value: 4 },
      { label: "6+", value: 7 },
    ],
  },
  {
    id: "smartHome",
    label: "How many smart-home devices?",
    options: [
      { label: "0–3", value: 2 },
      { label: "4–8", value: 6 },
      { label: "9+", value: 11 },
    ],
  },
  {
    id: "gaming",
    label: "How many gaming or entertainment devices?",
    options: [
      { label: "0–2", value: 1 },
      { label: "3–5", value: 4 },
      { label: "6+", value: 7 },
    ],
  },
] as const;

export const LANDING_ESTIMATOR_PROMPTS = [
  "How many devices run in your home?",
  "How many warranties do you currently keep track of?",
  "How often do you search for home tech documents?",
] as const;

export const LANDING_SCENARIOS = [
  {
    title: "Something goes offline",
    text: "Spot the device that dropped and know what to check next.",
  },
] as const;

export const LANDING_PRODUCT_FEATURES = [
  {
    headline: "Home health at a glance.",
    text: "Know whether your home looks healthy and what needs attention.",
    mock: "device" as const,
  },
  {
    headline: "Warranties stay connected.",
    text: "Coverage and receipts are ready when something breaks.",
    mock: "warranty" as const,
  },
  {
    headline: "Maintenance is easier to remember.",
    text: "Gentle reminders for the care your devices need.",
    mock: "maintenance" as const,
  },
  {
    headline: "Your household stays aligned.",
    text: "Share one clear picture of the home.",
    mock: "household" as const,
  },
] as const;
