"use client";

import type { ReactNode } from "react";

import Image from "next/image";

import {
  FileText,
  Laptop,
  ShieldCheck,
  BarChart3,
  Users,
  Wifi,
} from "lucide-react";

import { sections } from "@/lib/design-system/tokens";
import { DEMO_DEVICE_IMAGE_PATHS } from "@/lib/devices/demoDeviceImages";

export function CommandCenterPreview() {
  return (
    <div className="bg-surface-base p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-overline text-home-health">
            Home Command Center
          </p>
          <p className="mt-1 text-xl font-medium tracking-[-0.02em]">
            Good afternoon
          </p>
        </div>

        <div className="rounded-full border border-home-health-muted bg-home-health-soft px-3 py-1 text-xs font-medium text-home-health">
          92 Vault Health
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {[
          { label: "Devices", value: "24" },
          { label: "Protected", value: "$18k" },
          { label: "Docs", value: "47" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[var(--radius-button)] border border-border-subtle bg-surface-card px-3 py-2.5"
          >
            <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-text-muted">
              {item.label}
            </p>
            <p className="mt-0.5 text-lg font-medium tabular-nums">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        <PreviewDeviceRow
          name="MacBook Pro"
          detail="Home Office"
          imageSrc={
            DEMO_DEVICE_IMAGE_PATHS.macbookPro
          }
          accent={sections.technology.accent}
          soft={sections.technology.soft}
        />
        <PreviewDeviceRow
          name="Living Room TV"
          detail="Living Room"
          imageSrc={
            DEMO_DEVICE_IMAGE_PATHS.samsungTv
          }
          accent={sections.technology.accent}
          soft={sections.technology.soft}
        />
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
