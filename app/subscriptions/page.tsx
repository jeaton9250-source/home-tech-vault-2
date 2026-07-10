"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2, Plus, WalletCards } from "lucide-react";

import SubscriptionCard from "@/components/SubscriptionCard";
import PageShell from "@/components/ui/PageShell";
import PageTitle from "@/components/ui/PageTitle";
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
  const { user, isDemo, loading: demoLoading } = useDemoMode();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadSubscriptions() {
      if (demoLoading) {
        return;
      }

      try {
        setLoadingSubscriptions(true);
        setErrorMessage("");

        const data = await getSubscriptions(user);
        setSubscriptions(data || []);
      } catch (error) {
        console.error("Subscription loading error:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load subscriptions."
        );
      } finally {
        setLoadingSubscriptions(false);
      }
    }

    loadSubscriptions();
  }, [user, demoLoading]);

  const monthlyTotal = subscriptions.reduce(
    (sum, subscription) =>
      sum + Number(subscription.monthly_cost || 0),
    0
  );

  const yearlyTotal = monthlyTotal * 12;

  const loading = demoLoading || loadingSubscriptions;

  return (
    <PageShell>
      <PageTitle
        eyebrow="Recurring Services"
        title={
          isDemo
            ? "Demo Subscription Center"
            : "Subscription Center"
        }
        description={
          isDemo
            ? "You are viewing sample subscriptions. Sign in to manage your own recurring services."
            : "Track recurring technology expenses, renewal dates, and annual costs."
        }
        action={
          <Button href={isDemo ? "/login" : "/subscriptions/add"}>
            <Plus size={18} />
            {isDemo ? "Create Your Vault" : "Add Subscription"}
          </Button>
        }
      />

      {loading ? (
        <PageCard className="flex min-h-64 items-center justify-center">
          <div className="flex items-center gap-3 text-neutral-500">
            <Loader2 className="animate-spin" size={22} />
            Loading subscriptions...
          </div>
        </PageCard>
      ) : errorMessage ? (
        <PageCard className="border-red-200 bg-red-50 text-red-700">
          {errorMessage}
        </PageCard>
      ) : (
        <>
          <section className="grid gap-5 md:grid-cols-2">
            <PageCard className="p-6 md:p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
                <CreditCard size={24} />
              </div>

              <p className="mt-5 text-sm text-neutral-500">
                Monthly Spend
              </p>

              <h2 className="mt-2 text-4xl font-bold text-[#111827]">
                ${monthlyTotal.toFixed(2)}
              </h2>

              <p className="mt-2 text-sm text-neutral-400">
                Across {subscriptions.length} subscription
                {subscriptions.length === 1 ? "" : "s"}
              </p>
            </PageCard>

            <PageCard className="p-6 md:p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
                <WalletCards size={24} />
              </div>

              <p className="mt-5 text-sm text-neutral-500">
                Yearly Spend
              </p>

              <h2 className="mt-2 text-4xl font-bold text-[#111827]">
                ${yearlyTotal.toFixed(2)}
              </h2>

              <p className="mt-2 text-sm text-neutral-400">
                Estimated annual recurring cost
              </p>
            </PageCard>
          </section>

          {subscriptions.length === 0 ? (
            <PageCard className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
                <CreditCard size={30} />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-[#111827]">
                No subscriptions yet
              </h2>

              <p className="mx-auto mt-3 max-w-lg text-neutral-500">
                Track streaming services, cloud storage, software,
                domains, VPNs, internet services, and other recurring
                technology expenses.
              </p>

              <Button
                href={
                  isDemo ? "/login" : "/subscriptions/add"
                }
                className="mt-6"
              >
                <Plus size={18} />
                {isDemo
                  ? "Create Your Vault"
                  : "Add Your First Subscription"}
              </Button>
            </PageCard>
          ) : (
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {subscriptions.map((subscription) => (
  <SubscriptionCard
    key={subscription.id}
    subscription={{
      id: subscription.id,
      service_name:
        subscription.service_name ||
        subscription.name ||
        "Unnamed Subscription",
      category:
        subscription.category || undefined,
      monthly_cost:
        subscription.monthly_cost ?? undefined,
      renewal_date:
        subscription.renewal_date || undefined,
      billing_cycle:
        subscription.billing_cycle || undefined,
      notes:
        subscription.notes || undefined,
    }}
  />
))}
            </section>
          )}
        </>
      )}
    </PageShell>
  );
}