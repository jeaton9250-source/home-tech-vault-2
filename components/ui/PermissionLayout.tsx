"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import PageHero, {
  type PageHeroSection,
} from "@/components/ui/PageHero";
import {
  PageAction,
  ViewerBanner,
} from "@/components/ui/PermissionUI";

import type { FeatureKey } from "@/lib/permissions/types";

type PermissionLayoutProps = {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  section?: PageHeroSection;
  addHref?: string;
  addLabel?: string;
  addIcon?: LucideIcon;
  feature?: FeatureKey;
  lockedLabel?: string;
  viewerTitle?: string;
  viewerDescription?: string;
  showAction?: boolean;
  isViewer?: boolean;
  canCreate?: boolean;
};

export default function PermissionLayout({
  children,
  eyebrow,
  title,
  description,
  section = "neutral",
  addHref,
  addLabel,
  addIcon,
  feature,
  lockedLabel = "Create Your Vault",
  viewerTitle,
  viewerDescription,
  showAction = true,
}: PermissionLayoutProps) {
  const hasAction =
    showAction &&
    Boolean(addHref) &&
    Boolean(addLabel);

  return (
    <>
      <PageHero
        section={section}
        eyebrow={eyebrow}
        title={title}
        description={description}
      >
        {hasAction &&
          addHref &&
          addLabel && (
            <PageAction
              href={addHref}
              label={addLabel}
              feature={feature}
              lockedLabel={
                lockedLabel
              }
              icon={addIcon}
              variant="primary"
            />
          )}
      </PageHero>

      <ViewerBanner
        title={viewerTitle}
        description={
          viewerDescription
        }
      />

      {children}
    </>
  );
}
