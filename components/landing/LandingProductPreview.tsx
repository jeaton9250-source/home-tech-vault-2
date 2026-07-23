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
  PreviewAppShell,
  ReportsPreview,
  WarrantiesPreview,
} from "@/components/landing/LandingPreviews";
import { MarketingContent } from "@/components/marketing/MarketingLayout";
import {
  landingPreviewEnter,
  landingSectionAnchor,
  landingSectionClass,
} from "@/lib/marketing/landingStyles";
import { LANDING_SECTION_IDS } from "@/lib/marketing/landingNav";
import { cn } from "@/lib/design-system/cn";

const previews = [
  {
    id: "devices",
    label: "Devices",
    description:
      "Track every device with photos, purchase details, and location.",
    icon: Laptop,
    preview: <CommandCenterPreview compact />,
  },
  {
    id: "warranties",
    label: "Warranties",
    description:
      "See coverage status and upcoming expirations at a glance.",
    icon: ShieldCheck,
    preview: <WarrantiesPreview />,
  },
  {
    id: "documents",
    label: "Documents",
    description:
      "Store receipts, manuals, and warranty cards in one vault.",
    icon: FileText,
    preview: <DocumentsPreview />,
  },
  {
    id: "reports",
    label: "Reports",
    description:
      "Review household technology health in a simple summary.",
    icon: BarChart3,
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
    <section
      id={LANDING_SECTION_IDS.forHomes}
      className={cn(
        "border-y border-border-subtle/80 bg-surface-card/30",
        landingSectionAnchor
      )}
    >
      <MarketingContent className={landingSectionClass}>
        <div className="max-w-xl">
          <h2 className="text-section-title text-text-primary">
            How it works
          </h2>
          <p
            key={activePreview.id}
            className={cn(
              "mt-2 text-sm leading-6 text-text-muted",
              landingPreviewEnter
            )}
          >
            {activePreview.description}
          </p>
        </div>

        <div
          className="mt-7 flex flex-wrap gap-2"
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
                "inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-button)] border px-4 py-2 text-sm font-medium transition-all duration-200 ease-[var(--ease-premium)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interaction",
                activeId === item.id
                  ? "border-interaction/25 bg-interaction-soft text-interaction"
                  : "border-border-subtle bg-surface-card text-text-secondary hover:-translate-y-px hover:border-border-strong hover:shadow-sm"
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
          className="mt-6"
        >
          <div
            key={activePreview.id}
            className={landingPreviewEnter}
          >
            <PreviewAppShell title={activePreview.label}>
              {activePreview.preview}
            </PreviewAppShell>
          </div>
        </div>
      </MarketingContent>
    </section>
  );
}
