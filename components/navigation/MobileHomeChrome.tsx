"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Archive,
  BarChart3,
  ChevronRight,
  CreditCard,
  FileText,
  Grid2X2,
  Home,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Wifi,
  Wrench,
  X,
} from "lucide-react";

import NotificationBell from "@/components/NotificationBell";
import ProfileMenu from "@/components/navigation/ProfileMenu";
import { useNotifications } from "@/hooks/useNotifications";
import { usePermissions } from "@/hooks/usePermissions";

const tabs = [
  { href: "/dashboard", label: "Home", Icon: Home },
  { href: "/home", label: "Spaces", Icon: Grid2X2 },
  { href: "/devices", label: "Vault", Icon: Archive },
  { href: "/smart-search", label: "Ask HTV", Icon: Sparkles },
] as const;

const sections = [
  { href: "/documents", label: "Documents", description: "Receipts, manuals, and files", Icon: FileText },
  { href: "/warranties", label: "Warranties", description: "Coverage and expiration dates", Icon: ShieldCheck },
  { href: "/maintenance", label: "Homekeeping", description: "Care, reminders, and repairs", Icon: Wrench },
  { href: "/network", label: "Connected home", description: "Wi-Fi and network devices", Icon: Wifi },
  { href: "/subscriptions", label: "Subscriptions", description: "Services and renewals", Icon: CreditCard },
  { href: "/reports", label: "Reports", description: "Household summaries and exports", Icon: BarChart3 },
  { href: "/settings", label: "Settings", description: "Your account and preferences", Icon: Settings },
] as const;

function isRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

/**
 * Native-feeling responsive chrome for phones and portrait tablets.
 * The sheet is keyboard accessible and keeps every existing app section reachable.
 * Desktop continues to use HomeDashboardHeader.
 */
