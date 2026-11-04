"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Grid2X2, Home, Search, Sparkles, Archive } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import ProfileMenu from "@/components/navigation/ProfileMenu";
import { useNotifications } from "@/hooks/useNotifications";

const links = [
  { href: "/dashboard", label: "My Home", Icon: Home },
  { href: "/home", label: "My Spaces", Icon: Grid2X2 },
  { href: "/devices", label: "My Vault", Icon: Archive },
  { href: "/smart-search", label: "Ask HTV", Icon: Sparkles },
] as const;

/** Home-only top navigation. The rest of the app retains its existing shell. */
export default function HomeDashboardHeader() {
  const pathname = usePathname();
  const notifications = useNotifications();

  return (
    <header className="sticky top-0 z-40 hidden h-[76px] border-b border-white/10 bg-[#172d40] text-[#f5f1e8] shadow-[0_12px_32px_-30px_rgba(0,0,0,.8)] md:block">
      <div className="mx-auto flex h-full max-w-[1560px] items-center justify-between gap-5 px-6 lg:px-10">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-3" aria-label="Home Tech Vault — My Home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/[.06] text-[#c0d6a7]">
            <Home size={22} strokeWidth={1.7} aria-hidden />
          </span>
          <span className="font-serif text-lg font-semibold tracking-[-.025em] lg:text-[22px]">
            Home Tech Vault
          </span>
        </Link>

        <nav aria-label="Home navigation" className="flex min-w-0 items-center gap-1 lg:gap-4">
          {links.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={[
                  "inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-xs font-medium transition lg:px-4 lg:text-sm",
                  active
                    ? "bg-[#718d4f]/45 text-white"
                    : "text-white/78 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                <Icon size={17} strokeWidth={1.8} aria-hidden />
                <span className="whitespace-nowrap">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1 text-white [&_button]:text-white">
          <Link
            href="/smart-search"
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/85 transition hover:bg-white/10 hover:text-white"
            aria-label="Search your home"
          >
            <Search size={20} aria-hidden />
          </Link>
          <NotificationBell compact notificationsState={notifications} />
          <ProfileMenu compact />
        </div>
      </div>
    </header>
  );
}
