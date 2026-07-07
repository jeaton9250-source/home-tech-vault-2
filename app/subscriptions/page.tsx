import Link from "next/link";
import { supabase } from "@/lib/supabase";
import SubscriptionCard from "@/components/SubscriptionCard";
import PageHeader from "@/components/PageHeader";

export default async function SubscriptionsPage() {
  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("service_name");

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold text-red-600">
          Database Error
        </h1>

        <p className="mt-4">{error.message}</p>
      </main>
    );
  }

  const monthlyTotal =
    subscriptions?.reduce(
      (sum, sub) => sum + Number(sub.monthly_cost || 0),
      0
    ) ?? 0;

  const yearlyTotal = monthlyTotal * 12;

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <PageHeader
        title="Subscription Center"
        description="Manage all of your recurring digital services."
        action={
          <Link
            href="/subscriptions/add"
            className="bg-blue-950 text-white px-6 py-3 rounded-xl hover:bg-blue-900 transition"
          >
            + Add Subscription
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
            Across {subscriptions?.length ?? 0} subscriptions
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

      {subscriptions?.length === 0 && (
        <div className="bg-white rounded-2xl shadow p-10 mt-8 text-center">
          <h2 className="text-2xl font-bold text-blue-950">
            No subscriptions yet
          </h2>

          <p className="text-gray-600 mt-2">
            Track streaming services, cloud storage, software,
            AI subscriptions, domains, VPNs, and more.
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
        {subscriptions?.map((subscription) => (
          <SubscriptionCard
            key={subscription.id}
            subscription={subscription}
          />
        ))}
      </div>
    </main>
  );
}