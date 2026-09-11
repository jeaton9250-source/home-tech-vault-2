"use client";

import Link from "next/link";
import {
  FileText,
  HelpCircle,
  Home,
  LayoutDashboard,
  Package,
  Settings,
  ShieldCheck,
  Wrench,
} from "lucide-react";

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Devices", href: "/devices", icon: Package },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Warranties", href: "/warranties", icon: ShieldCheck },
  { label: "Maintenance", href: "/maintenance", icon: Wrench },
  { label: "Rooms", href: "/home", icon: Home },
];

export default function DashboardSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[238px] border-r border-[#142437]/[0.06] bg-white/90 px-4 py-5 backdrop-blur-xl xl:flex xl:flex-col">
      <Link href="/" className="flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#142437] text-white">
          <Home className="h-5 w-5" />
        </div>

        <div>
          <p className="font-serif text-[20px] leading-none text-[#142437]">
            Home Tech Vault
          </p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-[#8995a0]">
            Your home remembers
          </p>
        </div>
      </Link>

      <nav className="mt-10 space-y-1">
        {nav.map((item, index) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={[
                "flex items-center gap-3 rounded-[14px] px-3 py-3 text-sm transition",
                index === 0
                  ? "bg-[#edf4f6] font-semibold text-[#142437]"
                  : "text-[#657483] hover:bg-[#f6f7f5] hover:text-[#142437]",
              ].join(" ")}
            >
              <Icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-[14px] px-3 py-3 text-sm text-[#657483] transition hover:bg-[#f6f7f5]"
          >
            <Settings className="h-[18px] w-[18px]" />
            Settings
          </Link>

          <Link
            href="/contact"
            className="flex items-center gap-3 rounded-[14px] px-3 py-3 text-sm text-[#657483] transition hover:bg-[#f6f7f5]"
          >
            <HelpCircle className="h-[18px] w-[18px]" />
            Help & Support
          </Link>
        </div>

        <div className="mt-5 overflow-hidden rounded-[20px] bg-[#f4f5f1] p-5">
          <p className="font-serif text-[18px] leading-6 text-[#445462]">
            A more organized home.
            <br />
            A calmer you.
          </p>

          <div className="mt-5 h-px w-8 bg-[#8c9b88]" />

          <div className="mt-6 flex justify-end">
            <div className="h-12 w-12 rounded-full bg-[#dbe3da]" />
          </div>
        </div>
      </div>
    </aside>
  );
}
