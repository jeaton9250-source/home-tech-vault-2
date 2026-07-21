"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
    icon: Laptop,
    accent: sections.technology.accent,
    soft: sections.technology.soft,
    preview: <CommandCenterPreview />,
  },
  {
    id: "warranties",
    label: "Warranties",
    icon: ShieldCheck,
    accent: sections.warning.accent,
    soft: sections.warning.soft,
    preview: <WarrantiesPreview />,
  },
  {
    id: "documents",
    label: "Documents",
    icon: FileText,
    accent: sections.digitalVault.accent,
    soft: sections.digitalVault.soft,
    preview: <DocumentsPreview />,
  },
  {
    id: "reports",
    label: "Reports",
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
    <section className="border-y border-border-subtle bg-surface-card/30">
      <MarketingContent className="py-12 md:py-16">
        <div className="max-w-xl">
          <h2 className="text-2xl font-medium tracking-[-0.03em] text-text-primary md:text-3xl">
            See your vault in action
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-muted md:text-base">
            Browse the areas families use most.
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

        <motion.div
          key={activePreview.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
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
        </motion.div>
      </MarketingContent>
    </section>
  );
}
