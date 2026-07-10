"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Crown,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { supabase } from "@/lib/supabase";
import { useSubscription } from "@/hooks/useSubscription";

export default function SettingsPage() {
  const [email, setEmail] = useState("");

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
      } = await supabase.auth.getUser();

      setEmail(user?.email || "");
    }

    loadUser();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <main className="min-h-screen bg-[#F7F5EF] p-8">
      <PageHeader
        title="Settings"
        description="Manage your Home Tech Vault account, subscription, and preferences."
      />

      <div className="mt-8 space-y-6">
        <section className="rounded-3xl border border-[#E8E2D6] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
                {plan === "free" && !isAdmin ? (
                  <ShieldCheck size={24} />
                ) : (
                  <Crown size={24} />
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
                  Current Subscription
                </p>

                <h2 className="mt-2 text-2xl font-bold text-[#111827]">
                  {loading
                    ? "Loading plan..."
                    : isAdmin
                      ? "Master Account"
                      : `${formatPlanName(plan)} Plan`}
                </h2>

                <p className="mt-2 text-sm text-neutral-500">
                  {loading
                    ? "Checking your subscription status."
                    : isAdmin
                      ? "All Home Tech Vault features are unlocked."
                      : getPlanDescription(plan)}
                </p>
              </div>
            </div>

            {!loading && (
              <span
                className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  isAdmin ||
                  status === "active" ||
                  status === "trialing"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-neutral-100 text-neutral-600"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isAdmin ||
                    status === "active" ||
                    status === "trialing"
                      ? "bg-emerald-500"
                      : "bg-neutral-400"
                  }`}
                />

                {isAdmin
                  ? "Master Access"
                  : formatSubscriptionStatus(status)}
              </span>
            )}
          </div>

          {loading ? (
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#F7F5EF] p-5 text-neutral-500">
              <Loader2
                size={19}
                className="animate-spin"
              />
              Loading subscription information...
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <SettingsPlanDetail
                label="Plan"
                value={
                  isAdmin
                    ? "Master"
                    : formatPlanName(plan)
                }
              />

              <SettingsPlanDetail
                label="Status"
                value={
                  isAdmin
                    ? "Active"
                    : formatSubscriptionStatus(status)
                }
              />

              <SettingsPlanDetail
                label={
                  status === "canceled"
                    ? "Access Ends"
                    : "Renewal Date"
                }
                value={
                  isAdmin
                    ? "No expiration"
                    : currentPeriodEnd
                      ? formatSubscriptionDate(
                          currentPeriodEnd
                        )
                      : "Not applicable"
                }
              />
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/settings/billing"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#111827] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#263044]"
            >
              <ArrowUpRight size={17} />
              Manage Billing
            </a>

            {!isAdmin && plan === "free" && (
              <a
                href="/upgrade"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8E2D6] bg-white px-5 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#F7F5EF]"
              >
                <Crown size={17} />
                View Upgrade Options
              </a>
            )}
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-[#E8E2D6] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
              Account
            </p>

            <h2 className="mt-2 text-2xl font-bold text-[#111827]">
              Account Information
            </h2>

            <div className="mt-6 space-y-4">
              <SettingsRow
                label="Email"
                value={email || "Not signed in"}
              />

              <SettingsRow
                label="Plan"
                value={
                  loading
                    ? "Loading..."
                    : isAdmin
                      ? "Master Account"
                      : `${formatPlanName(plan)} Plan`
                }
              />

              <SettingsRow
                label="Status"
                value={
                  loading
                    ? "Loading..."
                    : isAdmin
                      ? "Active"
                      : formatSubscriptionStatus(status)
                }
              />
            </div>

            <button
              type="button"
              onClick={signOut}
              className="mt-6 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Sign Out
            </button>
          </section>

          <section className="rounded-3xl border border-[#E8E2D6] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
              Preferences
            </p>

            <h2 className="mt-2 text-2xl font-bold text-[#111827]">
              Display Preferences
            </h2>

            <div className="mt-6 space-y-4">
              <SettingsRow
                label="Theme"
                value="Light Mode"
              />

              <SettingsRow
                label="Currency"
                value="USD"
              />

              <SettingsRow
                label="Date Format"
                value="MM/DD/YYYY"
              />
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-[#E8E2D6] bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
            Home Tech Vault
          </p>

          <h2 className="mt-2 text-2xl font-bold text-[#111827]">
            Account Access
          </h2>

          <p className="mt-3 max-w-3xl leading-7 text-neutral-500">
            Your subscription controls access to premium features
            such as network discovery, advanced reports, insurance
            exports, and future smart tools. Billing changes are
            managed securely through Stripe.
          </p>
        </section>
      </div>
    </main>
  );
}

function SettingsPlanDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#F7F5EF] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">
        {label}
      </p>

      <p className="mt-2 font-semibold text-[#111827]">
        {value}
      </p>
    </div>
  );
}

function SettingsRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5 rounded-2xl bg-[#F7F5EF] p-4">
      <p className="text-sm text-neutral-500">
        {label}
      </p>

      <p className="break-all text-right text-sm font-semibold text-[#111827]">
        {value}
      </p>
    </div>
  );
}

function formatPlanName(plan: string) {
  if (plan === "family") {
    return "Family";
  }

  if (plan === "pro") {
    return "Pro";
  }

  return "Free";
}

function getPlanDescription(plan: string) {
  if (plan === "family") {
    return "Premium tools, network discovery, reports, and household sharing are unlocked.";
  }

  if (plan === "pro") {
    return "Premium tools, network discovery, reports, and advanced features are unlocked.";
  }

  return "You currently have access to the free Home Tech Vault features.";
}

function formatSubscriptionStatus(status: string) {
  if (!status || status === "inactive") {
    return "Inactive";
  }

  if (status === "past_due") {
    return "Past Due";
  }

  if (status === "trialing") {
    return "Trial";
  }

  if (status === "canceled") {
    return "Canceled";
  }

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatSubscriptionDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}