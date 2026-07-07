import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { calculateTechnologyScore } from "@/lib/calculateTechnologyScore";
import {
  Laptop,
  CreditCard,
  Wrench,
  ShieldCheck,
  ArrowRight,
  Activity,
} from "lucide-react";

import StatCard from "@/components/StatCard";
import TechnologyScoreCard from "@/components/TechnologyScoreCard";
import RecommendationCard from "@/components/RecommendationCard";

export default async function Home() {
  const { data: devices } = await supabase.from("devices").select("*");
  const { data: subscriptions } = await supabase.from("subscriptions").select("*");

  const deviceCount = devices?.length ?? 0;
  const subscriptionCount = subscriptions?.length ?? 0;
  const technologyScore = calculateTechnologyScore(devices ?? []);

  const monthlySpend =
    subscriptions?.reduce((sum, sub) => sum + Number(sub.monthly_cost || 0), 0) ?? 0;

  const totalDeviceValue =
    devices?.reduce((sum, device) => sum + Number(device.purchase_price || 0), 0) ?? 0;

  const missingSerials =
    devices?.filter((device) => !device.serial_number).length ?? 0;

  const missingWarranty =
    devices?.filter((device) => !device.warranty_date).length ?? 0;

  return (
    <main className="p-8">
      <div className="bg-gradient-to-r from-blue-950 to-blue-800 rounded-3xl p-8 text-white shadow">
        <p className="text-blue-200">Welcome back</p>
        <h1 className="text-4xl font-bold mt-2">Home Tech Vault™</h1>
        <p className="text-blue-100 mt-3 max-w-2xl">
          Organize your devices, protect your digital life, and simplify your
          home technology from one secure dashboard.
        </p>

        <div className="mt-6">
          <Link
            href="/devices/add"
            className="inline-flex items-center gap-2 bg-white text-blue-950 px-5 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
          >
            Add New Device <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mt-8">
        <TechnologyScoreCard score={technologyScore} />
        <StatCard title="Devices" value={String(deviceCount)} description="Saved in your vault" />
        <StatCard title="Monthly Spend" value={`$${monthlySpend.toFixed(2)}`} description={`${subscriptionCount} subscriptions`} />
        <StatCard title="Tech Value" value={`$${totalDeviceValue.toFixed(2)}`} description="Estimated device value" />
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition">
          <div className="bg-blue-50 text-blue-950 w-fit p-3 rounded-xl">
            <Laptop size={26} />
          </div>
          <h2 className="text-xl font-bold text-blue-950 mt-5">Technology Inventory</h2>
          <p className="text-gray-600 mt-2">
            Track every computer, phone, TV, router, printer, and smart home device.
          </p>
          <Link href="/devices" className="inline-flex items-center gap-2 mt-5 text-blue-950 font-semibold">
            View Inventory <ArrowRight size={16} />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition">
          <div className="bg-blue-50 text-blue-950 w-fit p-3 rounded-xl">
            <CreditCard size={26} />
          </div>
          <h2 className="text-xl font-bold text-blue-950 mt-5">Subscription Tracker</h2>
          <p className="text-gray-600 mt-2">
            Keep track of streaming services, software, cloud storage, and recurring subscriptions.
          </p>
          <Link href="/subscriptions" className="inline-flex items-center gap-2 mt-5 text-blue-950 font-semibold">
            Manage Subscriptions <ArrowRight size={16} />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition">
          <div className="bg-blue-50 text-blue-950 w-fit p-3 rounded-xl">
            <ShieldCheck size={26} />
          </div>
          <h2 className="text-xl font-bold text-blue-950 mt-5">Security Center</h2>
          <p className="text-gray-600 mt-2">
            Review passwords, backups, software updates, and improve your Technology Health Score™.
          </p>
          <Link href="/security" className="inline-flex items-center gap-2 mt-5 text-blue-950 font-semibold">
            Review Security <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center gap-3">
            <Activity className="text-blue-950" />
            <h2 className="text-2xl font-bold text-blue-950">Recent Activity</h2>
          </div>

          <div className="mt-5 space-y-3 text-gray-700">
            <p>✓ Inventory system updated</p>
            <p>✓ {deviceCount} devices currently tracked</p>
            <p>✓ {subscriptionCount} subscriptions currently tracked</p>
          </div>
        </div>

        <div className="space-y-4">
          <RecommendationCard
            title="Improve your Technology Score"
            description={`You have ${missingSerials} devices missing serial numbers and ${missingWarranty} missing warranty dates.`}
          />

          <RecommendationCard
            title="Review monthly subscriptions"
            description={`Your current monthly digital spend is $${monthlySpend.toFixed(2)}.`}
          />

          <RecommendationCard
            title="Build your digital vault"
            description="Next, add photos, receipts, manuals, and warranty documents to each device."
          />
        </div>
      </div>
    </main>
  );
}