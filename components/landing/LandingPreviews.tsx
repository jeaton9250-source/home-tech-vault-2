"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ShieldCheck, Wifi, FileText, Users, CheckCircle2 } from "lucide-react";

type PillarPreviewProps = {
  icon: LucideIcon;
  accent: string;
  soft: string;
  children: ReactNode;
};

export function PillarPreview({
  icon: Icon,
  accent: _accent,
  soft: _soft,
  children,
}: PillarPreviewProps) {
  return (
    <div className="htv-glass-card-elevated relative overflow-hidden p-6 shadow-xl">
      <div className="flex items-center gap-3 border-b border-border-subtle/70 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-surface-sunken text-text-primary">
          <Icon size={18} />
        </div>
        <p className="text-sm font-semibold text-text-primary">
          Home Operating System
        </p>
      </div>

      <div className="mt-4">{children}</div>
    </div>
  );
}

export function CommandCenterPreview() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl bg-surface-card p-4 border border-border-subtle shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-home-health-soft text-home-health font-bold">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Home Pulse
            </p>
            <p className="text-sm font-semibold text-text-primary">
              34 Hubs Monitored
            </p>
          </div>
        </div>
        <span className="rounded-full bg-home-health-soft px-3 py-1 text-xs font-semibold text-home-health">
          98% Optimal
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-surface-sunken/60 p-3.5 border border-border-subtle">
          <p className="text-[0.6875rem] font-semibold text-text-muted">Living Room Hub</p>
          <p className="text-sm font-semibold text-text-primary mt-1">Apple TV 4K</p>
          <span className="inline-block mt-2 h-2 w-2 rounded-full bg-home-health" />
        </div>
        <div className="rounded-2xl bg-surface-sunken/60 p-3.5 border border-border-subtle">
          <p className="text-[0.6875rem] font-semibold text-text-muted">Network Mesh</p>
          <p className="text-sm font-semibold text-text-primary mt-1">Wi-Fi 6 Router</p>
          <span className="inline-block mt-2 h-2 w-2 rounded-full bg-home-health" />
        </div>
      </div>
    </div>
  );
}

export function DocumentsPreview() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-2xl bg-surface-card p-3.5 border border-border-subtle shadow-sm">
        <div className="flex items-center gap-3">
          <FileText size={18} className="text-interaction" />
          <div>
            <p className="text-xs font-semibold text-text-primary">Sonos Arc Purchase Receipt</p>
            <p className="text-[0.6875rem] text-text-muted">Verified · Warranty Active</p>
          </div>
        </div>
        <CheckCircle2 size={16} className="text-home-health" />
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-surface-card p-3.5 border border-border-subtle shadow-sm">
        <div className="flex items-center gap-3">
          <FileText size={18} className="text-interaction" />
          <div>
            <p className="text-xs font-semibold text-text-primary">LG OLED TV Owner Manual</p>
            <p className="text-[0.6875rem] text-text-muted">PDF · Auto-Indexed</p>
          </div>
        </div>
        <CheckCircle2 size={16} className="text-home-health" />
      </div>
    </div>
  );
}

export function NetworkPreview() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-surface-card p-4 border border-border-subtle shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Wifi size={18} className="text-home-health" />
            <p className="text-xs font-semibold text-text-primary">Main Gateway (Wi-Fi 6)</p>
          </div>
          <span className="rounded-full bg-home-health-soft px-2.5 py-0.5 text-[0.6875rem] font-semibold text-home-health">
            Online
          </span>
        </div>
        <p className="mt-2 text-[0.75rem] text-text-muted">1.2 Gbps Down · 28 Active Clients</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl bg-surface-sunken/60 p-3 border border-border-subtle text-xs">
          <p className="font-semibold text-text-primary">IoT Subnet</p>
          <p className="text-[0.6875rem] text-text-muted mt-0.5">Isolated · 16 Devices</p>
        </div>
        <div className="rounded-2xl bg-surface-sunken/60 p-3 border border-border-subtle text-xs">
          <p className="font-semibold text-text-primary">Guest Network</p>
          <p className="text-[0.6875rem] text-text-muted mt-0.5">Encrypted · WPA3</p>
        </div>
      </div>
    </div>
  );
}

export function FamilyPreview() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-2xl bg-surface-card p-3.5 border border-border-subtle shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-premium-soft text-premium font-bold text-xs">
            JD
          </div>
          <div>
            <p className="text-xs font-semibold text-text-primary">Household Admin</p>
            <p className="text-[0.6875rem] text-text-muted">Full Vault Access</p>
          </div>
        </div>
        <span className="rounded-full bg-premium-soft px-2.5 py-1 text-[0.6875rem] font-semibold text-premium">
          Owner
        </span>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-surface-card p-3.5 border border-border-subtle shadow-sm">
        <div className="flex items-center gap-3">
          <Users size={18} className="text-text-muted" />
          <div>
            <p className="text-xs font-semibold text-text-primary">Family Members</p>
            <p className="text-[0.6875rem] text-text-muted">3 Members Connected</p>
          </div>
        </div>
        <span className="rounded-full bg-surface-sunken px-2.5 py-1 text-[0.6875rem] font-semibold text-text-secondary">
          Shared
        </span>
      </div>
    </div>
  );
}

export function DashboardOverviewPreview() {
  return <CommandCenterPreview />;
}

export function VaultDetailsPreview() {
  return <DocumentsPreview />;
}
