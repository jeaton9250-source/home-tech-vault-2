"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ChevronDown,
  LogOut,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import Badge from "@/components/ui/Badge";

import DropdownMenu from "@/components/navigation/DropdownMenu";

import { useAIAdvisor } from "@/hooks/useAIAdvisor";
import { useDemoMode } from "@/hooks/useDemoMode";
import { useNavMenu } from "@/hooks/useNavMenu";
import { usePermissions } from "@/hooks/usePermissions";

import { PROFILE_MENU_ITEMS } from "@/lib/navigation/config";
import { NAV_MENU_IDS } from "@/lib/navigation/menuIds";
import { shouldShowPremiumBadge } from "@/lib/navigation/navVisibility";
import { cn } from "@/lib/design-system/cn";

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
    vaultContextLabel,
    isPlatformAdmin,
    isVerifiedPlatformAdmin,
    permissionsReady,
    canManageBilling,
    billingManagedByHousehold,
    billingOwnerName,
    canViewFeature,
    inheritsFamilyPlan,
    hasFamilyFeatureAccess,
  } = usePermissions();

  const { open: openAdvisor } = useAIAdvisor();

  const [displayName, setDisplayName] =
    useState("Account");

  const [email, setEmail] = useState("");

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

  const effectivePlanLabel = isPlatformAdmin
    ? "Platform Admin"
    : planDisplayName || "Free";

  const { adminItems, regularItems } =
    useMemo(() => {
      const admin: typeof PROFILE_MENU_ITEMS =
        [];
      const regular: typeof PROFILE_MENU_ITEMS =
        [];

      for (const item of PROFILE_MENU_ITEMS) {
        if (item.adminOnly) {
          if (
            permissionsReady &&
            isVerifiedPlatformAdmin
          ) {
            admin.push(item);
          }

          continue;
        }

        if (item.requiresBillingAccess) {
          if (canManageBilling) {
            regular.push(item);
          }

          continue;
        }

        if (
          item.feature &&
          !canViewFeature(item.feature)
        ) {
          continue;
        }

        regular.push(item);
      }

      return {
        adminItems: admin,
        regularItems: regular,
      };
    }, [
      canManageBilling,
      canViewFeature,
      isVerifiedPlatformAdmin,
      permissionsReady,
    ]);

  return (
    <DropdownMenu
      menuId={NAV_MENU_IDS.profile}
      align="end"
      widthClass="w-72"
      trigger={(triggerProps) => (
        <button
          type="button"
          {...triggerProps}
          className={cn(
            "htv-focus-ring flex items-center gap-2 text-sm transition",
            compact
              ? "h-9 rounded-full px-2.5 text-text-primary hover:bg-surface-sunken"
              : "rounded-[var(--radius-button)] border border-border-subtle bg-surface-card px-2 py-1.5 hover:bg-surface-sunken"
          )}
          aria-label="Open account menu"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border-subtle bg-surface-sunken text-[0.68rem] font-semibold text-charcoal shadow-[var(--shadow-inset)]">
            {initials || "HT"}
          </span>

          {compact ? (
            <ChevronDown
              size={14}
              className="text-text-tertiary"
            />
          ) : (
            <>
              <span className="hidden max-w-[140px] truncate font-medium text-text-primary xl:inline">
                {displayName}
              </span>

              <ChevronDown
                size={16}
                className="hidden text-text-tertiary xl:block"
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

        {email ? (
          <p className="truncate text-xs text-text-secondary">
            {email}
          </p>
        ) : null}

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

          {vaultContextLabel ? (
            <Badge variant="accent">
              {vaultContextLabel}
            </Badge>
          ) : null}
        </div>

        {billingManagedByHousehold &&
          !canManageBilling ? (
            <p className="mt-3 text-xs leading-5 text-text-secondary">
              Managed by your Family Plan Admin
              {billingOwnerName
                ? ` (${billingOwnerName})`
                : ""}
            </p>
          ) : null}
      </div>

      <div className="p-2">
        {adminItems.length > 0 ? (
          <div className="mb-2 border-b border-border-subtle pb-2">
            {adminItems.map((item) => (
              <ProfileLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                description={item.description}
                onSelect={closeMenu}
              />
            ))}
          </div>
        ) : null}

        {regularItems.map((item) => {
          const badge = shouldShowPremiumBadge(
            item.feature,
            canViewFeature,
            inheritsFamilyPlan,
            hasFamilyFeatureAccess
          );

          return (
            <ProfileLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              description={item.description}
              badge={badge}
              onSelect={closeMenu}
            />
          );
        })}

        {canViewFeature("aiAdvisor") ? (
          <button
            type="button"
            role="menuitem"
            tabIndex={-1}
            onClick={() => {
              closeMenu();
              openAdvisor();
            }}
            className="flex w-full items-start gap-2 rounded-[var(--radius-button)] px-3 py-2.5 text-sm text-text-secondary hover:bg-surface-sunken hover:text-text-primary focus-visible:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
          >
            <Sparkles size={16} className="mt-0.5 shrink-0" />
            <span className="min-w-0 flex-1 text-left">
              <span className="block">AI Advisor</span>
              <span className="mt-0.5 block text-xs leading-5 text-text-tertiary">
                Ask questions about your household tech
              </span>
            </span>
          </button>
        ) : null}

        {!isDemo && user ? (
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
        ) : null}
      </div>
    </DropdownMenu>
  );
}

function ProfileLink({
  href,
  icon: Icon,
  label,
  description,
  badge,
  onSelect,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  description?: string;
  badge?: string | null;
  onSelect: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      tabIndex={-1}
      onClick={onSelect}
      className="flex items-start gap-2 rounded-[var(--radius-button)] px-3 py-2.5 text-sm text-text-secondary hover:bg-surface-sunken hover:text-text-primary focus-visible:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25"
    >
      <Icon size={16} className="mt-0.5 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs leading-5 text-text-tertiary">
            {description}
          </span>
        ) : null}
      </span>
      {badge ? (
        <Badge variant="premium">{badge}</Badge>
      ) : null}
    </Link>
  );
}
