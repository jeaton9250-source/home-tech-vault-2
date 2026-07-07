import { supabase } from "@/lib/supabase";
import { calculateTechnologyScore } from "@/lib/calculateTechnologyScore";
import StatCard from "@/components/StatCard";

export default async function ReportsPage() {
  const { data: devices } = await supabase.from("devices").select("*");
  const { data: subscriptions } = await supabase.from("subscriptions").select("*");

  const deviceCount = devices?.length ?? 0;
  const subscriptionCount = subscriptions?.length ?? 0;

  const technologyScore = calculateTechnologyScore(devices ?? []);

  const totalDeviceValue =
    devices?.reduce((sum, device) => sum + Number(device.purchase_price || 0), 0) ?? 0;

  const monthlySpend =
    subscriptions?.reduce((sum, sub) => sum + Number(sub.monthly_cost || 0), 0) ?? 0;

  const yearlySpend = monthlySpend * 12;

  const devicesMissingSerial =
    devices?.filter((device) => !device.serial_number).length ?? 0;

  const devicesMissingWarranty =
    devices?.filter((device) => !device.warranty_date).length ?? 0;

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold text-blue-950">Reports</h1>

      <p className="text-gray-600 mt-2">
        A snapshot of your home technology, subscriptions, and digital organization.
      </p>

      <div className="grid md:grid-cols-4 gap-6 mt-8">
        <StatCard
          title="Technology Score"
          value={`${technologyScore}/100`}
          description="Overall home tech health"
        />

        <StatCard
          title="Device Value"
          value={`$${totalDeviceValue.toFixed(2)}`}
          description={`${deviceCount} devices tracked`}
        />

        <StatCard
          title="Monthly Spend"
          value={`$${monthlySpend.toFixed(2)}`}
          description={`${subscriptionCount} subscriptions`}
        />

        <StatCard
          title="Yearly Spend"
          value={`$${yearlySpend.toFixed(2)}`}
          description="Estimated annual subscription cost"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-bold text-blue-950">
            Inventory Completeness
          </h2>

          <div className="mt-5 space-y-3 text-gray-700">
            <p>Devices missing serial numbers: {devicesMissingSerial}</p>
            <p>Devices missing warranty dates: {devicesMissingWarranty}</p>
            <p>Total devices tracked: {deviceCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-bold text-blue-950">
            Subscription Summary
          </h2>

          <div className="mt-5 space-y-3 text-gray-700">
            <p>Subscriptions tracked: {subscriptionCount}</p>
            <p>Monthly recurring spend: ${monthlySpend.toFixed(2)}</p>
            <p>Estimated yearly spend: ${yearlySpend.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </main>
  );
}