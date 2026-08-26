import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";

import {
  FounderLinkAction,
  FounderSection,
} from "@/components/admin/founder-control-center/FounderHeader";
import type {
  FounderPriorityItem,
  FounderPriorityTone,
} from "@/lib/admin/founderControlCenter";
import { cn } from "@/lib/design-system/cn";

const toneStyles: Record<
  FounderPriorityTone,
  { icon: LucideIcon; className: string }
> = {
  urgent: {
    icon: AlertTriangle,
    className:
      "border-red-200 bg-red-50 text-red-700",
  },
  review: {
    icon: LifeBuoy,
    className:
      "border-amber-200 bg-amber-50 text-amber-800",
  },
  success: {
    icon: CheckCircle2,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  neutral: {
    icon: CircleDot,
    className:
      "border-[#182533]/10 bg-[#fffdf9] text-[#5f5b55]",
  },
};

type FounderPrioritiesProps = {
  items: FounderPriorityItem[];
};

export default function FounderPriorities({
  items,
}: FounderPrioritiesProps) {
  return (
    <FounderSection
      id="founder-priorities-heading"
      title="Today’s Priorities"
      subtitle="The most important things requiring your attention."
    >
      {items.length === 0 ? (
        <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-5 py-8 text-center">
          <CheckCircle2
            aria-hidden="true"
            className="mx-auto h-6 w-6 text-emerald-700"
          />
          <p className="mt-3 font-medium text-emerald-900">
            Everything is on track today.
          </p>
          <p className="mt-2 text-sm leading-6 text-emerald-800">
            There are no urgent platform issues
            requiring attention.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const tone = toneStyles[item.tone];
            const Icon = tone.icon;

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="group flex items-start gap-4 rounded-[26px] border border-[#182533]/10 bg-[#fffdf9] px-4 py-4 transition hover:border-charcoal/10 hover:bg-surface-card"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
                      tone.className
                    )}
                  >
                    <Icon
                      aria-hidden="true"
                      className="h-4 w-4"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-semibold text-[#18202b]">
                        {item.title}
                      </span>
                      {typeof item.count ===
                      "number" ? (
                        <span className="rounded-full border border-[#182533]/10 px-2 py-0.5 text-xs font-medium text-[#5f5b55]">
                          {item.count}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-[#5f5b55]">
                      {item.description}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </FounderSection>
  );
}

export function FounderAttentionList({
  items,
}: {
  items: Array<{
    id: string;
    title: string;
    description: string;
    href: string;
  }>;
}) {
  return (
    <FounderSection
      id="founder-attention-heading"
      title="Needs Attention"
      subtitle="Unresolved platform items that may need follow-up."
    >
      {items.length === 0 ? (
        <div className="rounded-[26px] border border-[#182533]/10 bg-[#fffdf9] px-5 py-8 text-center">
          <p className="font-semibold text-[#18202b]">
            Nothing pending
          </p>
          <p className="mt-2 text-sm leading-6 text-[#5f5b55]">
            No additional configuration or
            operational items need review.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="block rounded-[26px] border border-[#182533]/10 bg-[#fffdf9] px-4 py-4 transition hover:bg-surface-card"
              >
                <p className="font-semibold text-[#18202b]">
                  {item.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-[#5f5b55]">
                  {item.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </FounderSection>
  );
}

export function FounderFeedbackEmptyState() {
  return (
    <FounderSection
      id="founder-feedback-heading"
      title="User Feedback"
      subtitle="Customer sentiment and product feedback."
    >
      <div className="rounded-[26px] border border-[#182533]/10 bg-[#fffdf9] px-5 py-8 text-center">
        <p className="font-semibold text-[#18202b]">
          No feedback system is connected yet.
        </p>
        <p className="mt-2 text-sm leading-6 text-[#5f5b55]">
          Support tickets remain the primary
          channel for customer input.
        </p>
        <div className="mt-4">
          <FounderLinkAction
            href="/admin/support"
            label="Open support inbox"
          />
        </div>
      </div>
    </FounderSection>
  );
}
