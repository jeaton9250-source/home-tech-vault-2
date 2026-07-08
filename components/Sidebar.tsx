"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Laptop,
  CreditCard,
  Wifi,
  FileText,
  BarChart3,
  Bot,
  Settings,
  ShieldCheck,
} from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/devices", label: "Devices", icon: Laptop },
  { href: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/network", label: "Network", icon: Wifi },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/warranties", label: "Warranties", icon: ShieldCheck },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/ai", label: "Home Tech AI", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-blue-950 text-white min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-10">Home Tech Vault™</h1>

      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                active
                  ? "bg-white text-blue-950 font-semibold"
                  : "hover:bg-blue-900"
              }`}
            >
              <Icon size={20} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}