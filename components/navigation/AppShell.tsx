"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";

import {
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  FileText,
  Home,
  Loader2,
  LogOut,
  MessageCircle,
  Monitor,
  Search,
  Settings,
  ShieldCheck,
  Wifi,
  Wrench,
} from "lucide-react";

import { usePermissions } from "@/hooks/usePermissions";
import { useNotifications } from "@/hooks/useNotifications";
import { useDemoMode } from "@/hooks/useDemoMode";
import { demoDashboard, demoProfile } from "@/lib/demoData";
import { supabase } from "@/lib/supabase";

type AppShellProps = {
  children: ReactNode;
};

const navItems: {
  label: string;
  href: string;
  icon: LucideIcon;
}[] = [
  {
    label: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "My Things",
    href: "/devices",
    icon: Monitor,
  },
  {
    label: "Documents",
    href: "/documents",
    icon: FileText,
  },
  {
    label: "Maintenance",
    href: "/maintenance",
    icon: Wrench,
  },
  {
    label: "Ask HTV",
    href: "/smart-search",
    icon: MessageCircle,
  },
];

const utilityItems: typeof navItems = [
  {
    label: "My Home",
    href: "/home",
    icon: Home,
  },
  {
    label: "Warranties",
    href: "/warranties",
    icon: ShieldCheck,
  },
  {
    label: "Network",
    href: "/network",
    icon: Wifi,
  },
  {
    label: "Subscriptions",
    href: "/subscriptions",
    icon: CreditCard,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

function isActiveRoute(
  pathname: string,
  href: string
) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

function Sidebar({
  showAdminControlCenter,
}: {
  showAdminControlCenter: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-[238px] shrink-0 bg-[#17283a] text-white lg:flex lg:flex-col">
      <div className="px-6 pb-9 pt-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#bec04a]/45 bg-[#bec04a]/10 text-[#d5d66a]">
            <Home
              size={22}
              strokeWidth={1.7}
            />
          </div>

          <div>
            <div className="font-serif text-[22px] leading-[0.88] tracking-[-0.025em] text-white">
              Home Tech
              <br />
              Vault
            </div>
          </div>
        </Link>

        <p className="mt-5 max-w-[150px] text-[10px] uppercase leading-4 tracking-[0.18em] text-white/42">
          The useful memory of your home
        </p>
      </div>

      <nav className="space-y-1 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;

          const active = isActiveRoute(
            pathname,
            item.href
          );

          return (
            <Link
              key={item.label}
              href={item.href}
              className={[
                "group flex items-center gap-3 rounded-[12px] px-4 py-3 text-[14px] font-medium transition-colors",
                active
                  ? "bg-[#bec04a]/22 text-white shadow-[inset_0_0_0_1px_rgba(213,214,106,0.14)]"
                  : "text-white/62 hover:bg-white/[0.07] hover:text-white",
              ].join(" ")}
            >
              <Icon
                size={19}
                strokeWidth={
                  active ? 2.2 : 1.8
                }
                className={
                  active
                    ? "text-[#d5d66a]"
                    : "text-white/48 group-hover:text-white/80"
                }
              />

              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-7 my-5 h-px bg-white/10" />

      <nav className="flex-1 space-y-0.5 px-4">
        {showAdminControlCenter ? (
          <>
            <Link
              href="/admin"
              className={[
                "group mb-3 flex items-center gap-3 rounded-[12px] border px-4 py-3 text-[12px] font-semibold transition-colors",
                isActiveRoute(pathname, "/admin")
                  ? "border-[#d5d66a]/30 bg-[#bec04a]/22 text-white"
                  : "border-[#d5d66a]/20 bg-[#bec04a]/10 text-[#e3e48a] hover:bg-[#bec04a]/18 hover:text-white",
              ].join(" ")}
            >
              <ShieldCheck size={17} strokeWidth={1.9} />
              Admin Control Center
            </Link>

            <div className="mx-3 mb-3 h-px bg-white/10" />
          </>
        ) : null}

        {utilityItems.map((item) => {
          const Icon = item.icon;
          const active = isActiveRoute(pathname, item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={[
                "group flex items-center gap-3 rounded-[12px] px-4 py-2.5 text-[12px] transition-colors",
                active ? "bg-white/[0.08] text-white" : "text-white/42 hover:bg-white/[0.06] hover:text-white/80",
              ].join(" ")}
            >
              <Icon size={16} strokeWidth={1.7} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 pb-8">
        <div className="h-px bg-white/12" />

        <div className="pt-6">
          <p className="font-serif text-[18px] italic leading-6 text-white/72">
            A more thoughtful home lives here.
          </p>
          <div className="mt-5 h-px w-9 bg-[#d5d66a]/70" />
        </div>
      </div>
    </aside>
  );
}

type TopBarProps = {
  householdLabel: string;
  displayName: string;
  initials: string;
  roleLabel: string;
  showAdminControlCenter: boolean;
  isDemo: boolean;
};

function TopBar({
  householdLabel,
  displayName,
  initials,
  roleLabel,
  showAdminControlCenter,
  isDemo,
}: TopBarProps) {
  const router = useRouter();
  const { exitDemo } = useDemoMode();
  const [signingOut, setSigningOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    notifications,
    readIds,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
  } = useNotifications();

  const recentNotifications = notifications.slice(0, 5);

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", focusSearch);

    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = searchQuery.trim();

    router.push(query ? `/smart-search?q=${encodeURIComponent(query)}` : "/smart-search");
  }

  async function signOut() {
    if (signingOut) {
      return;
    }

    setSigningOut(true);

    if (isDemo) {
      exitDemo();
      router.replace("/login");
      return;
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Unable to sign out:", error);
      setSigningOut(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-[#ded7ca]/80 bg-[#f5f1e8]/92 px-4 backdrop-blur-xl md:px-6 lg:px-8">
      <div className="flex w-full max-w-[520px] items-center">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-serif text-lg font-semibold text-[#17283a] md:hidden"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#17283a] text-[#d5d66a]">
            <Home size={15} />
          </span>
          Home Tech Vault
        </Link>

        <form onSubmit={submitSearch} className="hidden w-full md:block">
          <div className="flex h-10 items-center gap-3 rounded-full border border-[#ded7ca]/80 bg-[#fffdf8] px-4 shadow-[0_1px_2px_rgba(23,40,58,0.03)]">
          <Search
            size={18}
            className="text-[#87977a]"
          />

          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Search your home"
            placeholder="Search your home..."
            className="min-w-0 flex-1 bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
          />

          <div className="hidden rounded-md border border-[#e4e2dc] bg-white px-2 py-1 text-[10px] font-medium text-slate-400 sm:block">
            ⌘ K
          </div>
          </div>
        </form>
      </div>

      <div className="ml-5 flex items-center gap-3">
        <Link
          href="/home"
          className="hidden h-10 items-center gap-2 rounded-full border border-[#ded7ca] bg-[#fffdf8] px-4 text-[13px] font-semibold text-[#263849] shadow-sm md:flex"
        >
          <Home
            size={16}
            className="text-[#718d4f]"
          />

          {householdLabel}

          <ChevronDown size={14} />
        </Link>

        <details className="group relative">
          <summary
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
            className="relative flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full text-slate-500 transition hover:bg-[#fffdf8] hover:text-[#17283a] [&::-webkit-details-marker]:hidden"
          >
            <Bell size={19} />

            {unreadCount > 0 ? (
              <span className="absolute right-[5px] top-[3px] flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#a6584e] px-1 text-[9px] font-bold leading-none text-white ring-2 ring-[#f5f1e8]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </summary>

          <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[min(390px,calc(100vw-32px))] overflow-hidden rounded-[20px] border border-[#ded7ca] bg-[#fffdf8] shadow-[0_20px_60px_rgba(23,40,58,0.18)]">
            <div className="flex items-center justify-between border-b border-[#e8e2d8] px-5 py-4">
              <div>
                <p className="font-serif text-xl font-semibold text-[#17283a]">
                  Notifications
                </p>
                <p className="mt-0.5 text-xs text-[#7a827c]">
                  {unreadCount > 0
                    ? `${unreadCount} unread ${unreadCount === 1 ? "update" : "updates"}`
                    : "You’re all caught up"}
                </p>
              </div>

              <span className="rounded-full bg-[#eef1e8] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#617c43]">
                Recent
              </span>
            </div>

            <div className="max-h-[430px] overflow-y-auto">
              {notificationsLoading ? (
                <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-[#7a827c]">
                  <Loader2 size={17} className="animate-spin" />
                  Loading updates...
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#eef1e8] text-[#617c43]">
                    <CheckCircle2 size={20} />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-[#17283a]">
                    Everything looks good
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#7a827c]">
                    New home reminders and updates will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#eee9df]">
                  {recentNotifications.map((notification) => {
                    const Icon = notification.icon;
                    const unread = !readIds.has(notification.id);

                    return (
                      <Link
                        key={notification.id}
                        href={notification.href}
                        onClick={() => markAsRead(notification.id)}
                        className="group/item flex gap-3 px-5 py-3.5 transition hover:bg-[#f4f1e9]"
                      >
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef1e8] text-[#617c43]">
                          <Icon size={17} />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex items-start gap-2">
                            <span className="line-clamp-2 flex-1 text-[13px] font-semibold leading-5 text-[#263849]">
                              {notification.title}
                            </span>
                            {unread ? (
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#a6584e]" />
                            ) : null}
                          </span>
                          <span className="mt-0.5 line-clamp-1 block text-xs text-[#7a827c]">
                            {notification.description}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              href="/notifications"
              className="flex items-center justify-center gap-2 border-t border-[#e8e2d8] bg-[#f8f5ee] px-5 py-3.5 text-sm font-semibold text-[#526b39] transition hover:bg-[#f0eee5]"
            >
              View all notifications
              <ArrowRight size={15} />
            </Link>
          </div>
        </details>

        <details className="group relative border-l border-[#e4e2dc] pl-4">
          <summary className="flex cursor-pointer list-none items-center gap-3 rounded-full py-1 outline-none [&::-webkit-details-marker]:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ece8de] text-[12px] font-semibold text-slate-600">
              {initials}
            </span>

            <span className="hidden text-left xl:block">
              <span className="block text-[13px] font-semibold text-slate-800">
                {displayName}
              </span>

              <span className="block text-[11px] text-slate-400">
                {roleLabel}
              </span>
            </span>

            <ChevronDown
              size={14}
              className="hidden text-slate-400 transition-transform group-open:rotate-180 xl:block"
            />
          </summary>

          <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-56 overflow-hidden rounded-[18px] border border-[#ded7ca] bg-[#fffdf8] p-2 shadow-[0_18px_50px_rgba(23,40,58,0.16)]">
            <div className="border-b border-[#e8e2d8] px-3 pb-3 pt-2 xl:hidden">
              <p className="text-sm font-semibold text-[#17283a]">{displayName}</p>
              <p className="mt-0.5 text-xs text-[#7a827c]">{roleLabel}</p>
            </div>

            {showAdminControlCenter ? (
              <>
                <Link
                  href="/admin"
                  className="flex items-center gap-3 rounded-xl bg-[#17283a] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#223b53]"
                >
                  <ShieldCheck size={16} className="text-[#d5d66a]" />
                  Admin Control Center
                </Link>
                <div className="mx-2 my-2 h-px bg-[#e8e2d8]" />
              </>
            ) : null}

            <Link href="/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#40505d] hover:bg-[#f0ece3] hover:text-[#17283a]">
              <Settings size={16} />
              Settings
            </Link>
            <Link href="/family" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#40505d] hover:bg-[#f0ece3] hover:text-[#17283a]">
              <Home size={16} />
              Household
            </Link>
            <Link href="/notifications" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#40505d] hover:bg-[#f0ece3] hover:text-[#17283a]">
              <Bell size={16} />
              Notifications
            </Link>

            <div className="mx-2 my-2 h-px bg-[#e8e2d8]" />

            <button
              type="button"
              onClick={() => void signOut()}
              disabled={signingOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#9a4f47] transition hover:bg-[#f7ebe8] hover:text-[#7d3f39] disabled:cursor-wait disabled:opacity-60"
            >
              {signingOut ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <LogOut size={16} />
              )}
              {signingOut
                ? isDemo
                  ? "Exiting demo..."
                  : "Signing out..."
                : isDemo
                  ? "Exit Demo"
                  : "Sign Out"}
            </button>
          </div>
        </details>
      </div>
    </header>
  );
}

export default function AppShell({
  children,
}: AppShellProps) {
  const {
    user,
    isDemo,
    roleDisplayName,
    isVerifiedPlatformAdmin,
  } = usePermissions();

  const userMetadata = user?.user_metadata ?? {};
  const realDisplayName =
    stringValue(userMetadata.full_name) ||
    stringValue(userMetadata.name) ||
    user?.email?.split("@")[0] ||
    "Homeowner";
  const displayName = isDemo ? demoProfile.full_name : realDisplayName;
  const householdLabel = isDemo
    ? demoDashboard.householdName
    : stringValue(userMetadata.household_name) || "Your home";
  const roleLabel = isDemo
    ? "Demo homeowner"
    : isVerifiedPlatformAdmin
      ? "Master Account"
      : roleDisplayName || "Homeowner";
  const initials = getInitials(displayName);

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#17212a]">
      <div className="flex min-h-screen">
        <Sidebar
          showAdminControlCenter={isVerifiedPlatformAdmin}
        />

        <div className="min-w-0 flex-1">
          <TopBar
            householdLabel={householdLabel}
            displayName={displayName}
            initials={initials}
            roleLabel={roleLabel}
            showAdminControlCenter={isVerifiedPlatformAdmin}
            isDemo={isDemo}
          />

          <div className="[&_h1]:font-serif [&_h2]:font-serif">
            {children}
          </div>

          <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-[20px] border border-[#ded7ca] bg-[#fffdf8]/95 px-2 py-2 shadow-[0_16px_48px_rgba(23,40,58,0.16)] backdrop-blur-xl md:hidden">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  className="flex min-w-12 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[9px] font-medium text-[#66716b]"
                >
                  <Icon size={18} strokeWidth={1.8} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "HTV";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