export default function MobileHomeChrome() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreTrigger = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { isVerifiedPlatformAdmin } = usePermissions();
  const notifications = useNotifications();
  const moreActive = sections.some(({ href }) => isRoute(pathname, href))
    || pathname === "/admin" || pathname.startsWith("/admin/");

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;

    const existingOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMoreOpen(false);
        return;
      }

      if (event.key !== "Tab" || !sheetRef.current) return;
      const items = Array.from(sheetRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = existingOverflow;
      document.removeEventListener("keydown", onKeyDown);
      moreTrigger.current?.focus();
    };
  }, [moreOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#172d40]/97 text-white shadow-[0_5px_24px_rgba(15,28,40,.14)] backdrop-blur-2xl lg:hidden">
        <div className="mx-auto flex h-[60px] max-w-[1100px] items-center justify-between gap-2 px-4 sm:h-[66px] sm:px-7">
          <Link href="/dashboard" aria-label="Home Tech Vault home" className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-[#c4d7aa]">
              <Home size={20} strokeWidth={1.8} aria-hidden />
            </span>
            <span className="truncate font-serif text-[19px] font-semibold tracking-[-.025em]">
              <span className="sm:hidden">HTV</span>
              <span className="hidden sm:inline">Home Tech Vault</span>
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <Link href="/smart-search" aria-label="Search your home"
              className="flex h-11 w-11 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#bfce9f]">
              <Search size={20} aria-hidden />
            </Link>
            <div className="[&_button]:!text-white">
              <NotificationBell compact notificationsState={notifications} />
            </div>
            <div className="[&_button]:!text-white">
              <ProfileMenu compact />
            </div>
          </div>
        </div>
      </header>

      <nav aria-label="Primary mobile navigation"
        className="htv-mobile-tabbar fixed inset-x-3 z-50 mx-auto flex max-w-[560px] items-stretch justify-around gap-0.5 rounded-[24px] border border-[#e0dacb] bg-[#fffdf8]/96 px-1.5 pb-1.5 pt-2 shadow-[0_12px_46px_rgba(22,40,56,.2)] backdrop-blur-2xl lg:hidden">
        {tabs.map(({ href, label, Icon }) => {
          const active = isRoute(pathname, href);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined}
              className={[
                "flex min-h-[59px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[18px] px-1 text-center transition active:scale-[.96]",
                active ? "bg-[#edf2e7] font-semibold text-[#425f34]" : "font-medium text-[#69776f] hover:bg-[#f2f2e9]",
              ].join(" ")}>
              <Icon size={21} strokeWidth={active ? 2.2 : 1.8} aria-hidden />
              <span className="whitespace-nowrap text-[11px] leading-none">{label}</span>
            </Link>
          );
        })}
        <button ref={moreTrigger} type="button" aria-label="More home sections"
          aria-haspopup="dialog" aria-expanded={moreOpen} aria-controls="htv-mobile-more"
          onClick={() => setMoreOpen(true)}
          className={[
            "flex min-h-[59px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[18px] px-1 text-center transition active:scale-[.96]",
            moreOpen || moreActive ? "bg-[#edf2e7] font-semibold text-[#425f34]" : "font-medium text-[#69776f] hover:bg-[#f2f2e9]",
          ].join(" ")}>
          <Menu size={21} strokeWidth={1.9} aria-hidden />
          <span className="text-[11px] leading-none">More</span>
        </button>
      </nav>

      {moreOpen ? (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-[#101d29]/55 backdrop-blur-[4px]"
            onClick={() => setMoreOpen(false)} aria-hidden="true" />
          <div ref={sheetRef} id="htv-mobile-more" role="dialog" aria-modal="true"
            aria-labelledby="htv-mobile-more-title"
            className="htv-mobile-sheet fixed inset-x-3 mx-auto max-h-[85dvh] max-w-[560px] overflow-y-auto overscroll-contain rounded-[30px] border border-[#d9d8cc] bg-[#fffdf8] px-4 pb-7 pt-4 text-[#183047] shadow-[0_25px_80px_rgba(10,23,32,.28)] sm:px-6">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-[#cbd0c5]" aria-hidden />
            <div className="mb-4 flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#617c43]">YOUR HOME, ALL TOGETHER</p>
                <h2 id="htv-mobile-more-title" className="mt-1 font-serif text-[32px] leading-tight">Explore more</h2>
              </div>
              <button ref={closeRef} type="button" onClick={() => setMoreOpen(false)}
                aria-label="Close menu"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#dedbd0] bg-[#f2f3ea] text-[#183047]">
                <X size={21} aria-hidden />
              </button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {sections.map(({ href, label, description, Icon }) => {
                const active = isRoute(pathname, href);
                return (
                  <Link key={href} href={href} aria-current={active ? "page" : undefined}
                    onClick={() => setMoreOpen(false)}
                    className={[
                      "flex min-h-[76px] items-center gap-3 rounded-[20px] border px-3 py-3 transition active:scale-[.99]",
                      active ? "border-[#a7bb94] bg-[#edf2e7]" : "border-[#e4e2d9] bg-white hover:bg-[#f2f5ec]",
                    ].join(" ")}>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#edf2e7] text-[#617c43]">
                      <Icon size={21} strokeWidth={1.8} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold text-[#183047]">{label}</span>
                      <span className="mt-1 block text-[11px] leading-4 text-[#6d776d]">{description}</span>
                    </span>
                    <ChevronRight size={17} className="shrink-0 text-[#798b72]" aria-hidden />
                  </Link>
                );
              })}
            </div>

            {isVerifiedPlatformAdmin ? (
              <Link href="/admin" onClick={() => setMoreOpen(false)}
                className="mt-3 flex min-h-12 items-center gap-3 rounded-[16px] border border-[#d4dccc] bg-[#e9f0e5] px-4 text-sm font-semibold text-[#536c39]">
                <ShieldCheck size={18} aria-hidden /> Admin control center
                <ChevronRight size={17} className="ml-auto" aria-hidden />
              </Link>
            ) : null}
            <p className="mt-4 text-center text-[11px] leading-5 text-[#728077]">
              Everything in your Home Tech Vault is right here when you need it.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
