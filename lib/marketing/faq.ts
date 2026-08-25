import { FREE_DEVICE_LIMIT } from "@/lib/permissions/plans";

export type FaqCategory =
  | "Accounts"
  | "Devices"
  | "Documents"
  | "Internet & Wi-Fi"
  | "Privacy"
  | "Billing"
  | "Family";

export type FaqItem = {
  question: string;
  answer: string;
  category: FaqCategory;
};

export const FAQ_CATEGORIES: FaqCategory[] = [
  "Accounts",
  "Devices",
  "Documents",
  "Internet & Wi-Fi",
  "Privacy",
  "Billing",
  "Family",
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    category: "Accounts",
    question: "Do I need an account to explore Home Tech Vault?",
    answer:
      "No. The interactive demo opens a complete sample vault with no signup required. Create a free account when you are ready to save your own inventory.",
  },
  {
    category: "Accounts",
    question: "Can I switch plans later?",
    answer:
      "Yes. Start on Free and upgrade to Pro or Family whenever your household needs more capacity or sharing. Billing changes are managed from your account settings.",
  },
  {
    category: "Devices",
    question: "How many devices can I track?",
    answer:
      `Free includes up to ${FREE_DEVICE_LIMIT} devices. Pro and Family plans include unlimited devices, warranties, and maintenance records.`,
  },
  {
    category: "Devices",
    question: "Can I organize devices by room?",
    answer:
      "Yes. Home Tech Vault supports room-by-room organization so you can see technology the way your home is actually laid out.",
  },
  {
    category: "Documents",
    question: "Can I upload receipts and manuals?",
    answer:
      "Absolutely. Attach receipts, warranty cards, and manuals directly to the devices they protect. Upload once, find instantly when something breaks.",
  },
  {
    category: "Documents",
    question: "What file types are supported?",
    answer:
      "Common document formats including PDF and images are supported. Files stay linked to the device record they belong to.",
  },
  {
    category: "Internet & Wi-Fi",
    question: "Can Home Tech Vault keep my Wi-Fi details?",
    answer:
      "Yes. Keep router information, Wi-Fi notes, and connected device records in one dependable place — especially helpful when troubleshooting or sharing access.",
  },
  {
    category: "Internet & Wi-Fi",
    question: "Is network monitoring included on every plan?",
    answer:
      "Basic home Wi-Fi information is available on all plans. Advanced connectivity features are included with Pro and Family.",
  },
  {
    category: "Privacy",
    question: "How secure is my data?",
    answer:
      "Your vault uses secure authentication and household-scoped access. Data is encrypted in transit, synced to the cloud, and never sold.",
  },
  {
    category: "Privacy",
    question: "Who can see my information?",
    answer:
      "Only you — and household members you explicitly invite on Family plans. Role-based permissions control who can view or edit records.",
  },
  {
    category: "Billing",
    question: "What's the difference between Free, Pro, and Family?",
    answer:
      `Free is perfect for getting started with up to ${FREE_DEVICE_LIMIT} devices and 25 documents. Pro unlocks unlimited inventory, AI guidance, and advanced reports. Family includes everything in Pro plus household sharing.`,
  },
  {
    category: "Billing",
    question: "Can I cancel anytime?",
    answer:
      "Yes. Paid subscriptions can be managed from billing settings. Your data remains accessible according to your plan limits.",
  },
  {
    category: "Family",
    question: "Can I share with family members?",
    answer:
      "Yes. The Family plan lets you invite household members as viewers, members, or admins so everyone works from the same trusted record.",
  },
  {
    category: "Family",
    question: "What roles are available?",
    answer:
      "Viewer, Member, and Admin roles let you control who can see inventory, add devices, or manage household settings.",
  },
];

export function getAllFaqQuestions(): Array<{
  question: string;
  answer: string;
}> {
  return FAQ_ITEMS.map(({ question, answer }) => ({
    question,
    answer,
  }));
}
