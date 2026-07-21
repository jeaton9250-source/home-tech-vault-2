import {
  KeyRound,
  Lock,
  ShieldCheck,
  Users,
} from "lucide-react";

import { MarketingContent } from "@/components/marketing/MarketingLayout";

const trustItems = [
  {
    id: "authentication",
    label: "Secure authentication",
    icon: KeyRound,
  },
  {
    id: "access",
    label: "Private household access",
    icon: Users,
  },
  {
    id: "https",
    label: "HTTPS protected",
    icon: ShieldCheck,
  },
  {
    id: "control",
    label: "You control your data",
    icon: Lock,
  },
] as const;

export default function LandingTrustSection() {
  return (
    <MarketingContent className="py-10 md:py-14">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {trustItems.map(({ id, label, icon: Icon }) => (
          <div
            key={id}
            className="flex items-center gap-3 rounded-[var(--radius-button)] border border-border-subtle bg-surface-card px-4 py-3.5 shadow-[var(--shadow-sm)]"
          >
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-interaction-soft text-interaction">
              <Icon size={16} aria-hidden />
            </span>
            <span className="text-sm font-medium text-text-primary">
              {label}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-6 max-w-2xl text-sm leading-6 text-text-muted">
        Your information belongs to you. Home Tech Vault
        does not sell your personal information.
      </p>
    </MarketingContent>
  );
}
