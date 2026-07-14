"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bot,
  Building2,
  CreditCard,
  FileText,
  House,
  Laptop,
  ReceiptText,
  Settings,
  Shield,
  Sparkles,
  User,
  Wifi,
  Wrench,
  MessageSquare
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useDemoMode } from "@/hooks/useDemoMode";
import {
  demoDashboard,
  demoProfile,
} from "@/lib/demoData";

type Profile = {
  full_name: string | null;
  household_name: string | null;
  avatar_url: string | null;
};

const navigationGroups = [
  {
    label: "Home",
    links: [
      {
        href: "/dashboard",
        icon: House,
        label: "Overview",
      },
      {
        href: "/home",
        icon: Building2,
        label: "Home View",
      },
    ],
  },
  {
    label: "Inventory",
    links: [
      {
        href: "/devices",
        icon: Laptop,
        label: "Devices",
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
        href: "/network",
        icon: Wifi,
        label: "Network",
      },
    ],
  },
{
  label: "Management",
  links: [
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
      label: "Vault Insights",
    },
  ],
},
  {
    label: "Tools",
    links: [
      {
        href: "/ai",
        icon: Bot,
        label: "AI Advisor",
      },
      {
  href: "/account",
  icon: User,
  label: "My Account",
},

{
  label: "Contact Us",
  href: "/contact",
  icon: MessageSquare,
},
      
    ],
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

  const [email, setEmail] = useState("");
  const [deviceCount, setDeviceCount] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [loadingSidebar, setLoadingSidebar] =
    useState(true);

  useEffect(() => {
    async function loadSidebarData() {
      if (demoModeLoading) {
        return;
      }

      try {
        setLoadingSidebar(true);

        if (isDemo) {
          setProfile({
            full_name: demoProfile.full_name,
            household_name:
              demoProfile.household_name,
            avatar_url: null,
          });

          setEmail(demoProfile.email);

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

        setEmail(user.email || "");

        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select(
            "full_name, household_name, avatar_url"
          )
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error(
            "Sidebar profile error:",
            profileError
          );
        } else if (profileData) {
          setProfile(
            profileData as Profile
          );
        } else {
          setProfile(null);
        }

        const {
          data: devices,
          error: devicesError,
        } = await supabase
          .from("devices")
          .select("purchase_price")
          .eq("user_id", user.id);

        if (devicesError) {
          throw devicesError;
        }

        setDeviceCount(
          devices?.length || 0
        );

        const protectedValue =
          devices?.reduce(
            (total, device) =>
              total +
              Number(
                device.purchase_price || 0
              ),
            0
          ) || 0;

        setTotalValue(protectedValue);
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

          setEmail(demoProfile.email);

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
    (isDemo ? "Demo User" : "Homeowner");

  const firstName =
    displayName.split(" ")[0];

  const householdName =
    profile?.household_name?.trim() ||
    (isDemo
      ? "The Demo Home"
      : `${firstName}'s Home Tech Vault`);

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) =>
      name[0]?.toUpperCase()
    )
    .join("");

  function isLinkActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  return (
    <aside className="hidden h-screen w-72 shrink-0 flex-col overflow-y-auto border-r border-[#E8E2D6] bg-white px-5 py-6 lg:flex">
      <Link
        href={isDemo ? "/dashboard" : "/profile"}
        className="rounded-3xl border border-[#E8E2D6] bg-[#F7F5EF] p-4 transition hover:border-[#C8A96A] hover:shadow-sm"
      >
        <div className="flex items-center gap-3">
          {profile?.avatar_url && !isDemo ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#111827] text-sm font-bold text-white">
              {initials || "HT"}
            </div>
          )}

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
              {isDemo
                ? "Interactive Demo"
                : "Welcome home"}
            </p>

            <h2 className="truncate text-lg font-bold text-[#111827]">
              {loadingSidebar
                ? "Loading..."
                : firstName}
            </h2>
          </div>
        </div>

        <p className="mt-4 truncate text-sm font-semibold text-[#111827]">
          {householdName}
        </p>

        <p className="mt-1 truncate text-xs text-neutral-500">
          {isDemo
            ? "Sample household"
            : email || "Account"}
        </p>
      </Link>

      <nav className="mt-7 space-y-7">
        {navigationGroups.map(
          (group) => (
            <div key={group.label}>
              <p className="mb-2 px-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[#C8A96A]">
                {group.label}
              </p>

              <div className="space-y-1">
                {group.links.map(
                  ({
                    href,
                    icon: Icon,
                    label,
                  }) => {
                    const active =
                      isLinkActive(href);

                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                          active
                            ? "bg-[#111827] text-white shadow-sm"
                            : "text-neutral-700 hover:bg-[#F7F5EF]"
                        }`}
                      >
                        <Icon
                          size={19}
                          className={
                            active
                              ? "text-[#C8A96A]"
                              : "text-neutral-500"
                          }
                        />

                        {label}
                      </Link>
                    );
                  }
                )}
              </div>
            </div>
          )
        )}
      </nav>

      <div className="mt-auto pt-8">
        <div className="rounded-3xl bg-[#111827] p-5 text-white shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96A]">
                Technology Health
              </p>

              <h2 className="mt-3 text-4xl font-bold">
                {isDemo ? "92" : "94"}
              </h2>

              <p className="mt-1 text-sm text-neutral-300">
                Excellent
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-3">
              <Shield
                size={22}
                className="text-[#C8A96A]"
              />
            </div>
          </div>

          <div className="my-5 h-px bg-white/10" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-neutral-400">
                Devices
              </p>

              <p className="mt-1 text-lg font-semibold">
                {loadingSidebar
                  ? "—"
                  : deviceCount}
              </p>
            </div>

            <div>
              <p className="text-xs text-neutral-400">
                Protected value
              </p>

              <p className="mt-1 truncate text-lg font-semibold">
                {loadingSidebar
                  ? "—"
                  : `$${totalValue.toLocaleString(
                      undefined,
                      {
                        maximumFractionDigits: 0,
                      }
                    )}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}