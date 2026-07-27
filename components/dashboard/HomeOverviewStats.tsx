"use client";

import Link from "next/link";
import {
  Wifi,
  FileText,
  ShieldCheck,
  Users,
  WifiOff,
  Radio,
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
  accentClass: string;
};

export default function HomeOverviewStats({
  stats,
}: HomeOverviewStatsProps) {
  const items: StatItem[] = [
    {
      label: "Devices",
      value: stats.deviceCount,
      href: "/devices",
      icon: Radio,
      accentClass: "bg-interaction-soft text-interaction",
    },
    {
      label: "Online",
      value: stats.onlineDeviceCount,
      href: "/devices?status=online",
      icon: Wifi,
      accentClass: "bg-home-health-soft text-home-health",
    },
    {
      label: "Offline",
      value: stats.offlineDeviceCount,
      href: "/devices?status=offline",
      icon: WifiOff,
      accentClass: "bg-warning-soft text-warning",
    },
    {
      label: "Documents",
      value: stats.documentCount,
      href: "/documents",
      icon: FileText,
      accentClass: "bg-premium-soft text-premium",
    },
    {
      label: "Warranties",
      value: stats.activeWarrantyCount,
      href: "/warranties",
      icon: ShieldCheck,
      accentClass: "bg-home-health-soft text-home-health",
    },
    {
      label: "Family",
      value: stats.familyMemberCount,
      href: "/family",
      icon: Users,
      accentClass: "bg-interaction-soft text-interaction",
    },
  ];

  return (
    <section aria-label="Home overview">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
          Home Technology Overview
        </h2>
        <span className="text-xs text-text-tertiary">Real-time status</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className="htv-glass-card group p-5 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-2xl ${item.accentClass} transition-transform group-hover:scale-110`}
                >
                  <Icon size={17} aria-hidden />
                </div>
              </div>

              <p className="mt-4 text-3xl font-bold tracking-tight text-text-primary">
                {item.value}
              </p>
              <p className="mt-1 text-xs font-semibold text-text-secondary">
                {item.label}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

