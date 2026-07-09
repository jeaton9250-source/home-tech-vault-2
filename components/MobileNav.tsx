"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Laptop,
  FileText,
  CreditCard,
  Settings,
} from "lucide-react";

const links = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/devices", label: "Devices", icon: Laptop },
  { href: "/documents", label: "Docs", icon: FileText },
  { href: "/subscriptions", label: "Subs", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white/90 backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-5">
        {links.map((link) => {
          const Icon = link.icon;
          const active =
            pathname === link.href || pathname.startsWith(link.href + "/");

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center gap-1 py-3 text-xs ${
                active ? "text-neutral-950" : "text-neutral-400"
              }`}
            >
              <Icon size={20} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}