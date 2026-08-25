"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Laptop,
  Users,
  Wifi,
} from "lucide-react";

import {
  CommandCenterPreview,
  DocumentsPreview,
  FamilyPreview,
  NetworkPreview,
  PillarPreview,
} from "@/components/landing/LandingPreviews";
import { MarketingContent } from "@/components/marketing/MarketingLayout";
import { cn } from "@/lib/design-system/cn";
import { sections } from "@/lib/design-system/tokens";

const screenshots = [
  {
    id: "dashboard",
    label: "Home Health",
    icon: Laptop,
    accent: sections.homeHealth.accent,
    soft: sections.homeHealth.soft,
    preview: <CommandCenterPreview />,
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
    id: "network",
    label: "Home Wi-Fi",
    icon: Wifi,
    accent: sections.network.accent,
    soft: sections.network.soft,
    preview: <NetworkPreview />,
  },
  {
    id: "family",
    label: "Household",
    icon: Users,
    accent: sections.insights.accent,
    soft: sections.insights.soft,
    preview: <FamilyPreview />,
  },
] as const;

export default function ProductScreenshotsSection() {
  const [activeId, setActiveId] =
    useState<(typeof screenshots)[number]["id"]>(
      "dashboard"
    );

  const activeScreenshot =
    screenshots.find(
      (item) => item.id === activeId
    ) ?? screenshots[0];

  return (
    <MarketingContent>
      <div className="max-w-2xl">
        <p className="text-overline text-text-muted">
          Product
        </p>
        <h2 className="mt-4 text-3xl font-medium tracking-[-0.03em] md:text-4xl">
          See what your vault looks like
        </h2>
        <p className="mt-4 text-base leading-7 text-text-muted">
          Explore real interface previews for devices,
          documents, Home Wi-Fi details, and household sharing.
        </p>
      </div>

      <div
        className="mt-8 flex flex-wrap gap-2"
        role="tablist"
        aria-label="Product screenshots"
      >
        {screenshots.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={activeId === item.id}
            aria-controls={`screenshot-panel-${item.id}`}
            id={`screenshot-tab-${item.id}`}
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
        key={activeScreenshot.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1],
        }}
        role="tabpanel"
        id={`screenshot-panel-${activeScreenshot.id}`}
        aria-labelledby={`screenshot-tab-${activeScreenshot.id}`}
        className="mt-6"
      >
        <PillarPreview
          icon={activeScreenshot.icon}
          accent={activeScreenshot.accent}
          soft={activeScreenshot.soft}
        >
          {activeScreenshot.preview}
        </PillarPreview>
      </motion.div>
    </MarketingContent>
  );
}
