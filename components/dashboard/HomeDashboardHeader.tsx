"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  Archive,
  BarChart3,
  ChevronDown,
  CreditCard,
  FileText,
  Grid2X2,
  Home,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Wifi,
  Wrench,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import ProfileMenu from "@/components/navigation/ProfileMenu";
import { useNotifications } from "@/hooks/useNotifications";
import { usePermissions } from "@/hooks/usePermissions";

const primary = [
  { href: "/dashboard", label: "My Home", Icon: Home },
  { href: "/home", label: "My Spaces", Icon: Grid2X2 },
  { href: "/devices", label: "My Vault", Icon: Archive },
  { href: "/smart-search", label: "Ask HTV", Icon: Sparkles },
] as const;

const library = [
  { href: "/documents", label: "Documents", Icon: FileText },
  { href: "/warranties", label: "Warranties", Icon: ShieldCheck },
  { href: "/maintenance", label: "Maintenance", Icon: Wrench },
  { href: "/network", label: "Connected home", Icon: Wifi },
  { href: "/subscriptions", label: "Subscriptions", Icon: CreditCard },
  { href: "/reports", label: "Reports", Icon: BarChart3 },
  { href: "/settings", label: "Settings", Icon: Settings },
] as const;

function activeRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

/** One consistent, home-first navigation for the authenticated homeowner experience. */
export default function HomeDashboardHeader() {
  const pathname = usePathname();
  const notifications = useNotifications();
  const { isVerifiedPlatformAdmin } = usePermissions();
  const moreRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (moreRef.current) moreRef.current.open = false;
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 hidden h-[76px] border-b border-white/10 bg-[#172d40] text-[#f5f1e8] shadow-[0_12px_32px_-30px_rgba(0,0,0,.8)] lg:block">
      <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between gap-3 px-5 lg:gap-5 lg:px-10">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5" aria-label="Home Tech Vault — My Home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/[.06] text-[#c0d6a7]">
            <Home size={22} strokeWidth={1.7} aria-hidden />
          </span>
          <span className="font-serif text-[17px] font-semibold tracking-[-.025em] lg:text-[22px]">
            <span className="lg:hidden">HTV</span><span className="hidden lg:inline">Home Tech Vault</span>
          </span>
        </Link>

        <nav aria-label="Home navigation" className="flex min-w-0 items-center gap-0.5 xl:gap-2">
          {primary.map(({ href, label, Icon }) => {
            const active = activeRoute(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={[
                  "inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-xs font-medium transition xl:px-4 xl:text-sm",
                  active ? "bg-[#718d4f]/45 text-white" : "text-white/78 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                <Icon size={17} strokeWidth={1.8} aria-hidden />
                <span className="hidden whitespace-nowrap xl:inline">{label}</span>
              </Link>
            );
          })}

          <details ref={moreRef} className="group relative">
            <summary
              className={[
                "flex min-h-10 cursor-pointer list-none items-center gap-1.5 rounded-full px-3 text-xs font-medium transition [&::-webkit-details-marker]:hidden xl:px-4 xl:text-sm",
                library.some(({ href }) => activeRoute(pathname, href))
                  ? "bg-[#718d4f]/35 text-white" : "text-white/78 hover:bg-white/10 hover:text-white",
              ].join(" ")}
              aria-label="More home sections"
            >
              <span>More</span>
              <ChevronDown size={15} className="transition group-open:rotate-180" aria-hidden />
            </summary>
            <div className="absolute right-0 top-[calc(100%+13px)] z-50 w-[265px] rounded-[22px] border border-[#ddd8ca] bg-[#fffdf8] p-2 text-[#183047] shadow-[0_22px_65px_rgba(0,0,0,.2)]">
              <p className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#617c43]">Explore your home</p>
              {library.map(({ href, label, Icon }) => {
                const active = activeRoute(pathname, href);
                return (
                  <Link key={href} href={href} aria-current={active ? "page" : undefined}
                    className={["flex items-center gap-3 rounded-[13px] px-3 py-2.5 text-sm transition",
                      active ? "bg-[#edf2e7] font-semibold text-[#405b34]" : "text-[#364657] hover:bg-[#f1f2ea]"
                    ].join(" ")}>
                    <Icon size={17} className="text-[#617c43]" aria-hidden />
                    {label}
                  </Link>
                );
              })}
              {isVerifiedPlatformAdmin ? (
                <Link href="/admin" className="mt-2 flex items-center gap-3 border-t border-[#e8e5dc] px-3 py-3 text-sm font-semibold text-[#617c43]">
                  <ShieldCheck size={17} aria-hidden /> Admin control center
                </Link>
              ) : null}
            </div>
          </details>
        </nav>

        <div className="flex shrink-0 items-center gap-0.5 text-white [&_button]:text-white">
          <Link href="/smart-search"
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/85 transition hover:bg-white/10 hover:text-white"
            aria-label="Search your home"><Search size={19} aria-hidden /></Link>
          <NotificationBell compact notificationsState={notifications} />
          <ProfileMenu compact />
        </div>
      </div>
    </header>
  );
}
