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

export const LANDING_PROBLEM_CARDS = [
  {
    title: "Is anything offline right now?",
    text: "Know when a printer, camera, or TV drops off your network — before someone asks why it stopped working.",
    icon: "wifi" as const,
  },
  {
    title: "What needs attention today?",
    text: "Skip the mental checklist. Get a clear view of what matters most in your home's technology.",
    icon: "pulse" as const,
  },
  {
    title: "What just joined our Wi-Fi?",
    text: "See new devices as they appear and decide what belongs in your home — without scanning room by room.",
    icon: "radar" as const,
  },
  {
    title: "Who can help me figure this out?",
    text: "Ask questions in plain English and get guidance based on what's actually in your home.",
    icon: "sparkles" as const,
  },
  {
    title: "Are we covered if something breaks?",
    text: "When a device fails, know what's protected and what to do next — without digging through email.",
    icon: "shield" as const,
  },
  {
    title: "Can the whole household stay in sync?",
    text: "Share the same picture of your home so everyone knows what's connected, covered, and due.",
    icon: "users" as const,
  },
] as const;

export const LANDING_HOME_HEALTH = {
  eyebrow: "Home Health",
  title: "See how healthy your home's technology is.",
  text: "One calm score. A short summary. Clear next steps. Open Home Tech Vault and immediately know whether your home is in good shape — and what deserves attention today.",
  score: 92,
  status: "Looking good",
  summary:
    "Your home technology is in good shape. Two devices need a little attention.",
  insights: [
    {
      title: "Epson printer offline",
      detail: "Offline for 4 days",
      tone: "attention" as const,
    },
    {
      title: "Living Room TV warranty",
      detail: "Expires in 46 days",
      tone: "suggestion" as const,
    },
    {
      title: "3 new devices discovered",
      detail: "Ready to review",
      tone: "suggestion" as const,
    },
  ],
} as const;

export const LANDING_ADVISOR = {
  eyebrow: "Home Advisor",
  title: "Your home's technology assistant.",
  text: "Home Advisor watches what is connected, what is due, and what looks off — then recommends the smartest next move in plain language.",
  items: [
    {
      title: "Printer needs attention",
      detail: "It has been offline longer than usual.",
      action: "View device",
    },
    {
      title: "Import discovered devices",
      detail: "Three Wi-Fi devices are waiting for review.",
      action: "Review now",
    },
    {
      title: "Schedule filter reminder",
      detail: "Your thermostat maintenance is coming up.",
      action: "Set reminder",
    },
  ],
} as const;

export const LANDING_DISCOVERY = {
  eyebrow: "Device Discovery",
  title: "Find what is already connected.",
  text: "Connect the desktop app once and Home Tech Vault can discover TVs, computers, printers, cameras, and smart devices on your network — then help you bring them into your home profile.",
  devices: [
    { name: "Apple TV", room: "Living Room", state: "Ready to import" },
    { name: "Office printer", room: "Office", state: "Needs review" },
    { name: "Nest Cam", room: "Entry", state: "Online" },
    { name: "Guest laptop", room: "Unknown", state: "New device" },
  ],
} as const;

export const LANDING_SEARCH = {
  eyebrow: "Smart Search",
  title: "Ask about your home like you would ask a person.",
  text: "Search for offline devices, expiring coverage, room names, or everyday questions. Smart Search understands your home — not just file names.",
  examples: [
    "Which devices are offline?",
    "What needs attention this week?",
    "Show Living Room devices",
    "Where is my router?",
  ],
} as const;

export const LANDING_DOCUMENTS = {
  eyebrow: "Warranties & documents",
  title: "Important papers, ready when you need them.",
  text: "Receipts, warranties, and manuals still matter — they just shouldn't be the headline. Keep them attached to the right devices so they show up exactly when something breaks, expires, or needs replacing.",
  items: [
    "Warranties tied to the devices they protect",
    "Receipts ready for claims and returns",
    "Manuals where you can actually find them",
  ],
} as const;

export const LANDING_FAMILY = {
  eyebrow: "Family",
  title: "One home. One shared understanding.",
  text: "Invite the people who live there. Everyone sees the same home health, discoveries, and recommendations — without texting screenshots back and forth.",
  members: [
    { name: "Alex", role: "Admin" },
    { name: "Jordan", role: "Member" },
    { name: "Sam", role: "Viewer" },
  ],
} as const;

export const LANDING_SECURITY_POINTS = [
  "Private account access with secure sign-in",
  "Secure authentication powered by Supabase",
  "Household permissions on Family plans",
  "Cloud-based access from your browser",
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
      "It helps you understand and manage the technology in your home — from home health and network discovery to recommendations, search, warranties, and shared household access.",
  },
  {
    question: "Is this just another inventory app?",
    answer:
      "No. Records still matter, but the product leads with awareness: what is healthy, what needs attention, what just joined your network, and what to do next.",
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
  {
    name: "Living Room TV",
    room: "Living Room",
    status: "Online",
  },
  {
    name: "Epson Printer",
    room: "Office",
    status: "Needs attention",
  },
  {
    name: "Front Door Camera",
    room: "Entry",
    status: "Online",
  },
  {
    name: "Wi-Fi Router",
    room: "Network",
    status: "Healthy",
  },
  {
    name: "Nest Thermostat",
    room: "Hallway",
    status: "Reminder soon",
  },
] as const;

export const LANDING_HERO_FLOATING = [
  { label: "Home Health 92%", position: "top-6 -left-2 md:-left-6" },
  { label: "3 discoveries", position: "top-16 -right-2 md:-right-8" },
  { label: "Advisor", position: "bottom-24 -left-4 md:-left-10" },
  { label: "Offline alert", position: "bottom-10 -right-3 md:-right-6" },
  { label: "Ask anything", position: "top-1/2 -right-8 hidden md:block" },
] as const;

/** Legacy exports retained so unused section components still typecheck. */
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
