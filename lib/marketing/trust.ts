import type { LucideIcon } from "lucide-react";
import {
  Cloud,
  KeyRound,
  Lock,
  ShieldCheck,
  Users,
} from "lucide-react";

export const SUPPORT_EMAIL =
  "support@hometechvault.com";

export type TrustBadge = {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export const TRUST_BAR_BADGES: TrustBadge[] =
  [
    {
      id: "authentication",
      label: "Secure sign-in",
      description:
        "Protected accounts with modern authentication.",
      href: "/trust#authentication",
      icon: KeyRound,
    },
    {
      id: "privacy",
      label: "Privacy first",
      description:
        "Your household data stays yours.",
      href: "/trust#privacy",
      icon: Lock,
    },
    {
      id: "permissions",
      label: "Household roles",
      description:
        "Share access with people you trust.",
      href: "/trust#permissions",
      icon: Users,
    },
    {
      id: "infrastructure",
      label: "Secure cloud",
      description:
        "Reliable infrastructure built for peace of mind.",
      href: "/trust#infrastructure",
      icon: Cloud,
    },
  ];

export const TRUST_INDICATORS = [
  {
    icon: Cloud,
    label: "Secure Cloud Storage",
  },
  {
    icon: Lock,
    label: "Encrypted",
  },
  {
    icon: Users,
    label: "Family Sharing",
  },
  {
    icon: ShieldCheck,
    label: "Role-based Access",
  },
] as const;

export const WHY_TRUST_POINTS = [
  {
    title: "Built for real households",
    description:
      "Home Tech Vault is designed around the way families actually manage devices, warranties, and paperwork — not enterprise IT workflows.",
  },
  {
    title: "Calm, transparent organization",
    description:
      "No fear-based messaging or fake scores. You see what is organized, what is missing, and what to do next.",
  },
  {
    title: "Sharing without oversharing",
    description:
      "Invite household members with roles so everyone can help without handing over every password.",
  },
  {
    title: "Support from a real founder",
    description:
      "Questions go to a small team that reads every message and improves the product based on real feedback.",
  },
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: "Create your vault",
    description:
      "Sign up in minutes and name your household.",
  },
  {
    step: 2,
    title: "Add your devices",
    description:
      "Start with the technology you rely on every day.",
  },
  {
    step: 3,
    title: "Attach documents",
    description:
      "Store receipts, warranties, and manuals where they belong.",
  },
  {
    step: 4,
    title: "Organize the rest",
    description:
      "Add network details, subscriptions, and maintenance tasks.",
  },
  {
    step: 5,
    title: "Share with your household",
    description:
      "Invite family members with the access they need.",
  },
] as const;

export const FOUNDER_STORY = {
  name: "Jason",
  role: "Founder, Home Tech Vault",
  headline:
    "Built by someone who got tired of searching for warranty cards.",
  quote:
    "Home Tech Vault started when I realized how much important home technology information lived in drawers, inboxes, and sticky notes. I wanted one calm place to organize it — and to share that peace of mind with other households.",
  bio:
    "Jason builds Home Tech Vault with a focus on clarity, privacy, and practical organization for everyday homes.",
} as const;

export type SecurityPillar = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const SECURITY_PILLARS: SecurityPillar[] =
  [
    {
      id: "authentication",
      title: "Secure authentication",
      description:
        "Accounts are protected with industry-standard sign-in. Passwords are never stored in plain text, and session handling follows modern security practices.",
      icon: KeyRound,
    },
    {
      id: "privacy",
      title: "Privacy by design",
      description:
        "Your vault holds household information you choose to save. We do not sell personal data, and our privacy policy explains what is stored and why.",
      icon: Lock,
    },
    {
      id: "permissions",
      title: "Household permissions",
      description:
        "Family sharing uses role-based access so owners control who can view or edit devices, documents, and household settings.",
      icon: Users,
    },
    {
      id: "infrastructure",
      title: "Secure cloud infrastructure",
      description:
        "Home Tech Vault runs on secure cloud infrastructure with encryption in transit, access controls, and reliable backups for your household records.",
      icon: Cloud,
    },
  ];

export const WALKTHROUGH_VIDEO = {
  title: "See Home Tech Vault in action",
  description:
    "A quick walkthrough of organizing devices, documents, warranties, and household sharing.",
  embedUrl: "",
} as const;
