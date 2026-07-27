"use client";

import Link from "next/link";
import {
  Wifi,
  FileText,
  ShieldCheck,
  Users,
  WifiOff,
} from "lucide-react";

import type { DashboardOverviewStats } from "@/lib/dashboard/types";

type HomeOverviewStatsProps = {
  stats: DashboardOverviewStats;
};

type StatItem = {
  label: string;
  value: number;
  href: string;
  icon: typeof Wifi;
};

export default function HomeOverviewStats({
  stats,
}: HomeOverviewStatsProps) {
  const items: StatItem[] = [
    {
      label: "Devices",
      value: stats.deviceCount,
      href: "/devices",
      icon: Wifi,
    },
    {
      label: "Online",
      value: stats.onlineDeviceCount,
      href: "/devices?status=online",
      icon: Wifi,
    },
    {
      label: "Offline",
      value: stats.offlineDeviceCount,
      href: "/devices?status=offline",
      icon: WifiOff,
    },
    {
      label: "Documents",
      value: stats.documentCount,
      href: "/documents",
      icon: FileText,
    },
    {
      label: "Warranties",
      value: stats.activeWarrantyCount,
      href: "/warranties",
      icon: ShieldCheck,
    },
    {
      label: "Family",
      value: stats.familyMemberCount,
      href: "/family",
      icon: Users,
    },
  ];

  return (
    <section aria-label="Home overview">
      <h2 className="text-overline text-text-muted">
        Home Overview
      </h2>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className="group rounded-[var(--radius-card)] bg-surface-sunken/50 px-4 py-5 transition hover:bg-surface-sunken"
            >
              <Icon
                size={16}
                className="text-text-muted"
                aria-hidden
              />
              <p className="mt-4 text-[clamp(1.5rem,3vw,2rem)] font-medium tabular-nums leading-none tracking-[-0.03em] text-text-primary">
                {item.value}
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                {item.label}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
