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
  Search,
  WalletCards,
  X,
} from "lucide-react";

import SubscriptionCard from "@/components/SubscriptionCard";
import PageShell from "@/components/ui/PageShell";
import PageCard from "@/components/ui/PageCard";
import PageHero from "@/components/ui/PageHero";
import Button from "@/components/ui/Button";

import {
  PageAction,
  PermissionEmptyState,
  ViewerBanner,
} from "@/components/ui/PermissionUI";

import { usePermissions } from "@/hooks/usePermissions";
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
    loading: permissionsLoading,
    householdId,
    isViewer,
    canCreate,
    canEdit,
    canDelete,
  } = usePermissions();

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
    let mounted = true;

    async function loadSubscriptions() {
      if (permissionsLoading) {
        return;
      }

      try {
        setLoadingSubscriptions(true);
        setErrorMessage("");

        const data =
          await getSubscriptions(
            user,
            householdId
          );

        if (!mounted) {
          return;
        }

        setSubscriptions(data ?? []);
      } catch (error: unknown) {
        console.error(
          "Subscription loading error:",
          error
        );

        if (!mounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load subscriptions."
        );
      } finally {
        if (mounted) {
          setLoadingSubscriptions(false);
        }
      }
    }

    void loadSubscriptions();

    return () => {
      mounted = false;
    };
  }, [
    user,
    permissionsLoading,
    householdId,
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
              String(value ?? "")
                .toLowerCase()
            )
            .join(" ");

          const matchesSearch =
            query === "" ||
            searchableText.includes(
              query
            );

          const matchesCategory =
            selectedCategory === "All" ||
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
                  first.renewal_date +
                    "T00:00:00"
                ).getTime()
              : Number.MAX_SAFE_INTEGER;

          const secondDate =
            second.renewal_date
              ? new Date(
                  second.renewal_date +
                    "T00:00:00"
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
    permissionsLoading ||
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
          <div className="flex items-center gap-3 text-text-secondary">
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
        <PageCard className="border-red-200 bg-red-50 p-6 text-red-700">
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
      <PageHero
        section="technology"
        eyebrow="Recurring Services"
        title="Your subscriptions."
        description="Track recurring technology expenses, renewal dates, and yearly costs in one place."
      >
        <PageAction
          href="/subscriptions/add"
          label="Add Subscription"
          variant="primary"
        />
      </PageHero>

      <ViewerBanner description="Explore sample recurring services, renewal dates, and technology costs. Viewer access is read-only." />

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
            <p className="text-overline text-charcoal-soft">
              Spending Overview
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-text-primary">
              Recurring technology costs
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
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

          <PageCard className="overflow-hidden p-0"><div className="htv-plan-band p-7 text-text-primary md:p-9">
            <p className="text-overline text-charcoal-soft">
              Subscription Insight
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
              {getSubscriptionInsight(
                subscriptions,
                monthlyTotal,
                upcomingRenewals
              )}
            </h2>

            <p className="mt-4 text-sm leading-6 text-text-secondary">
              Review recurring services
              regularly to make sure each
              one still provides value.
            </p>
          </div>
          </PageCard>
        </section>
      )}

      {subscriptions.length > 0 && (
        <PageCard className="p-5 md:p-6">
          <div className="flex flex-col gap-5">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
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
                className="w-full rounded-2xl border border-border-subtle bg-[#FAFAF8] py-3.5 pl-11 pr-11 text-sm text-text-primary outline-none transition placeholder:text-text-tertiary focus:border-interaction focus:bg-white focus:ring-4 focus:ring-interaction/10"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchTerm("")
                  }
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-text-tertiary transition hover:bg-white hover:text-text-primary"
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
                      className={
                        "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition " +
                        (active
                          ? "bg-charcoal text-surface-card"
                          : "border border-border-subtle bg-white text-text-secondary hover:border-border-strong hover:text-text-primary")
                      }
                    >
                      {category === "All"
                        ? "All Subscriptions"
                        : category}
                    </button>
                  );
                }
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
              <p className="text-sm text-text-secondary">
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
                  className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary transition hover:text-achievement"
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
        <PermissionEmptyState
          icon={CreditCard}
          title="No subscriptions yet"
          description="Track streaming services, cloud storage, software, VPNs, domains, internet services, and other recurring technology expenses."
          href="/subscriptions/add"
          buttonLabel="Add Your First Subscription"
        />
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
                canEdit={canEdit}
                canDelete={canDelete}
                isViewer={isViewer}
              />
            )
          )}
        </section>
      ) : (
        <PageCard className="py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
            <Search size={28} />
          </div>

          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-text-primary">
            No matching subscriptions
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-secondary">
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
          <p className="text-sm text-text-secondary">
            {label}
          </p>

          <p className="mt-2 truncate text-2xl font-semibold tracking-[-0.03em] text-text-primary md:text-3xl">
            {value}
          </p>

          <p className="mt-2 text-xs text-text-tertiary">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-surface-sunken text-charcoal shadow-[var(--shadow-inset)]">
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
    <div className="rounded-[22px] bg-surface-sunken p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-text-primary">
        {value}
      </p>
    </div>
  );
}

function getMonthlyEquivalent(
  subscription: Subscription
) {
  const amount = Number(
    subscription.monthly_cost ?? 0
  );

  const cycle =
    subscription.billing_cycle
      ?.trim()
      .toLowerCase() ?? "";

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
      value + "T23:59:59"
    );

  if (
    Number.isNaN(
      renewalDate.getTime()
    )
  ) {
    return false;
  }

  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

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
    return (
      String(upcomingRenewals) +
      " " +
      (upcomingRenewals === 1
        ? "subscription renews"
        : "subscriptions renew") +
      " within the next 30 days."
    );
  }

  return (
    "Your tracked services cost about " +
    formatCurrency(monthlyTotal) +
    " each month."
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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
}