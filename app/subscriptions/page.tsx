"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import SubscriptionCard from "@/components/SubscriptionCard";
import PageHeader from "@/components/PageHeader";
import { useDemoMode } from "@/hooks/useDemoMode";

const demoSubscriptions = [
  {
    id: "demo-1",
    service_name: "Netflix",
    category: "Streaming",
    monthly_cost: 19.99,
    renewal_date: "2026-08-01",
    billing_cycle: "Monthly",
    notes: "Demo subscription",
  },
  {
    id: "demo-2",
    service_name: "iCloud+",
    category: "Cloud Storage",
    monthly_cost: 9.99,
    renewal_date: "2026-08-10",
    billing_cycle: "Monthly",
    notes: "Demo subscription",
  },
];

export default function SubscriptionsPage() {
  const { user, isDemo, loading } = useDemoMode();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    async function loadSubscriptions() {
      if (loading) return;

      if (isDemo || !user) {
        setSubscriptions(demoSubscriptions);
        return;
      }

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("service_name");

      if (error) {
        alert(error.message);
        return;
      }

      setSubscriptions(data || []);
    }

    loadSubscriptions();
  }, [user, isDemo, loading]);

  if (loading) {
    return <main className="p-8">Loading...</main>;
  }

  const monthlyTotal = subscriptions.reduce(
    (sum, sub) => sum + Number(sub.monthly_cost || 0),
    0
  );

  const yearlyTotal = monthlyTotal * 12;

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <PageHeader
        title={isDemo ? "Demo Subscription Center" : "Subscription Center"}
        description={
          isDemo
            ? "You are viewing sample subscriptions. Sign in to manage your own."
            : "Only subscriptions connected to your account are shown here."
        }
        action={
          <Link
            href={isDemo ? "/login" : "/subscriptions/add"}
            className="bg-blue-950 text-white px-6 py-3 rounded-xl hover:bg-blue-900 transition"
          >
            {isDemo ? "Create Your Vault" : "+ Add Subscription"}
          </Link>
        }
      />

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500">Monthly Spend</p>
          <h2 className="text-4xl font-bold text-blue-950 mt-2">
            ${monthlyTotal.toFixed(2)}
          </h2>
          <p className="text-gray-500 mt-2">
            Across {subscriptions.length} subscriptions
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500">Yearly Spend</p>
          <h2 className="text-4xl font-bold text-blue-950 mt-2">
            ${yearlyTotal.toFixed(2)}
          </h2>
          <p className="text-gray-500 mt-2">
            Estimated annual recurring cost
          </p>
        </div>
      </div>

      {subscriptions.length === 0 && (
        <div className="bg-white rounded-2xl shadow p-10 mt-8 text-center">
          <h2 className="text-2xl font-bold text-blue-950">
            No subscriptions yet
          </h2>

          <p className="text-gray-600 mt-2">
            Track streaming services, cloud storage, software, domains, VPNs,
            and more.
          </p>

          <Link
            href="/subscriptions/add"
            className="inline-block mt-6 bg-blue-950 text-white px-6 py-3 rounded-xl"
          >
            Add Your First Subscription
          </Link>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {subscriptions.map((subscription) => (
          <SubscriptionCard key={subscription.id} subscription={subscription} />
        ))}
      </div>
    </main>
  );
}