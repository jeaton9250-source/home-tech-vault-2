"use client";

import type {
  LucideIcon,
} from "lucide-react";
import type {
  ReactNode,
} from "react";

import {
  PageAction,
  ViewerBanner,
} from "@/components/ui/PermissionUI";

type PermissionLayoutProps = {
  children: ReactNode;

  isViewer: boolean;
  canCreate: boolean;

  eyebrow: string;
  title: string;
  description: string;

  addHref?: string;
  addLabel?: string;
  addIcon?: LucideIcon;

  lockedHref?: string;
  lockedLabel?: string;

  viewerTitle?: string;
  viewerDescription?: string;

  showAction?: boolean;
};

export default function PermissionLayout({
  children,
  isViewer,
  canCreate,
  eyebrow,
  title,
  description,
  addHref,
  addLabel,
  addIcon,
  lockedHref = "/signup",
  lockedLabel = "Create Your Vault",
  viewerTitle = "Viewer Access",
  viewerDescription = "This page is read-only. Members can make permitted changes, while Admins have full management access.",
  showAction = true,
}: PermissionLayoutProps) {
  const hasAction =
    showAction &&
    Boolean(addHref) &&
    Boolean(addLabel);

  return (
    <>
      <section className="rounded-[32px] bg-[#111827] px-6 py-9 text-white shadow-sm md:px-10 md:py-11">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96A]">
              {eyebrow}
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
              {title}
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/60 md:text-base">
              {description}
            </p>
          </div>

          {hasAction &&
            addHref &&
            addLabel && (
              <PageAction
                canCreate={
                  canCreate
                }
                href={addHref}
                label={addLabel}
                lockedHref={
                  lockedHref
                }
                lockedLabel={
                  lockedLabel
                }
                icon={addIcon}
                variant="light"
              />
            )}
        </div>
      </section>

      <ViewerBanner
        show={isViewer}
        title={viewerTitle}
        description={
          viewerDescription
        }
      />

      {children}
    </>
  );
}