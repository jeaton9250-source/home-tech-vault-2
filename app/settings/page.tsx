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
import { useSubscription } from "@/hooks/useSubscription";

import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
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
    loading,
    plan,
    status,
    currentPeriodEnd,
    isAdmin,
  } = useSubscription();

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error(
          "Unable to load settings user:",
          error
        );
      }

      setEmail(user?.email || "");
    }

    loadUser();
  }, []);

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

  const planName = isAdmin
    ? "Master Account"
    : `${formatPlanName(plan)} Plan`;

  const subscriptionStatus =
    isAdmin
      ? "Active"
      : formatSubscriptionStatus(
          status
        );

  const hasActiveAccess =
    isAdmin ||
    status === "active" ||
    status === "trialing";

  return (
    <PageShell>
      <section className="rounded-[32px] bg-[#111827] px-6 py-9 text-white shadow-sm md:px-10 md:py-11">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96A]">
              Account Preferences
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
              Settings.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/60 md:text-base">
              Manage your account,
              subscription, billing, and
              Home Tech Vault preferences.
            </p>
          </div>

          <Button
            href="/settings/billing"
            variant="secondary"
          >
            <WalletCards size={17} />
            Manage Billing
          </Button>
        </div>
      </section>

      <PageCard className="overflow-hidden p-0">
        <div className="bg-[#111827] p-7 text-white md:p-9">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#C8A96A]">
                {plan === "free" &&
                !isAdmin ? (
                  <ShieldCheck
                    size={23}
                  />
                ) : (
                  <Crown size={23} />
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
                  Current Plan
                </p>

                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                  {loading
                    ? "Loading plan..."
                    : planName}
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
                  {loading
                    ? "Checking your subscription information."
                    : isAdmin
                      ? "All Home Tech Vault features are unlocked."
                      : getPlanDescription(
                          plan
                        )}
                </p>
              </div>
            </div>

            {!loading && (
              <span
                className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  hasActiveAccess
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "bg-white/10 text-white/60"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    hasActiveAccess
                      ? "bg-emerald-400"
                      : "bg-white/40"
                  }`}
                />

                {isAdmin
                  ? "Master Access"
                  : subscriptionStatus}
              </span>
            )}
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <PlanDetail
              label="Plan"
              value={
                loading
                  ? "Loading..."
                  : isAdmin
                    ? "Master"
                    : formatPlanName(
                        plan
                      )
              }
            />

            <PlanDetail
              label="Status"
              value={
                loading
                  ? "Loading..."
                  : subscriptionStatus
              }
            />

            <PlanDetail
              label={
                status === "canceled"
                  ? "Access Ends"
                  : "Renewal Date"
              }
              value={
                loading
                  ? "Loading..."
                  : isAdmin
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
            <Button
              href="/settings/billing"
              variant="secondary"
            >
              <ArrowUpRight
                size={17}
              />
              Billing Settings
            </Button>

            {!loading &&
              !isAdmin &&
              plan === "free" && (
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
              loading
                ? "Loading..."
                : planName
            }
          />

          <SettingsRow
            icon={ShieldCheck}
            label="Status"
            value={
              loading
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

          <p className="mt-5 text-xs leading-5 text-neutral-400">
            Additional theme, currency,
            and date preferences can be
            added in a future update.
          </p>
        </SettingsSection>
      </section>

      <PageCard className="p-7 md:p-9">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
              <ShieldCheck
                size={20}
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
                Account Access
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
                Premium feature access
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-500">
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

          {!isAdmin &&
            plan === "free" && (
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
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
          <Icon size={20} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
            {eyebrow}
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
            {title}
          </h2>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
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
    <div className="flex items-center gap-4 rounded-[22px] bg-[#F7F5EF] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#C8A96A] shadow-sm">
        <Icon size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-neutral-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-[#111827]">
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

function formatPlanName(
  plan: string
) {
  if (plan === "family") {
    return "Family";
  }

  if (plan === "pro") {
    return "Pro";
  }

  return "Free";
}

function getPlanDescription(
  plan: string
) {
  if (plan === "family") {
    return "Premium reports, insights, network discovery, and household features are unlocked.";
  }

  if (plan === "pro") {
    return "Premium reports, insights, network discovery, and advanced tools are unlocked.";
  }

  return "You currently have access to the free Home Tech Vault features.";
}

function formatSubscriptionStatus(
  status: string
) {
  if (
    !status ||
    status === "inactive"
  ) {
    return "Inactive";
  }

  if (
    status === "past_due"
  ) {
    return "Past Due";
  }

  if (
    status === "trialing"
  ) {
    return "Trial";
  }

  if (
    status === "canceled"
  ) {
    return "Canceled";
  }

  return status
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
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
