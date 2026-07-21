"use client";

import Link from "next/link";

import {
  Building2,
  DollarSign,
  FileText,
  Laptop,
  Radar,
  Users,
  type LucideIcon,
} from "lucide-react";

import Button from "@/components/ui/Button";

import { sections } from "@/lib/design-system/tokens";

import type { FeatureKey } from "@/lib/permissions/types";

type DashboardMetricsProps = {
  deviceCount: number;
  documentCount: number;
  roomCount: number;
  protectedValue: number;
  networkConfigured: boolean;
  familyMemberCount: number;
  getActionHref: (
    href: string,
    feature?: FeatureKey
  ) => string;
};

export default function DashboardMetrics({
  deviceCount,
  documentCount,
  roomCount,
  protectedValue,
  networkConfigured,
  familyMemberCount,
  getActionHref,
}: DashboardMetricsProps) {
  return (
    <section
      aria-label="Primary metrics"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      <MetricTile
        icon={Laptop}
        label="Devices"
        value={deviceCount.toLocaleString()}
        tint={sections.technology.soft}
        accent={sections.technology.accent}
        href="/devices"
        emptyMessage={
          deviceCount === 0
            ? "Your technology deserves a home."
            : undefined
        }
        emptyAction={
          deviceCount === 0
            ? {
                href: getActionHref(
                  "/devices/add",
                  "devices"
                ),
                label: "Add your first device",
              }
            : undefined
        }
      />

      <MetricTile
        icon={FileText}
        label="Documents"
        value={documentCount.toLocaleString()}
        tint={sections.digitalVault.soft}
        accent={sections.digitalVault.accent}
        href="/documents"
        emptyMessage={
          documentCount === 0
            ? "Keep receipts and manuals close at hand."
            : undefined
        }
        emptyAction={
          documentCount === 0
            ? {
                href: getActionHref(
                  "/documents/upload",
                  "documents"
                ),
                label: "Upload a document",
              }
            : undefined
        }
      />

      <MetricTile
        icon={Building2}
        label="Rooms"
        value={roomCount.toLocaleString()}
        tint={sections.network.soft}
        accent={sections.network.accent}
        href="/home"
        emptyMessage={
          roomCount === 0
            ? "Organize devices by where they live."
            : undefined
        }
      />

      <MetricTile
        icon={DollarSign}
        label="Protected Value"
        value={formatCurrency(protectedValue)}
        tint={sections.insights.soft}
        accent={sections.insights.accent}
        href="/devices"
      />

      <MetricTile
        icon={Radar}
        label="Network Status"
        value={networkConfigured ? "Configured" : "Not set up"}
        tint={sections.network.soft}
        accent={sections.network.accent}
        href={
          networkConfigured
            ? "/network"
            : "/network/edit"
        }
        emptyMessage={
          !networkConfigured
            ? "Record your router and Wi-Fi details."
            : undefined
        }
        emptyAction={
          !networkConfigured
            ? {
                href: "/network/edit",
                label: "Set up network",
              }
            : undefined
        }
      />

      <MetricTile
        icon={Users}
        label="Family Members"
        value={familyMemberCount.toLocaleString()}
        tint={sections.homeHealth.soft}
        accent={sections.homeHealth.accent}
        href="/family"
      />
    </section>
  );
}

function MetricTile({
  icon: Icon,
  label,
  value,
  tint,
  accent,
  href,
  emptyMessage,
  emptyAction,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tint: string;
  accent: string;
  href: string;
  emptyMessage?: string;
  emptyAction?: {
    href: string;
    label: string;
  };
}) {
  const showEmpty = Boolean(emptyMessage);

  return (
    <Link
      href={href}
      className="htv-metric-card group block p-5 md:p-6"
    >
      <div
        className="htv-icon-well mb-4 h-11 w-11"
        style={{
          background: tint,
          color: accent,
        }}
      >
        <Icon size={18} />
      </div>

      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-text-muted">
        {label}
      </p>

      <p className="mt-2 text-2xl font-medium tabular-nums tracking-[-0.02em] text-text-primary transition group-hover:text-text-secondary">
        {value}
      </p>

      {showEmpty && (
        <div className="mt-4 border-t border-border-subtle pt-4">
          <p className="text-sm leading-6 text-text-muted">
            {emptyMessage}
          </p>

          {emptyAction && (
            <span className="mt-3 inline-flex text-sm font-medium text-interaction group-hover:text-interaction-hover">
              {emptyAction.label} →
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
