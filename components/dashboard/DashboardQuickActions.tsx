"use client";

import Link from "next/link";

import {
  ArrowRight,
  FileText,
  Plus,
  Radar,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { useDemoReadOnlyAction } from "@/components/demo/DemoExperienceProvider";
import PageCard from "@/components/ui/PageCard";
import { usePermissions } from "@/hooks/usePermissions";

import { sections } from "@/lib/design-system/tokens";

import type { FeatureKey } from "@/lib/permissions/types";

type DashboardQuickActionsProps = {
  getActionHref: (
    href: string,
    feature?: FeatureKey
  ) => string;
  getActionLabel: (label: string) => string;
};

const actions = [
  {
    href: "/devices/add",
    feature: "devices" as const,
    icon: Plus,
    label: "Add Device",
    description: "Register a new piece of technology",
    tint: sections.technology.soft,
    accent: sections.technology.accent,
  },
  {
    href: "/documents/upload",
    feature: "documents" as const,
    icon: FileText,
    label: "Upload Document",
    description: "Save a receipt, manual, or warranty",
    tint: sections.digitalVault.soft,
    accent: sections.digitalVault.accent,
  },
  {
    href: "/network/discover",
    feature: "networkDiscover" as const,
    icon: Radar,
    label: "Scan Network",
    description: "Discover devices on your home network",
    tint: sections.network.soft,
    accent: sections.network.accent,
  },
  {
    href: "/maintenance",
    feature: "maintenance" as const,
    icon: Wrench,
    label: "Maintenance",
    description: "Schedule care for your technology",
    tint: sections.homeHealth.soft,
    accent: sections.homeHealth.accent,
  },
];

export default function DashboardQuickActions({
  getActionHref,
  getActionLabel,
}: DashboardQuickActionsProps) {
  const { isDemo, canCreate } = usePermissions();
  const showReadOnlyModal = useDemoReadOnlyAction();
  const writeBlockedInDemo = isDemo && !canCreate;

  return (
    <PageCard elevated interactive>
      <h2 className="text-section-title text-text-primary">
        What would you like to do?
      </h2>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <QuickAction
            key={action.href}
            href={getActionHref(
              action.href,
              action.feature
            )}
            icon={action.icon}
            label={getActionLabel(action.label)}
            description={action.description}
            tint={action.tint}
            accent={action.accent}
            onDemoWrite={
              writeBlockedInDemo &&
              (action.href === "/devices/add" ||
                action.href === "/documents/upload")
                ? showReadOnlyModal
                : undefined
            }
          />
        ))}
      </div>
    </PageCard>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  description,
  tint,
  accent,
  onDemoWrite,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  description: string;
  tint: string;
  accent: string;
  onDemoWrite?: () => void;
}) {
  const className =
    "htv-card-interactive group flex w-full items-start gap-4 rounded-[var(--radius-card)] border border-border-subtle bg-surface-card p-4 text-left shadow-[var(--shadow-sm)]";

  const content = (
    <>
      <div
        className="htv-icon-well h-10 w-10 shrink-0"
        style={{
          background: tint,
          color: accent,
        }}
      >
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-text-primary">
          {label}
        </span>

        <span className="mt-0.5 block text-xs leading-5 text-text-muted">
          {description}
        </span>
      </div>

      <ArrowRight
        size={16}
        className="mt-1 shrink-0 text-text-tertiary transition group-hover:translate-x-0.5 group-hover:text-interaction"
      />
    </>
  );

  if (onDemoWrite) {
    return (
      <button
        type="button"
        onClick={onDemoWrite}
        className={className}
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
