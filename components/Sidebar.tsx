"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  BarChart3,
  Building2,
  CreditCard,
  FileText,
  House,
  Laptop,
  MessageSquare,
  Settings,
  Shield,
  Sparkles,
  User,
  Wifi,
  Wrench,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useDemoMode } from "@/hooks/useDemoMode";
import { Users } from "lucide-react";

import {
  demoDashboard,
  demoProfile,
} from "@/lib/demoData";

type Profile = {
  full_name: string | null;
  household_name: string | null;
  avatar_url: string | null;
};

type NavigationItem = {
  href: string;
  label: string;
  icon: typeof House;
};

const mainNavigation: NavigationItem[] = [
  {
    href: "/dashboard",
    icon: House,
    label: "Home",
  },
  {
    href: "/devices",
    icon: Laptop,
    label: "Devices",
  },
  {
    href: "/home",
    icon: Building2,
    label: "Rooms",
  },
  {
    href: "/network",
    icon: Wifi,
    label: "Network",
  },
  {
    href: "/documents",
    icon: FileText,
    label: "Documents",
  },
  {
    href: "/warranties",
    icon: Shield,
    label: "Warranties",
  },
  {
    href: "/maintenance",
    icon: Wrench,
    label: "Maintenance",
  },
  {
    href: "/subscriptions",
    icon: CreditCard,
    label: "Subscriptions",
  },
  {
    href: "/reports",
    icon: BarChart3,
    label: "Reports",
  },
  {
    href: "/insights",
    icon: Sparkles,
    label: "Insights",
  },
];

