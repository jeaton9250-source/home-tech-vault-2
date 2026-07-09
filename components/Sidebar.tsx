"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Laptop,
  FileText,
  CreditCard,
  Wifi,
  Shield,
  BarChart3,
  Settings,
} from "lucide-react";

const links = [
  {
    title: "Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Devices",
    href: "/devices",
    icon: Laptop,
  },
  {
    title: "Documents",
    href: "/documents",
    icon: FileText,
  },
  {
    title: "Subscriptions",
    href: "/subscriptions",
    icon: CreditCard,
  },
  {
    title: "Network",
    href: "/network",
    icon: Wifi,
  },
  {
    title: "Security",
    href: "/security",
    icon: Shield,
  },
  {
    title: "Reports",
    href: "/audit",
    icon: BarChart3,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-72 bg-white border-r border-neutral-200 flex-col">
      <div className="px-8 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
          Home Tech Vault
        </h1>

        <p className="mt-2 text-sm text-neutral-500">
          Organize • Protect • Simplify
        </p>
      </div>

      <nav className="flex-1 px-4">
        <div className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;

            const active =
              pathname === link.href ||
              pathname.startsWith(link.href + "/");

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-200 ${
                  active
                    ? "bg-neutral-950 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{link.title}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 border-t border-neutral-200 pt-8">
          <Link
            href="/settings"
            className="flex items-center gap-4 rounded-2xl px-5 py-4 text-neutral-600 hover:bg-neutral-100 transition"
          >
            <Settings size={20} />
            Settings
          </Link>
        </div>
      </nav>

      <div className="border-t border-neutral-200 p-6">
        <div className="rounded-3xl bg-neutral-950 p-6 text-white">
          <p className="text-sm text-white/70">
            Technology Health
          </p>

          <h2 className="mt-2 text-4xl font-semibold">
            94
          </h2>

          <p className="mt-1 text-sm text-white/60">
            Excellent
          </p>
        </div>
      </div>
    </aside>
  );
}