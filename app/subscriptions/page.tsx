"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarClock,
  CreditCard,
  Loader2,
  Plus,
  Search,
  WalletCards,
  X,
} from "lucide-react";

import SubscriptionCard from "@/components/SubscriptionCard";
import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import Button from "@/components/ui/Button";

import { useDemoMode } from "@/hooks/useDemoMode";
import { getSubscriptions } from "@/lib/data/subscriptions";

type Subscription = {
  id: string;
  service_name: string;
  name?: string | null;
  monthly_cost?: number | null;
  renewal_date?: string | null;
  category?: string | null;
  billing_cycle?: string | null;
  notes?: string | null;
};

export default function SubscriptionsPage() {
  const {
    user,
    isDemo,
    loading: demoLoading,
  } = useDemoMode();

  const [
    subscriptions,
    setSubscriptions,
  ] = useState<Subscription[]>([]);

  const [
    loadingSubscriptions,
    setLoadingSubscriptions,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("All");

  useEffect(() => {
    async function loadSubscriptions() {
      if (demoLoading) {
        return;
      }

      try {
        setLoadingSubscriptions(true);
        setErrorMessage("");

        const data =
          await getSubscriptions(user);

        setSubscriptions(data || []);
      } catch (error: unknown) {
        const possibleError =
          error as {
            message?: string;
            details?: string;
          };

        console.error(
          "Subscription loading error:",
          error
        );

        setErrorMessage(
          possibleError.message ||
            possibleError.details ||
            "Unable to load subscriptions."
        );
      } finally {
        setLoadingSubscriptions(false);
      }
    }

    loadSubscriptions();
  }, [
    user,
    demoLoading,
  ]);

  const categories = useMemo(() => {
    const values = subscriptions
      .map((subscription) =>
        subscription.category?.trim()
      )
      .filter(
        (
          value
        ): value is string =>
          Boolean(value)
      );

    return [
      "All",
      ...Array.from(
        new Set(values)
      ).sort(),
    ];
  }, [subscriptions]);

  const filteredSubscriptions =
    useMemo(() => {
      const query =
        searchTerm
          .trim()
          .toLowerCase();

      return subscriptions
        .filter((subscription) => {
          const serviceName =
            subscription.service_name ||
            subscription.name ||
            "";

          const searchableText = [
            serviceName,
            subscription.category,
            subscription.billing_cycle,
            subscription.notes,
          ]
            .map((value) =>
              String(
                value || ""
              ).toLowerCase()
            )
            .join(" ");

          const matchesSearch =
            query === "" ||
            searchableText.includes(
              query
            );

          const matchesCategory =
            selectedCategory ===
              "All" ||
            subscription.category ===
              selectedCategory;

          return (
            matchesSearch &&
            matchesCategory
          );
        })
        .sort((first, second) => {
          const firstDate =
            first.renewal_date
              ? new Date(
                  `${first.renewal_date}T00:00:00`
                ).getTime()
              : Number.MAX_SAFE_INTEGER;

          const secondDate =
            second.renewal_date
              ? new Date(
                  `${second.renewal_date}T00:00:00`
                ).getTime()
              : Number.MAX_SAFE_INTEGER;

          return firstDate - secondDate;
        });
    }, [
      subscriptions,
      searchTerm,
      selectedCategory,
    ]);

  const monthlyTotal =
    subscriptions.reduce(
      (sum, subscription) =>
        sum +
        getMonthlyEquivalent(
          subscription
        ),
      0
    );

  const yearlyTotal =
    monthlyTotal * 12;

  const upcomingRenewals =
    subscriptions.filter(
      (subscription) =>
        isRenewingSoon(
          subscription.renewal_date
        )
    ).length;

  const averageMonthlyCost =
    subscriptions.length === 0
      ? 0
      : monthlyTotal /
        subscriptions.length;

  const loading =
    demoLoading ||
    loadingSubscriptions;

  const filtersActive =
    searchTerm.trim() !== "" ||
    selectedCategory !== "All";

  function clearFilters() {
    setSearchTerm("");
    setSelectedCategory("All");
  }

  if (loading) {
    return (
      <PageShell>
        <PageCard className="flex min-h-72 items-center justify-center">
          <div className="flex items-center gap-3 text-neutral-500">
            <Loader2
              className="animate-spin"
              size={22}
            />

            Loading subscriptions...
          </div>
        </PageCard>
      </PageShell>
    );
  }

  if (errorMessage) {
    return (
      <PageShell>
        <PageCard className="border-red-200 bg-red-50 text-red-700">
          <h1 className="text-xl font-semibold">
            Unable to load subscriptions
          </h1>

          <p className="mt-2 text-sm">
            {errorMessage}
          </p>
        </PageCard>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="rounded-[32px] bg-[#111827] px-6 py-9 text-white shadow-sm md:px-10 md:py-11">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96A]">
              Recurring Services
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
              Your subscriptions.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/60 md:text-base">
              Track recurring technology
              expenses, renewal dates, and
              yearly costs in one place.
            </p>
          </div>

          <Button
            href={
              isDemo
                ? "/signup"
                : "/subscriptions/add"
            }
            variant="secondary"
          >
            <Plus size={17} />

            {isDemo
              ? "Create Your Vault"
              : "Add Subscription"}
          </Button>
        </div>
      </section>

      {isDemo && (
        <section className="rounded-3xl border border-[#D8C69D] bg-[#FFF8E8] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A6A2F]">
            Interactive Demo
          </p>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Explore how Home Tech Vault
            organizes recurring services,
            renewal dates, and ongoing
            technology costs.
          </p>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={CreditCard}
          label="Subscriptions"
          value={subscriptions.length.toLocaleString()}
          description="Recurring services"
        />

        <SummaryCard
          icon={WalletCards}
          label="Monthly Spend"
          value={formatCurrency(
            monthlyTotal
          )}
          description="Estimated per month"
        />

        <SummaryCard
          icon={WalletCards}
          label="Yearly Spend"
          value={formatCurrency(
            yearlyTotal
          )}
          description="Estimated annually"
        />

        <SummaryCard
          icon={CalendarClock}
          label="Renewing Soon"
          value={upcomingRenewals.toLocaleString()}
          description="Within 30 days"
        />
      </section>

      {subscriptions.length > 0 && (
        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <PageCard className="p-7 md:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
              Spending Overview
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
              Recurring technology costs
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
              A simple view of what your
              subscriptions cost over time.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              <CostTile
                label="Monthly"
                value={formatCurrency(
                  monthlyTotal
                )}
              />

              <CostTile
                label="Yearly"
                value={formatCurrency(
                  yearlyTotal
                )}
              />

              <CostTile
                label="Average"
                value={formatCurrency(
                  averageMonthlyCost
                )}
              />
            </div>
          </PageCard>

          <PageCard className="bg-[#111827] p-7 text-white md:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
              Subscription Insight
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
              {getSubscriptionInsight(
                subscriptions,
                monthlyTotal,
                upcomingRenewals
              )}
            </h2>

            <p className="mt-4 text-sm leading-6 text-white/55">
              Review recurring services
              regularly to make sure each one
              still provides value.
            </p>
          </PageCard>
        </section>
      )}

      {subscriptions.length > 0 && (
        <PageCard className="p-5 md:p-6">
          <div className="flex flex-col gap-5">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search subscriptions..."
                className="w-full rounded-2xl border border-[#E8E2D6] bg-[#FAFAF8] py-3.5 pl-11 pr-11 text-sm text-[#111827] outline-none transition placeholder:text-neutral-400 focus:border-[#C8A96A] focus:bg-white focus:ring-4 focus:ring-[#C8A96A]/10"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchTerm("")
                  }
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition hover:bg-white hover:text-[#111827]"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map(
                (category) => {
                  const active =
                    selectedCategory ===
                    category;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() =>
                        setSelectedCategory(
                          category
                        )
                      }
                      className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? "bg-[#111827] text-white"
                          : "border border-[#E8E2D6] bg-white text-neutral-500 hover:border-[#C8A96A] hover:text-[#111827]"
                      }`}
                    >
                      {category === "All"
                        ? "All Subscriptions"
                        : category}
                    </button>
                  );
                }
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E8E2D6] pt-4">
              <p className="text-sm text-neutral-500">
                {filteredSubscriptions.length}{" "}
                {filteredSubscriptions.length ===
                1
                  ? "subscription"
                  : "subscriptions"}
              </p>

              {filtersActive && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#111827] transition hover:text-[#8A6A2F]"
                >
                  <X size={15} />
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </PageCard>
      )}

      {subscriptions.length === 0 ? (
        <PageCard className="py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
            <CreditCard size={29} />
          </div>

          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
            No subscriptions yet
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
            Track streaming services,
            cloud storage, software, VPNs,
            domains, internet services, and
            other recurring technology
            expenses.
          </p>

          <Button
            href={
              isDemo
                ? "/signup"
                : "/subscriptions/add"
            }
            className="mt-6"
          >
            <Plus size={17} />

            {isDemo
              ? "Create Your Vault"
              : "Add Your First Subscription"}
          </Button>
        </PageCard>
      ) : filteredSubscriptions.length >
        0 ? (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredSubscriptions.map(
            (subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={{
                  id: subscription.id,
                  service_name:
                    subscription.service_name ||
                    subscription.name ||
                    "Unnamed Subscription",
                  category:
                    subscription.category ||
                    undefined,
                  monthly_cost:
                    subscription.monthly_cost ??
                    undefined,
                  renewal_date:
                    subscription.renewal_date ||
                    undefined,
                  billing_cycle:
                    subscription.billing_cycle ||
                    undefined,
                  notes:
                    subscription.notes ||
                    undefined,
                }}
              />
            )
          )}
        </section>
      ) : (
        <PageCard className="py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
            <Search size={28} />
          </div>

          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
            No matching subscriptions
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
            Try changing your search or
            subscription category.
          </p>

          <Button
            variant="secondary"
            className="mt-6"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </PageCard>
      )}
    </PageShell>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof CreditCard;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <PageCard className="p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-neutral-500">
            {label}
          </p>

          <p className="mt-2 truncate text-2xl font-semibold tracking-[-0.03em] text-[#111827] md:text-3xl">
            {value}
          </p>

          <p className="mt-2 text-xs text-neutral-400">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
          <Icon size={20} />
        </div>
      </div>
    </PageCard>
  );
}

function CostTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] bg-[#F7F5EF] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#111827]">
        {value}
      </p>
    </div>
  );
}

function getMonthlyEquivalent(
  subscription: Subscription
) {
  const amount = Number(
    subscription.monthly_cost || 0
  );

  const cycle =
    subscription.billing_cycle
      ?.trim()
      .toLowerCase() || "";

  if (
    cycle.includes("annual") ||
    cycle.includes("year")
  ) {
    return amount / 12;
  }

  if (cycle.includes("week")) {
    return (
      amount * 52
    ) / 12;
  }

  if (
    cycle.includes("quarter")
  ) {
    return amount / 3;
  }

  return amount;
}

function isRenewingSoon(
  value?: string | null
) {
  if (!value) {
    return false;
  }

  const renewalDate =
    new Date(
      `${value}T23:59:59`
    );

  if (
    Number.isNaN(
      renewalDate.getTime()
    )
  ) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const difference =
    Math.ceil(
      (renewalDate.getTime() -
        today.getTime()) /
        (1000 *
          60 *
          60 *
          24)
    );

  return (
    difference >= 0 &&
    difference <= 30
  );
}

function getSubscriptionInsight(
  subscriptions: Subscription[],
  monthlyTotal: number,
  upcomingRenewals: number
) {
  if (
    subscriptions.length === 0
  ) {
    return "Add your first subscription to begin tracking recurring costs.";
  }

  if (upcomingRenewals > 0) {
    return `${upcomingRenewals} ${
      upcomingRenewals === 1
        ? "subscription renews"
        : "subscriptions renew"
    } within the next 30 days.`;
  }

  return `Your tracked services cost about ${formatCurrency(
    monthlyTotal
  )} each month.`;
}

function formatCurrency(
  value: number
) {
  return value.toLocaleString(
    undefined,
    {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
}