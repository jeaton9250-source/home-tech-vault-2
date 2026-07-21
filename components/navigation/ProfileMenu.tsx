"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Settings,
  User,
} from "lucide-react";

import Badge from "@/components/ui/Badge";

import DropdownMenu from "@/components/navigation/DropdownMenu";

import { useDemoMode } from "@/hooks/useDemoMode";
import { useNavMenu } from "@/hooks/useNavMenu";
import { usePermissions } from "@/hooks/usePermissions";

import { NAV_MENU_IDS } from "@/lib/navigation/menuIds";

import { supabase } from "@/lib/supabase";
import { MORGAN_HOUSEHOLD } from "@/lib/demo/morganHousehold";

type ProfileMenuProps = {
  compact?: boolean;
};

export default function ProfileMenu({
  compact = false,
}: ProfileMenuProps) {
  const router = useRouter();
  const { closeMenu } = useNavMenu();

  const { user, isDemo } = useDemoMode();

  const {
    planDisplayName,
    roleDisplayName,
    vaultContextLabel,
    isPlatformAdmin,
    isVerifiedPlatformAdmin,
    canManageBilling,
    billingManagedByHousehold,
    billingOwnerName,
  } = usePermissions();

  const [displayName, setDisplayName] =
    useState("Account");

  const [email, setEmail] =
    useState("");

  useEffect(() => {
    async function loadProfile() {
      if (isDemo) {
        setDisplayName(MORGAN_HOUSEHOLD.fullName);
        setEmail(MORGAN_HOUSEHOLD.email);
        return;
      }

      if (!user) {
        setDisplayName("Account");
        setEmail("");
        return;
      }

      setEmail(user.email || "");

      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      setDisplayName(
        data?.full_name?.trim() ||
          user.email?.split("@")[0] ||
          "Account"
      );
    }

    void loadProfile();
  }, [user, isDemo]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const effectivePlanLabel =
    isPlatformAdmin
      ? "Platform Admin"
      : planDisplayName || "Free";

  return (
    <DropdownMenu
      menuId={NAV_MENU_IDS.profile}
      align="end"
      widthClass="w-72"
      trigger={(triggerProps) => (
        <button
          type="button"
          {...triggerProps}
          className="htv-focus-ring flex items-center gap-2 rounded-[var(--radius-button)] border border-border-subtle bg-surface-card px-2 py-1.5 text-sm hover:bg-surface-sunken"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle bg-surface-sunken text-xs font-semibold text-charcoal shadow-[var(--shadow-inset)]">
            {initials || "HT"}
          </span>

          {!compact && (
            <>
              <span className="hidden max-w-[120px] truncate font-medium text-text-primary md:inline">
                {displayName}
              </span>

              <ChevronDown
                size={16}
                className="hidden text-text-tertiary md:block"
              />
            </>
          )}
        </button>
      )}
    >
      <div className="border-b border-border-subtle px-4 py-4">
        <p className="truncate text-sm font-medium text-text-primary">
          {displayName}
        </p>

        {email && (
          <p className="truncate text-xs text-text-secondary">
            {email}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <Badge
            variant={
              isPlatformAdmin ||
              planDisplayName !== "Free"
                ? "premium"
                : "neutral"
            }
          >
            {effectivePlanLabel}
          </Badge>

          {vaultContextLabel && (
            <Badge variant="accent">
              {vaultContextLabel}
            </Badge>
          )}
        </div>

        {billingManagedByHousehold &&
          !canManageBilling && (
            <p className="mt-3 text-xs leading-5 text-text-secondary">
              Managed by your Family Plan
              Admin
              {billingOwnerName
                ? ` (${billingOwnerName})`
                : ""}
            </p>
          )}
      </div>

      <div className="p-2">
        <ProfileLink
          href={
            isDemo
              ? "/signup"
              : "/account"
          }
          icon={User}
          label="Account"
          onSelect={closeMenu}
        />

        <ProfileLink
          href="/settings"
          icon={Settings}
          label="Settings"
          onSelect={closeMenu}
        />

        {canManageBilling && (
          <ProfileLink
            href="/settings/billing"
            icon={CreditCard}
            label="Billing"
            onSelect={closeMenu}
          />
        )}

        {isVerifiedPlatformAdmin && (
          <>
            <ProfileLink
              href="/admin"
              icon={LayoutDashboard}
              label="Platform Overview"
              onSelect={closeMenu}
            />

            <ProfileLink
              href="/admin/support"
              icon={LifeBuoy}
              label="Support Inbox"
              onSelect={closeMenu}
            />
          </>
        )}

        {!isDemo && user && (
          <button
            type="button"
            role="menuitem"
            tabIndex={-1}
            onClick={() => {
              closeMenu();
              void signOut();
            }}
            className="flex w-full items-center gap-2 rounded-[var(--radius-button)] px-3 py-2.5 text-sm text-text-secondary hover:bg-surface-sunken hover:text-text-primary focus-visible:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        )}
      </div>
    </DropdownMenu>
  );
}

function ProfileLink({
  href,
  icon: Icon,
  label,
  onSelect,
}: {
  href: string;
  icon: typeof User;
  label: string;
  onSelect: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      tabIndex={-1}
      onClick={onSelect}
      className="flex items-center gap-2 rounded-[var(--radius-button)] px-3 py-2.5 text-sm text-text-secondary hover:bg-surface-sunken hover:text-text-primary focus-visible:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
    >
      <Icon size={16} />
      {label}
    </Link>
  );
}
