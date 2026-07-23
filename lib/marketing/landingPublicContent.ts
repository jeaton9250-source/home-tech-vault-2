import {
  FREE_DEVICE_LIMIT,
  FREE_DOCUMENT_LIMIT,
} from "@/lib/permissions/plans";

export const LANDING_PUBLIC_SECTION_IDS = {
  digitalBinder: "digital-binder",
  howItWorks: "how-it-works",
  features: "features",
  pricing: "pricing",
  estimator: "estimator",
  faq: "faq",
} as const;

export type LandingPublicSectionId =
  (typeof LANDING_PUBLIC_SECTION_IDS)[keyof typeof LANDING_PUBLIC_SECTION_IDS];

export const LANDING_HERO_REASSURANCE = [
  "Free to get started",
  "No credit card required",
  "Built for real homeowners",
] as const;

export const LANDING_PROBLEM_CARDS = [
  {
    title: "Where is the receipt?",
    text: "The device is right in front of you. The paperwork is nowhere to be found.",
    icon: "receipt" as const,
  },
  {
    title: "Is it still under warranty?",
    text: "Know what is covered before paying for a repair or replacement.",
    icon: "shield" as const,
  },
  {
    title: "Which Wi-Fi password is current?",
    text: "Keep your network details somewhere safer than a sticky note.",
    icon: "wifi" as const,
  },
  {
    title: "Where is the manual?",
    text: "Save the correct guide with the device instead of searching again.",
    icon: "book" as const,
  },
  {
    title: "When was it last maintained?",
    text: "Keep track of cleaning, updates, filters, backups, and service.",
    icon: "wrench" as const,
  },
  {
    title: "What technology do we own?",
    text: "See every household device without checking every room.",
    icon: "layout" as const,
  },
] as const;

export const LANDING_BINDER_CATEGORIES = [
  {
    label: "Devices",
    detail: "TVs, computers, cameras, routers, and more.",
    icon: "laptop" as const,
  },
  {
    label: "Documents",
    detail: "Receipts, serial numbers, and purchase records.",
    icon: "file" as const,
  },
  {
    label: "Warranties",
    detail: "Coverage dates and expiration reminders you enter.",
    icon: "shield" as const,
  },
  {
    label: "Maintenance",
    detail: "Filters, updates, cleaning, and service history.",
    icon: "wrench" as const,
  },
  {
    label: "Network",
    detail: "Wi-Fi details and connected device notes.",
    icon: "wifi" as const,
  },
  {
    label: "Photos",
    detail: "Pictures linked to the devices they belong to.",
    icon: "image" as const,
  },
] as const;

export const LANDING_WORKFLOW_STEPS = [
  {
    step: "1",
    title: "Add a device",
    text: "Start with a TV, computer, appliance, camera, router, or any other technology.",
  },
  {
    step: "2",
    title: "Save the important details",
    text: "Add the receipt, serial number, warranty, manual, photos, and purchase information.",
  },
  {
    step: "3",
    title: "Set reminders",
    text: "Track maintenance and important warranty dates before they are forgotten.",
  },
  {
    step: "4",
    title: "Find anything later",
    text: "Open the device and everything connected to it is already there.",
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
    title: "Filing an insurance claim",
    text: "Quickly find the model, serial number, purchase details, value, and photos connected to the device.",
  },
  {
    title: "Requesting a warranty repair",
    text: "Open the device record and see the warranty details and proof of purchase you saved.",
  },
  {
    title: "Selling or trading a device",
    text: "Share accurate specs, purchase date, and condition notes without digging through old email.",
  },
  {
    title: "Moving into a new home",
    text: "Bring an organized record of what you own instead of starting from scratch in every room.",
  },
  {
    title: "Helping a family member troubleshoot",
    text: "Find the right manual, network note, or model number when someone asks for help.",
  },
  {
    title: "Replacing a router",
    text: "Keep Wi-Fi names, passwords, and setup notes where the whole household can find them.",
  },
  {
    title: "Preparing a home for sale",
    text: "Document appliances, smart devices, and warranties buyers may ask about.",
  },
  {
    title: "Sharing household access",
    text: "Invite family members on a Family plan so everyone can view or update the same records.",
  },
] as const;

export const LANDING_PRODUCT_FEATURES = [
  {
    headline: "Every device gets its own home.",
    text: "Keep purchase details, model information, photos, status, network information, and related records together.",
    mock: "device" as const,
  },
  {
    headline: "Receipts and warranties stay connected.",
    text: "Stop searching email, cloud folders, and junk drawers when something breaks.",
    mock: "warranty" as const,
  },
  {
    headline: "Maintenance becomes easier to remember.",
    text: "Track recurring care, software updates, cleaning, backups, and service history.",
    mock: "maintenance" as const,
  },
  {
    headline: "Your household stays on the same page.",
    text: "Give the right people access on Family plans without handing over control of everything.",
    mock: "household" as const,
  },
] as const;

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
    note: `Organize up to ${FREE_DEVICE_LIMIT} devices and ${FREE_DOCUMENT_LIMIT} documents.`,
    highlighted: false,
    badge: null as string | null,
  },
  {
    id: "pro" as const,
    price: "$7.99",
    period: "per month",
    note: "Unlimited inventory plus advanced home insights.",
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
    question: "What can I store in Home Tech Vault?",
    answer:
      "Devices, receipts, warranties, manuals, maintenance records, photos, network notes, and related documents — organized around the technology in your home.",
  },
  {
    question: "Is Home Tech Vault only for smart-home devices?",
    answer:
      "No. It works for TVs, computers, appliances, cameras, routers, printers, game consoles, and any other technology you want to keep organized.",
  },
  {
    question: "Can I use it for appliances and computers?",
    answer:
      "Yes. Add any household technology, attach the details that matter, and keep everything connected in one place.",
  },
  {
    question: "Do I need to install anything?",
    answer:
      "No installation is required to get started. Home Tech Vault runs in your browser. An optional desktop connector is available if you want help discovering devices on your home network.",
  },
  {
    question: "Can I access it from my phone?",
    answer:
      "Yes. Home Tech Vault is designed to work in mobile browsers, so you can look things up from your phone when you need them.",
  },
  {
    question: "Is it free to get started?",
    answer:
      `Yes. The Free plan includes up to ${FREE_DEVICE_LIMIT} devices and ${FREE_DOCUMENT_LIMIT} documents with no credit card required.`,
  },
  {
    question: "Can other household members use it?",
    answer:
      "Yes. The Family plan lets you invite household members with viewer, member, or admin roles so everyone can share the same organized records.",
  },
] as const;

export const LANDING_HERO_DEVICES = [
  {
    name: "Living Room TV",
    room: "Living Room",
    status: "Active warranty",
  },
  {
    name: "Home Office MacBook",
    room: "Office",
    status: "3 documents",
  },
  {
    name: "Front Door Camera",
    room: "Entry",
    status: "Online",
  },
  {
    name: "Wi-Fi Router",
    room: "Network closet",
    status: "Network saved",
  },
  {
    name: "Smart Thermostat",
    room: "Hallway",
    status: "Maintenance due soon",
  },
] as const;

export const LANDING_HERO_FLOATING = [
  { label: "TV", position: "top-6 -left-2 md:-left-6" },
  { label: "Laptop", position: "top-16 -right-2 md:-right-8" },
  { label: "Router", position: "bottom-24 -left-4 md:-left-10" },
  { label: "Doorbell", position: "bottom-10 -right-3 md:-right-6" },
  { label: "Game console", position: "top-1/2 -right-8 hidden md:block" },
] as const;
