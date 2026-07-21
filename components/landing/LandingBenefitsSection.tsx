import {
  CalendarClock,
  FolderKanban,
  ShieldCheck,
} from "lucide-react";

import { MarketingContent } from "@/components/marketing/MarketingLayout";
import PageCard from "@/components/ui/PageCard";

const benefits = [
  {
    title: "Everything organized",
    copy: "Keep devices, receipts, warranties, and documents easy to find.",
    icon: FolderKanban,
  },
  {
    title: "Private by default",
    copy: "You control who can view and manage your household vault.",
    icon: ShieldCheck,
  },
  {
    title: "Never miss important dates",
    copy: "Stay ahead of warranty expirations, subscriptions, and maintenance.",
    icon: CalendarClock,
  },
] as const;

export default function LandingBenefitsSection() {
  return (
    <MarketingContent className="py-10 md:py-14">
      <div className="grid gap-4 md:grid-cols-3">
        {benefits.map((benefit) => (
          <PageCard
            key={benefit.title}
            elevated={false}
            className="p-6 md:p-7"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)] bg-interaction-soft text-interaction">
              <benefit.icon size={18} aria-hidden />
            </span>

            <h2 className="text-card-title mt-4 text-text-primary">
              {benefit.title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-text-muted">
              {benefit.copy}
            </p>
          </PageCard>
        ))}
      </div>
    </MarketingContent>
  );
}
