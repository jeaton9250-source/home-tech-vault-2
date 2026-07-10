"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Crown,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { useSubscription } from "@/hooks/useSubscription";
import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

export default function BillingPage() {
  const {
    loading,
    plan,
    status,
    currentPeriodEnd,
    isActive,
  } = useSubscription();

  const [openingPortal, setOpeningPortal] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  async function openPortal() {
    try {
      setOpeningPortal(true);
      setErrorMessage("");

      const response = await fetch(
        "/api/stripe/customer-portal",
        {
          method: "POST",
        }
      );

      const result = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to open billing management."
        );
      }

      if (!result.url) {
        throw new Error(
          "Stripe did not return a billing portal URL."
        );
      }

      window.location.assign(result.url);
    } catch (error) {
      console.error(
        "Billing portal error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to open billing management."
      );
    } finally {
      setOpeningPortal(false);
    }
  }

  const planName =
    plan === "family"
      ? "Family"
      : plan === "pro"
        ? "Pro"
        : "Free";

  const monthlyPrice =
    plan === "family"
      ? "$14.99/month"
      : plan === "pro"
        ? "$7.99/month"
        : "$0/month";

  return (
    <PageShell>
      <PageTitle
        eyebrow="Plans & Billing"
        title="Billing & Subscription"
        description="Review your current plan and manage your Home Tech Vault subscription."
        action={
          plan === "free" ? (
            <Button href="/upgrade">
              <Sparkles size={18} />
              View Plans
            </Button>
          ) : (
            <Button
              onClick={openPortal}
              disabled={openingPortal}
            >
              {openingPortal ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <ArrowUpRight size={18} />
              )}

              {openingPortal
                ? "Opening..."
                : "Manage Billing"}
            </Button>
          )
        }
      />

      {loading ? (
        <PageCard className="flex min-h-64 items-center justify-center">
          <div className="flex items-center gap-3 text-neutral-500">
            <Loader2
              size={22}
              className="animate-spin"
            />
            Loading billing information...
          </div>
        </PageCard>
      ) : (
        <>
          {errorMessage && (
            <PageCard className="border-red-200 bg-red-50 text-red-700">
              {errorMessage}
            </PageCard>
          )}

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <PageCard className="overflow-hidden p-0">
              <div className="bg-[#111827] p-7 text-white md:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96A]">
                      Current Plan
                    </p>

                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#C8A96A]">
                        {plan === "free" ? (
                          <ShieldCheck size={24} />
                        ) : (
                          <Crown size={24} />
                        )}
                      </div>

                      <div>
                        <h2 className="text-3xl font-bold">
                          {planName}
                        </h2>

                        <p className="mt-1 text-sm text-white/60">
                          {monthlyPrice}
                        </p>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                      isActive
                        ? "bg-emerald-400/15 text-emerald-300"
                        : "bg-white/10 text-white/70"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isActive
                          ? "bg-emerald-400"
                          : "bg-white/40"
                      }`}
                    />

                    {formatStatus(status)}
                  </span>
                </div>
              </div>

              <div className="grid gap-5 p-7 sm:grid-cols-2 md:p-8">
                <BillingDetail
                  icon={CalendarDays}
                  label={
                    status === "canceled"
                      ? "Access Ends"
                      : "Next Renewal"
                  }
                  value={
                    currentPeriodEnd
                      ? formatDate(currentPeriodEnd)
                      : "Not applicable"
                  }
                />

                <BillingDetail
                  icon={CreditCard}
                  label="Payment Provider"
                  value="Stripe secure billing"
                />
              </div>
            </PageCard>

            <PageCard>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
                Subscription Access
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#111827]">
                {plan === "free"
                  ? "Upgrade your vault"
                  : `${planName} features unlocked`}
              </h2>

              <p className="mt-2 text-sm leading-6 text-neutral-500">
                {plan === "free"
                  ? "Unlock advanced automation, network discovery, reporting, and premium tools."
                  : "Your account currently has access to the premium tools included with this plan."}
              </p>

              <div className="mt-6 space-y-3">
                <FeatureRow
                  text={
                    plan === "free"
                      ? "Basic device inventory"
                      : "Unlimited device tracking"
                  }
                  enabled
                />

                <FeatureRow
                  text="Network device discovery"
                  enabled={plan !== "free"}
                />

                <FeatureRow
                  text="Advanced reports and analytics"
                  enabled={plan !== "free"}
                />

                <FeatureRow
                  text="Insurance-ready exports"
                  enabled={plan !== "free"}
                />

                <FeatureRow
                  text="Household sharing"
                  enabled={plan === "family"}
                />
              </div>

              <Button
                href={
                  plan === "free"
                    ? "/upgrade"
                    : undefined
                }
                onClick={
                  plan === "free"
                    ? undefined
                    : openPortal
                }
                disabled={openingPortal}
                className="mt-7 w-full justify-center"
              >
                {openingPortal ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : plan === "free" ? (
                  <Sparkles size={18} />
                ) : (
                  <ArrowUpRight size={18} />
                )}

                {openingPortal
                  ? "Opening..."
                  : plan === "free"
                    ? "Upgrade Your Plan"
                    : "Manage Subscription"}
              </Button>
            </PageCard>
          </section>

          <PageCard>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
                <CreditCard size={23} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#111827]">
                  Stripe Customer Portal
                </h2>

                <p className="mt-2 max-w-2xl text-neutral-500">
                  Paid members can securely update payment
                  methods, download invoices, and manage or
                  cancel their subscription through Stripe.
                </p>
              </div>
            </div>
          </PageCard>
        </>
      )}
    </PageShell>
  );
}

function BillingDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CreditCard;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#F7F5EF] p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#C8A96A]">
          <Icon size={19} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
            {label}
          </p>

          <p className="mt-1 font-semibold text-[#111827]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({
  text,
  enabled,
}: {
  text: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#F7F5EF] p-4">
      <CheckCircle2
        size={18}
        className={
          enabled
            ? "text-[#C8A96A]"
            : "text-neutral-300"
        }
      />

      <p
        className={
          enabled
            ? "text-sm font-medium text-[#111827]"
            : "text-sm text-neutral-400"
        }
      >
        {text}
      </p>
    </div>
  );
}

function formatDate(value: string) {
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

function formatStatus(value: string) {
  if (!value) {
    return "Inactive";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}