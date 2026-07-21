"use client";

import {
  useEffect,
  useState,
  type ComponentType,
} from "react";

import {
  ArrowUpRight,
  Crown,
  LogOut,
  Mail,
  Palette,
  ShieldCheck,
  User,
  WalletCards,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { usePermissions } from "@/hooks/usePermissions";
import {
  formatSubscriptionStatus,
  getPlanDescription,
} from "@/lib/permissions/effectivePlan";
import PlanAccessSummary from "@/components/permissions/PlanAccessSummary";

import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import PageHero from "@/components/ui/PageHero";
import IconWell from "@/components/ui/IconWell";
import Button from "@/components/ui/Button";
import type { ReactNode } from "react";

type SettingsIcon = ComponentType<{
  size?: number;
  className?: string;
}>;

export default function SettingsPage() {
  const [email, setEmail] =
    useState("");

  const [signingOut, setSigningOut] =
    useState(false);

  const {
    user,
    loading: permissionsLoading,
    plan,
    planDisplayName,
    roleDisplayName,
    effectiveStatus,
    currentPeriodEnd,
    isFree,
    isPlatformAdmin,
    canManageBilling,
    billingManagedByHousehold,
  } = usePermissions();

  useEffect(() => {
    if (permissionsLoading) {
      return;
    }

    setEmail(user?.email || "");
  }, [user, permissionsLoading]);

  async function signOut() {
    try {
      setSigningOut(true);

      const { error } =
        await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      window.location.href =
        "/login";
    } catch (error) {
      console.error(
        "Unable to sign out:",
        error
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to sign out."
      );
    } finally {
      setSigningOut(false);
    }
  }

  const planName = isPlatformAdmin
    ? "Master Account"
    : `${planDisplayName} Plan`;

  const subscriptionStatus =
    isPlatformAdmin
      ? "Active"
      : formatSubscriptionStatus(
          effectiveStatus
        );

  const hasActiveAccess =
    isPlatformAdmin ||
    effectiveStatus === "active" ||
    effectiveStatus === "trialing";

  return (
    <PageShell>
      <PageHero
        section="neutral"
        eyebrow="Account Preferences"
        title="Settings."
        description="Manage your account, subscription, billing, and Home Tech Vault preferences."
      >
        {canManageBilling ? (
          <Button href="/settings/billing">
            <WalletCards size={17} />
            Manage Billing
          </Button>
        ) : billingManagedByHousehold ? (
          <Button href="/family">
            <WalletCards size={17} />
            View Household
          </Button>
        ) : null}
      </PageHero>

      <PageCard className="overflow-hidden p-0">
        <div className="border-b border-border-subtle bg-gradient-to-br from-section-insights-soft via-surface-card to-surface-base p-7 md:p-9">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <IconWell
                icon={
                  isFree && !isPlatformAdmin
                    ? ShieldCheck
                    : Crown
                }
                section="insights"
                size="lg"
              />

              <div>
                <p className="text-overline text-section-insights">
                  Current Plan
                </p>

                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-text-primary">
                  {permissionsLoading
                    ? "Loading plan..."
                    : planName}
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">
                  {permissionsLoading
                    ? "Checking your subscription information."
                    : isPlatformAdmin
                      ? "All Home Tech Vault features are unlocked."
                      : getPlanDescription(plan)}
                </p>

                {roleDisplayName && (
                  <p className="mt-3 text-sm font-semibold text-section-insights">
                    Household Role: {roleDisplayName}
                  </p>
                )}
              </div>
            </div>

            {!permissionsLoading && (
              <span
                className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  hasActiveAccess
                    ? "bg-home-health-soft text-home-health"
                    : "bg-surface-sunken text-text-secondary"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    hasActiveAccess
                      ? "bg-home-health"
                      : "bg-text-tertiary"
                  }`}
                />

                {isPlatformAdmin
                  ? "Master Access"
                  : subscriptionStatus}
              </span>
            )}
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <PlanDetail
              label="Plan"
              value={
                permissionsLoading
                  ? "Loading..."
                  : isPlatformAdmin
                    ? "Master"
                    : planDisplayName
              }
            />

            {roleDisplayName && (
              <PlanDetail
                label="Household Role"
                value={roleDisplayName}
              />
            )}

            <PlanDetail
              label="Status"
              value={
                permissionsLoading
                  ? "Loading..."
                  : subscriptionStatus
              }
            />

            <PlanDetail
              label={
                effectiveStatus === "canceled"
                  ? "Access Ends"
                  : "Renewal Date"
              }
              value={
                permissionsLoading
                  ? "Loading..."
                  : isPlatformAdmin
                    ? "No expiration"
                    : currentPeriodEnd
                      ? formatSubscriptionDate(
                          currentPeriodEnd
                        )
                      : "Not applicable"
              }
            />
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            {canManageBilling && (
              <Button
                href="/settings/billing"
                variant="secondary"
              >
                <ArrowUpRight
                  size={17}
                />
                Billing Settings
              </Button>
            )}

            {!permissionsLoading &&
              !isPlatformAdmin &&
              isFree &&
              !billingManagedByHousehold && (
                <Button
                  href="/upgrade"
                  variant="secondary"
                >
                  <Crown size={17} />
                  View Upgrade Options
                </Button>
              )}
          </div>
        </div>
      </PageCard>

      {!permissionsLoading &&
        billingManagedByHousehold && (
          <PageCard>
            <PlanAccessSummary compact />
          </PageCard>
        )}

      <section className="grid gap-6 xl:grid-cols-2">
        <SettingsSection
          icon={User}
          eyebrow="Account"
          title="Account information"
          description="Your sign-in and subscription details."
        >
          <SettingsRow
            icon={Mail}
            label="Email"
            value={
              email ||
              "Not signed in"
            }
          />

          <SettingsRow
            icon={Crown}
            label="Plan"
            value={
              permissionsLoading
                ? "Loading..."
                : planName
            }
          />

          {roleDisplayName && (
            <SettingsRow
              icon={ShieldCheck}
              label="Household Role"
              value={roleDisplayName}
            />
          )}

          <SettingsRow
            icon={ShieldCheck}
            label="Status"
            value={
              permissionsLoading
                ? "Loading..."
                : subscriptionStatus
            }
          />

          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-5 text-sm font-semibold text-red-700 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut size={17} />

            {signingOut
              ? "Signing Out..."
              : "Sign Out"}
          </button>
        </SettingsSection>

        <SettingsSection
          icon={Palette}
          eyebrow="Preferences"
          title="Display preferences"
          description="Default display options for your vault."
        >
          <SettingsRow
            icon={Palette}
            label="Theme"
            value="Light Mode"
          />

          <SettingsRow
            icon={WalletCards}
            label="Currency"
            value="USD"
          />

          <SettingsRow
            icon={CalendarIcon}
            label="Date Format"
            value="MM/DD/YYYY"
          />

          <p className="mt-5 text-xs leading-5 text-text-tertiary">
            Additional theme, currency,
            and date preferences can be
            added in a future update.
          </p>
        </SettingsSection>
      </section>

      <PageCard className="p-7 md:p-9">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
              <ShieldCheck
                size={20}
              />
            </div>

            <div>
              <p className="text-overline text-section-insights">
                Account Access
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text-primary">
                Premium feature access
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-text-secondary">
                Your subscription controls
                access to features such as
                network discovery, premium
                insights, advanced reports,
                insurance exports, and
                future smart tools. Billing
                changes are managed securely
                through Stripe.
              </p>
            </div>
          </div>

          {!isPlatformAdmin &&
            isFree && (
              <Button
                href="/upgrade"
                variant="secondary"
                className="shrink-0"
              >
                <Crown size={17} />
                Upgrade
              </Button>
            )}
        </div>
      </PageCard>
    </PageShell>
  );
}

function SettingsSection({
  icon: Icon,
  eyebrow,
  title,
  description,
  children,
}: {
  icon: SettingsIcon;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <PageCard className="p-7 md:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
          <Icon size={20} />
        </div>

        <div>
          <p className="text-overline text-section-insights">
            {eyebrow}
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text-primary">
            {title}
          </h2>

          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-7 space-y-3">
        {children}
      </div>
    </PageCard>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  value,
}: {
  icon: SettingsIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-[22px] bg-surface-sunken p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-card text-charcoal shadow-[var(--shadow-sm)]">
        <Icon size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-text-tertiary">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-text-primary">
          {value}
        </p>
      </div>
    </div>
  );
}

function PlanDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] bg-white/10 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-white/40">
        {label}
      </p>

      <p className="mt-2 font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function CalendarIcon({
  size = 17,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect
        width="18"
        height="18"
        x="3"
        y="4"
        rx="2"
      />
      <path d="M3 10h18" />
    </svg>
  );
}

function formatSubscriptionDate(
  value: string
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    undefined,
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );
}
