"use client";

import { useState } from "react";
import {
  BarChart3,
  FileText,
  Laptop,
  ShieldCheck,
} from "lucide-react";

import {
  CommandCenterPreview,
  DocumentsPreview,
  PillarPreview,
  ReportsPreview,
  WarrantiesPreview,
} from "@/components/landing/LandingPreviews";
import { MarketingContent } from "@/components/marketing/MarketingLayout";
import { cn } from "@/lib/design-system/cn";
import { sections } from "@/lib/design-system/tokens";

const previews = [
  {
    id: "devices",
    label: "Devices",
    description:
      "Track every device with photos, purchase details, and location.",
    icon: Laptop,
    accent: sections.technology.accent,
    soft: sections.technology.soft,
    preview: <CommandCenterPreview />,
  },
  {
    id: "warranties",
    label: "Warranties",
    description:
      "See coverage status and upcoming expirations at a glance.",
    icon: ShieldCheck,
    accent: sections.warning.accent,
    soft: sections.warning.soft,
    preview: <WarrantiesPreview />,
  },
  {
    id: "documents",
    label: "Documents",
    description:
      "Store receipts, manuals, and warranty cards in one vault.",
    icon: FileText,
    accent: sections.digitalVault.accent,
    soft: sections.digitalVault.soft,
    preview: <DocumentsPreview />,
  },
  {
    id: "reports",
    label: "Reports",
    description:
      "Review household technology health in a simple summary.",
    icon: BarChart3,
    accent: sections.insights.accent,
    soft: sections.insights.soft,
    preview: <ReportsPreview />,
  },
] as const;

export default function LandingProductPreview() {
  const [activeId, setActiveId] =
    useState<(typeof previews)[number]["id"]>(
      "devices"
    );

  const activePreview =
    previews.find((item) => item.id === activeId) ??
    previews[0];

  return (
    <section className="border-y border-border-subtle bg-surface-card/40">
      <MarketingContent className="py-10 md:py-14">
        <div className="max-w-xl">
          <h2 className="text-section-title text-text-primary">
            See your vault in action
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            {activePreview.description}
          </p>
        </div>

        <div
          className="mt-6 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Product preview"
        >
          {previews.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={activeId === item.id}
              aria-controls={`landing-preview-${item.id}`}
              id={`landing-preview-tab-${item.id}`}
              onClick={() =>
                setActiveId(item.id)
              }
              className={cn(
                "inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-button)] border px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction",
                activeId === item.id
                  ? "border-interaction/30 bg-interaction-soft text-interaction"
                  : "border-border-subtle bg-surface-card text-text-secondary hover:bg-surface-hover"
              )}
            >
              <item.icon size={15} aria-hidden />
              {item.label}
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id={`landing-preview-${activePreview.id}`}
          aria-labelledby={`landing-preview-tab-${activePreview.id}`}
          className="mt-5"
        >
          <PillarPreview
            icon={activePreview.icon}
            accent={activePreview.accent}
            soft={activePreview.soft}
          >
            {activePreview.preview}
          </PillarPreview>
        </div>
      </MarketingContent>
    </section>
  );
}
