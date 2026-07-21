import Image from "next/image";
import {
  CalendarClock,
  CreditCard,
  FileText,
  Receipt,
  ShieldCheck,
  Wifi,
  Wrench,
} from "lucide-react";

import { MarketingContent } from "@/components/marketing/MarketingLayout";
import PageCard from "@/components/ui/PageCard";
import { DEMO_DEVICE_IMAGE_PATHS } from "@/lib/devices/demoDeviceImages";
import { cn } from "@/lib/design-system/cn";

const storageCards = [
  {
    title: "Devices & electronics",
    copy: "Laptops, TVs, routers, and appliances in one searchable record.",
    items: [
      {
        label: "MacBook Pro",
        detail: "Home Office · $2,499",
        imageSrc: DEMO_DEVICE_IMAGE_PATHS.macbookPro,
      },
      {
        label: "Living Room TV",
        detail: "Samsung · Living Room",
        imageSrc: DEMO_DEVICE_IMAGE_PATHS.samsungTv,
      },
      {
        label: "Mesh Wi‑Fi",
        detail: "Network · Online",
        icon: Wifi,
      },
    ],
  },
  {
    title: "Warranties & documents",
    copy: "Receipts, manuals, and warranty cards stay attached to each item.",
    items: [
      {
        label: "MacBook Pro receipt.pdf",
        detail: "Added Jan 14",
        icon: Receipt,
        tone: "technology" as const,
      },
      {
        label: "TV warranty card.pdf",
        detail: "Expires in 28 days",
        icon: ShieldCheck,
        tone: "warning" as const,
      },
      {
        label: "Router setup guide.pdf",
        detail: "Manual",
        icon: FileText,
        tone: "vault" as const,
      },
    ],
  },
  {
    title: "Subscriptions & dates",
    copy: "Renewals, maintenance, and coverage deadlines stay on your radar.",
    items: [
      {
        label: "Netflix",
        detail: "Renews Apr 12 · $15.49/mo",
        icon: CreditCard,
        tone: "insights" as const,
      },
      {
        label: "HVAC filter change",
        detail: "Due May 3",
        icon: Wrench,
        tone: "homeHealth" as const,
      },
      {
        label: "AppleCare+",
        detail: "412 days of coverage left",
        icon: CalendarClock,
        tone: "technology" as const,
      },
    ],
  },
] as const;

const toneClasses = {
  technology: "bg-interaction-soft text-interaction",
  warning: "bg-warning-soft text-warning",
  vault: "bg-section-vault-soft text-section-vault",
  insights: "bg-section-insights-soft text-section-insights",
  homeHealth: "bg-home-health-soft text-home-health",
} as const;

export default function LandingBenefitsSection() {
  return (
    <MarketingContent className="py-10 md:py-14">
      <div className="grid gap-4 md:grid-cols-3">
        {storageCards.map((card) => (
          <PageCard
            key={card.title}
            elevated={false}
            className="flex flex-col p-6 md:p-7"
          >
            <h2 className="text-card-title text-text-primary">
              {card.title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-text-muted">
              {card.copy}
            </p>

            <ul className="mt-5 space-y-2">
              {card.items.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-3 rounded-[var(--radius-button)] border border-border-subtle bg-surface-sunken/60 px-3 py-2.5"
                >
                  {"imageSrc" in item && item.imageSrc ? (
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-[10px] bg-surface-card">
                      <Image
                        src={item.imageSrc}
                        alt=""
                        fill
                        sizes="36px"
                        className="object-contain p-1"
                      />
                    </div>
                  ) : (
                    <span
                      className={cn(
                        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]",
                        "tone" in item && item.tone
                          ? toneClasses[item.tone]
                          : "bg-interaction-soft text-interaction"
                      )}
                    >
                      {"icon" in item && item.icon ? (
                        <item.icon size={16} aria-hidden />
                      ) : null}
                    </span>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {item.label}
                    </p>
                    <p className="truncate text-xs text-text-muted">
                      {item.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </PageCard>
        ))}
      </div>
    </MarketingContent>
  );
}
