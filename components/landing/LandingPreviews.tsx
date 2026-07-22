"use client";

import type { ReactNode } from "react";

import Image from "next/image";

import {
  BarChart3,
  Bell,
  FileText,
  Home,
  Laptop,
  LayoutGrid,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Wifi,
} from "lucide-react";

import { sections } from "@/lib/design-system/tokens";
import { DEMO_DEVICE_IMAGE_PATHS } from "@/lib/devices/demoDeviceImages";

function MiniHealthChart() {
  const bars = [42, 58, 52, 68, 62, 74, 70];

  return (
    <div
      className="flex h-10 items-end gap-1"
      aria-hidden
    >
      {bars.map((height, index) => (
        <span
          key={index}
          className="w-1.5 rounded-full bg-home-health/25"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

export function CommandCenterPreview({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <div className="bg-surface-base p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-overline text-home-health">
            Home Pulse
          </p>
          <p className="mt-1 text-xl font-medium tracking-[-0.02em] text-text-primary">
            Good afternoon, Alex
          </p>
          {!compact && (
            <p className="mt-0.5 text-xs text-text-muted">
              The Morgan Household
            </p>
          )}
        </div>

        <div className="rounded-full border border-home-health-muted bg-home-health-soft px-3 py-1 text-xs font-medium text-home-health">
          92% home health
        </div>
      </div>

      {!compact && (
        <div className="mt-4 flex items-start gap-2 rounded-[var(--radius-button)] border border-warning/20 bg-warning-soft/70 px-3 py-2.5">
          <Bell
            size={14}
            className="mt-0.5 shrink-0 text-warning"
            aria-hidden
          />
          <p className="text-xs leading-5 text-text-secondary">
            TV warranty expires in 28 days.
          </p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: "Devices", value: "24" },
          { label: "Protected", value: "$18k" },
          { label: "Docs", value: "47" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[var(--radius-button)] border border-border-subtle bg-surface-card px-3 py-2.5 shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-px hover:shadow-md"
          >
            <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-text-muted">
              {item.label}
            </p>
            <p className="mt-0.5 text-lg font-medium tabular-nums text-text-primary">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {!compact && (
        <div className="mt-4 rounded-[var(--radius-button)] border border-border-subtle bg-surface-card px-3 py-3 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-text-muted">
                Vault activity
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                3 updates this week
              </p>
            </div>
            <MiniHealthChart />
          </div>
        </div>
      )}

      {!compact && (
        <div className="mt-4 flex flex-wrap gap-2">
          {["Add device", "Upload receipt"].map(
            (action) => (
              <span
                key={action}
                className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface-card px-2.5 py-1 text-[0.6875rem] font-medium text-text-secondary"
              >
                <Plus size={11} aria-hidden />
                {action}
              </span>
            )
          )}
        </div>
      )}

      <div className="mt-4 space-y-2">
        <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-text-muted">
          Recent devices
        </p>
        <PreviewDeviceRow
          name="MacBook Pro"
          detail="Home Office · AppleCare+ active"
          imageSrc={
            DEMO_DEVICE_IMAGE_PATHS.macbookPro
          }
          accent={sections.technology.accent}
          soft={sections.technology.soft}
        />
        <PreviewDeviceRow
          name="Living Room TV"
          detail="Living Room · Warranty expiring"
          imageSrc={
            DEMO_DEVICE_IMAGE_PATHS.samsungFrameTv
          }
          accent={sections.technology.accent}
          soft={sections.technology.soft}
        />
      </div>

      {!compact && (
        <div className="mt-4 border-t border-border-subtle pt-3">
          <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-text-muted">
            Recent activity
          </p>
          <p className="mt-2 text-xs text-text-secondary">
            Receipt uploaded for MacBook Pro · 2h ago
          </p>
        </div>
      )}
    </div>
  );
}

const heroNavItems = [
  { label: "Home Pulse", icon: Home, active: true },
  { label: "Devices", icon: Laptop, active: false },
  { label: "Documents", icon: FileText, active: false },
  { label: "Warranties", icon: ShieldCheck, active: false },
  { label: "Reports", icon: BarChart3, active: false },
] as const;

export function PreviewAppShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-border-subtle bg-surface-card shadow-[var(--shadow-md),0_20px_40px_-18px_rgb(17_24_39_/_0.18)]">
      <div className="flex items-center gap-2 border-b border-border-subtle bg-surface-sunken/80 px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong/30" />
        </div>
        <p className="mx-auto truncate text-[10px] text-text-muted">
          app.hometechvault.com/{title.toLowerCase()}
        </p>
      </div>
      {children}
    </div>
  );
}

export function HeroAppPreview() {
  return (
    <div
      className="overflow-hidden rounded-[var(--radius-card)] border border-border-subtle bg-surface-card shadow-[var(--shadow-md),0_24px_48px_-16px_rgb(17_24_39_/_0.16)] transition-shadow duration-300 hover:shadow-[var(--shadow-lg),0_28px_56px_-16px_rgb(17_24_39_/_0.18)]"
      role="img"
      aria-label="Preview of the Home Tech Vault Home Pulse dashboard"
    >
      <div className="flex items-center gap-2 border-b border-border-subtle bg-surface-sunken/90 px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong/30" />
        </div>

        <div className="mx-auto flex h-7 min-w-0 flex-1 max-w-[180px] items-center justify-center rounded-md border border-border-subtle bg-surface-card px-3 text-[10px] text-text-muted">
          <span className="truncate">
            app.hometechvault.com/home
          </span>
        </div>

        <Search
          size={14}
          className="shrink-0 text-text-tertiary"
          aria-hidden
        />
      </div>

      <div className="flex">
        <aside
          className="hidden w-[148px] shrink-0 border-r border-border-subtle bg-surface-sunken/55 p-3 sm:block"
          aria-hidden
        >
          <p className="px-2 text-[0.625rem] font-semibold uppercase tracking-wider text-text-muted">
            Vault
          </p>

          <nav className="mt-3 space-y-0.5">
            {heroNavItems.map(({ label, icon: Icon, active }) => (
              <div
                key={label}
                className={`flex items-center gap-2 rounded-[10px] px-2 py-2 text-[11px] font-medium transition-colors duration-200 ${
                  active
                    ? "bg-surface-card text-interaction shadow-[var(--shadow-sm)]"
                    : "text-text-muted"
                }`}
              >
                <Icon size={13} aria-hidden />
                {label}
              </div>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between border-b border-border-subtle bg-surface-card px-4 py-2.5 sm:px-5">
            <div className="flex items-center gap-2">
              <LayoutGrid
                size={14}
                className="text-text-tertiary sm:hidden"
                aria-hidden
              />
              <p className="text-xs font-medium text-text-primary">
                Home Pulse
              </p>
            </div>

            <div className="flex items-center gap-2" aria-hidden>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-interaction-soft text-interaction">
                <Users size={12} />
              </span>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-[10px] text-text-tertiary">
                <Settings size={12} />
              </span>
            </div>
          </div>

          <CommandCenterPreview />
        </div>
      </div>
    </div>
  );
}

export function DocumentsPreview() {
  const docs = [
    { name: "MacBook Pro receipt.pdf", type: "Receipt" },
    { name: "TV warranty card.pdf", type: "Warranty" },
  ];

  return (
    <div className="bg-surface-base p-5 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-overline"
            style={{ color: sections.digitalVault.accent }}
          >
            Digital Vault
          </p>
          <p className="mt-1 text-2xl font-medium tracking-[-0.02em]">
            Documents
          </p>
        </div>

        <div
          className="htv-icon-well h-11 w-11"
          style={{
            background: sections.digitalVault.soft,
            color: sections.digitalVault.accent,
          }}
        >
          <FileText size={18} />
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {docs.map((doc) => (
          <div
            key={doc.name}
            className="flex items-center justify-between gap-3 rounded-[var(--radius-button)] border border-border-subtle bg-surface-card px-4 py-3.5"
          >
            <p className="truncate text-sm font-medium">
              {doc.name}
            </p>
            <span className="shrink-0 rounded-md bg-surface-sunken px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wider text-text-muted">
              {doc.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WarrantiesPreview() {
  const items = [
    {
      name: "MacBook Pro",
      status: "Active",
      days: "412 days left",
    },
    {
      name: "Living Room TV",
      status: "Expiring",
      days: "28 days left",
    },
  ];

  return (
    <div className="bg-surface-base p-5 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-overline text-warning">
            Warranties
          </p>
          <p className="mt-1 text-xl font-medium tracking-[-0.02em]">
            Coverage at a glance
          </p>
        </div>
        <div className="htv-icon-well h-11 w-11 bg-warning-soft text-warning">
          <ShieldCheck size={18} />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-3 rounded-[var(--radius-button)] border border-border-subtle bg-surface-card px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {item.name}
              </p>
              <p className="text-xs text-text-muted">
                {item.days}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-md px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wider ${
                item.status === "Expiring"
                  ? "bg-warning-soft text-warning"
                  : "bg-home-health-soft text-home-health"
              }`}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReportsPreview() {
  const rows = [
    { label: "Devices tracked", value: "24" },
    { label: "Warranties active", value: "18" },
    { label: "Documents stored", value: "47" },
  ];

  return (
    <div className="bg-surface-base p-5 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p
            className="text-overline"
            style={{ color: sections.insights.accent }}
          >
            Reports
          </p>
          <p className="mt-1 text-xl font-medium tracking-[-0.02em]">
            Household summary
          </p>
        </div>
        <div
          className="htv-icon-well h-11 w-11"
          style={{
            background: sections.insights.soft,
            color: sections.insights.accent,
          }}
        >
          <BarChart3 size={18} />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-[var(--radius-button)] border border-border-subtle bg-surface-card px-4 py-3"
          >
            <span className="text-sm text-text-secondary">
              {row.label}
            </span>
            <span className="text-sm font-medium tabular-nums">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NetworkPreview() {
  return (
    <div className="bg-surface-base p-5 md:p-8">
      <div className="flex items-center gap-3">
        <div
          className="htv-icon-well h-11 w-11"
          style={{
            background: sections.network.soft,
            color: sections.network.accent,
          }}
        >
          <Wifi size={18} />
        </div>

        <div>
          <p
            className="text-overline"
            style={{ color: sections.network.accent }}
          >
            Network
          </p>
          <p className="text-xl font-medium">
            Mesh Wi‑Fi
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {[
          "Router · Online",
          "12 devices connected",
          "Guest network · Off",
          "Last checked · Today",
        ].map((line) => (
          <div
            key={line}
            className="rounded-[var(--radius-button)] border border-border-subtle bg-surface-card px-4 py-3 text-sm text-text-secondary"
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FamilyPreview() {
  const members = [
    { name: "Alex Morgan", role: "Owner" },
    { name: "Jordan Morgan", role: "Member" },
  ];

  return (
    <div className="bg-surface-base p-5 md:p-8">
      <div className="flex items-center gap-3">
        <div
          className="htv-icon-well h-11 w-11"
          style={{
            background: sections.insights.soft,
            color: sections.insights.accent,
          }}
        >
          <Users size={18} />
        </div>

        <div>
          <p
            className="text-overline"
            style={{ color: sections.insights.accent }}
          >
            Family
          </p>
          <p className="text-xl font-medium">
            The Morgan Household
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {members.map((member) => (
          <div
            key={member.name}
            className="flex items-center gap-3 rounded-[var(--radius-button)] border border-border-subtle bg-surface-card px-4 py-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-sunken text-xs font-semibold text-text-secondary">
              {member.name
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </div>

            <div>
              <p className="text-sm font-medium">
                {member.name}
              </p>
              <p className="text-xs text-text-muted">
                {member.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PillarPreview({
  accent,
  soft,
  icon: Icon,
  children,
}: {
  accent: string;
  soft: string;
  icon: typeof Laptop;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-border-subtle bg-surface-card shadow-[var(--shadow-md)]">
      <div
        className="flex items-center gap-3 border-b border-border-subtle px-5 py-4"
        style={{ background: soft }}
      >
        <div
          className="htv-icon-well h-9 w-9"
          style={{ background: soft, color: accent }}
        >
          <Icon size={16} />
        </div>
        <div className="h-2 w-24 rounded-full bg-surface-card/80" />
      </div>
      {children}
    </div>
  );
}

function PreviewDeviceRow({
  name,
  detail,
  imageSrc,
  accent,
  soft,
}: {
  name: string;
  detail: string;
  imageSrc?: string;
  accent: string;
  soft: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-button)] border border-border-subtle bg-surface-card px-3 py-2.5">
      {imageSrc ? (
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-[var(--radius-button)] bg-surface-sunken">
          <Image
            src={imageSrc}
            alt={`${name} demo device`}
            fill
            sizes="36px"
            className="object-contain p-1"
          />
        </div>
      ) : (
        <div
          className="htv-icon-well h-9 w-9"
          style={{ background: soft, color: accent }}
        >
          <Laptop size={16} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {name}
        </p>
        <p className="truncate text-xs text-text-muted">
          {detail}
        </p>
      </div>
    </div>
  );
}