const secondaryNavigation: NavigationItem[] = [
  {
    href: "/account",
    icon: User,
    label: "Account",
  },
  {
    href: "/family",
    icon: Users,
    label: "Family",
  },
  {
    href: "/settings",
    icon: Settings,
    label: "Settings",
  },
  {
    href: "/contact",
    icon: MessageSquare,
    label: "Contact",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const {
    user,
    isDemo,
    loading: demoModeLoading,
  } = useDemoMode();

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [email, setEmail] =
    useState("");

  const [deviceCount, setDeviceCount] =
    useState(0);

  const [totalValue, setTotalValue] =
    useState(0);

  const [
    loadingSidebar,
    setLoadingSidebar,
  ] = useState(true);

  useEffect(() => {
    async function loadSidebarData() {
      if (demoModeLoading) {
        return;
      }

      try {
        setLoadingSidebar(true);

        if (isDemo) {
          setProfile({
            full_name:
              demoProfile.full_name,
            household_name:
              demoProfile.household_name,
            avatar_url: null,
          });

          setEmail(
            demoProfile.email
          );

          setDeviceCount(
            demoDashboard.deviceCount
          );

          setTotalValue(
            demoDashboard.protectedValue
          );

          return;
        }

        if (!user) {
          setProfile(null);
          setEmail("");
          setDeviceCount(0);
          setTotalValue(0);
          return;
        }

        setEmail(
          user.email || ""
        );

        const [
          profileResult,
          devicesResult,
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select(
              "full_name, household_name, avatar_url"
            )
            .eq("id", user.id)
            .maybeSingle(),

          supabase
            .from("devices")
            .select(
              "purchase_price"
            )
            .eq(
              "user_id",
              user.id
            ),
        ]);

        if (
          profileResult.error
        ) {
          console.error(
            "Sidebar profile error:",
            profileResult.error
          );
        }

        if (
          devicesResult.error
        ) {
          throw devicesResult.error;
        }

        setProfile(
          profileResult.data
            ? (profileResult.data as Profile)
            : null
        );

        const devices =
          devicesResult.data || [];

        setDeviceCount(
          devices.length
        );

        const protectedValue =
          devices.reduce(
            (
              total,
              device
            ) =>
              total +
              Number(
                device.purchase_price ||
                  0
              ),
            0
          );

        setTotalValue(
          protectedValue
        );
      } catch (error) {
        console.error(
          "Sidebar loading error:",
          error
        );

        if (isDemo) {
          setProfile({
            full_name:
              demoProfile.full_name,
            household_name:
              demoProfile.household_name,
            avatar_url: null,
          });

          setEmail(
            demoProfile.email
          );

          setDeviceCount(
            demoDashboard.deviceCount
          );

          setTotalValue(
            demoDashboard.protectedValue
          );
        }
      } finally {
        setLoadingSidebar(false);
      }
    }

    loadSidebarData();
  }, [
    user,
    isDemo,
    demoModeLoading,
  ]);

  const displayName =
    profile?.full_name?.trim() ||
    email.split("@")[0] ||
    (isDemo
      ? "Demo User"
      : "Homeowner");

  const firstName =
    displayName.split(" ")[0];

  const householdName =
    profile?.household_name?.trim() ||
    (isDemo
      ? "The Demo Home"
      : `${firstName}'s Home`);

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) =>
      name[0]?.toUpperCase()
    )
    .join("");

  function isLinkActive(
    href: string
  ) {
    if (
      href === "/dashboard"
    ) {
      return (
        pathname ===
        "/dashboard"
      );
    }

    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`
      )
    );
  }

  return (
    <aside className="hidden h-screen w-[272px] shrink-0 flex-col border-r border-[#E8E2D6] bg-[#FCFBF8] lg:flex">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-2xl px-3 py-2 transition hover:bg-white"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#111827] text-sm font-semibold text-white shadow-sm">
            HT
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#111827]">
              Home Tech Vault
            </p>

            <p className="mt-0.5 truncate text-xs text-neutral-400">
              Organize · Protect · Simplify
            </p>
          </div>
        </Link>

        <Link
          href={
            isDemo
              ? "/signup"
              : "/account"
          }
          className="mt-5 rounded-[22px] border border-[#E8E2D6] bg-white p-3.5 shadow-sm transition hover:border-[#D8C69D]"
        >
          <div className="flex items-center gap-3">
            {profile?.avatar_url &&
            !isDemo ? (
              <img
                src={
                  profile.avatar_url
                }
                alt={displayName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F7F5EF] text-xs font-semibold text-[#8A6A2F]">
                {initials ||
                  "HT"}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#111827]">
                {loadingSidebar
                  ? "Loading..."
                  : firstName}
              </p>

              <p className="mt-0.5 truncate text-xs text-neutral-400">
                {householdName}
              </p>
            </div>
          </div>
        </Link>

        <nav className="mt-7">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
            Menu
          </p>

          <div className="mt-2 space-y-1">
            {mainNavigation.map(
              ({
                href,
                label,
                icon: Icon,
              }) => {
                const active =
                  isLinkActive(
                    href
                  );

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-[#111827] text-white shadow-sm"
                        : "text-neutral-600 hover:bg-white hover:text-[#111827]"
                    }`}
                  >
                    <Icon
                      size={18}
                      strokeWidth={
                        active
                          ? 2.2
                          : 1.8
                      }
                      className={
                        active
                          ? "text-[#C8A96A]"
                          : "text-neutral-400 transition group-hover:text-[#8A6A2F]"
                      }
                    />

                    <span className="flex-1">
                      {label}
                    </span>

                    {active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#C8A96A]" />
                    )}
                  </Link>
                );
              }
            )}
          </div>
        </nav>

        <nav className="mt-7 border-t border-[#E8E2D6] pt-6">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
            Account
          </p>

          <div className="mt-2 space-y-1">
            {secondaryNavigation.map(
              ({
                href,
                label,
                icon: Icon,
              }) => {
                const active =
                  isLinkActive(
                    href
                  );

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-white text-[#111827] shadow-sm"
                        : "text-neutral-500 hover:bg-white hover:text-[#111827]"
                    }`}
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.8}
                      className={
                        active
                          ? "text-[#8A6A2F]"
                          : "text-neutral-400 transition group-hover:text-[#8A6A2F]"
                      }
                    />

                    {label}
                  </Link>
                );
              }
            )}
          </div>
        </nav>
      </div>

      <div className="border-t border-[#E8E2D6] p-4">
        <Link
          href="/dashboard"
          className="block rounded-[24px] bg-[#111827] p-4 text-white shadow-md transition hover:bg-[#1B2434]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C8A96A]">
                Your Vault
              </p>

              <p className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                {loadingSidebar
                  ? "—"
                  : deviceCount}
              </p>

              <p className="mt-0.5 text-xs text-white/50">
                Devices protected
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-[#C8A96A]">
              <Shield
                size={19}
              />
            </div>
          </div>

          <div className="mt-4 border-t border-white/10 pt-4">
            <p className="text-xs text-white/40">
              Protected value
            </p>

            <p className="mt-1 truncate text-lg font-semibold">
              {loadingSidebar
                ? "—"
                : formatCurrency(
                    totalValue
                  )}
            </p>
          </div>
        </Link>

        {isDemo && (
          <Link
            href="/signup"
            className="mt-3 block rounded-2xl border border-[#D8C69D] bg-[#FFF8E8] px-4 py-3 text-center text-xs font-semibold text-[#8A6A2F] transition hover:bg-[#FFF2D5]"
          >
            Create your own vault
          </Link>
        )}
      </div>
    </aside>
  );
}

function formatCurrency(
  value: number
) {
  return value.toLocaleString(
    undefined,
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }
  );
}