import Link from "next/link";
import StatCard from "@/components/StatCard";
import { supabase } from "@/lib/supabase";
import {
  Laptop,
  CreditCard,
  Wrench,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default async function Home() {
  const { count: deviceCount } = await supabase
    .from("devices")
    .select("*", { count: "exact", head: true });

  const technologyScore = deviceCount && deviceCount > 0 ? 88 : 40;

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
            className="inline-flex items-center gap-2 bg-white text-blue-950 px-5 py-3 rounded-xl font-semibold"
          >
            Add New Device <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mt-8">
        <StatCard
          title="Technology Score"
          value={`${technologyScore}%`}
          description="Overall home tech health"
        />

        <StatCard
          title="Devices"
          value={String(deviceCount ?? 0)}
          description="Saved in your vault"
        />

        <StatCard
          title="Subscriptions"
          value="$0"
          description="Monthly digital spend"
        />

        <StatCard
          title="Maintenance Due"
          value="0"
          description="Open reminders"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="bg-blue-50 text-blue-950 w-fit p-3 rounded-xl">
            <Laptop size={26} />
          </div>

          <h2 className="text-xl font-bold text-blue-950 mt-5">
            Technology Inventory
          </h2>

          <p className="text-gray-600 mt-2">
            Keep track of every laptop, phone, TV, router, printer, and smart
            home device in one organized place.
          </p>

          <Link
            href="/devices"
            className="inline-flex items-center gap-2 mt-5 text-blue-950 font-semibold"
          >
            View Inventory <ArrowRight size={16} />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="bg-blue-50 text-blue-950 w-fit p-3 rounded-xl">
            <CreditCard size={26} />
          </div>

          <h2 className="text-xl font-bold text-blue-950 mt-5">
            Subscription Tracker
          </h2>

          <p className="text-gray-600 mt-2">
            Track streaming services, apps, software, cloud storage, and
            recurring digital expenses.
          </p>

          <Link
            href="/subscriptions"
            className="inline-flex items-center gap-2 mt-5 text-blue-950 font-semibold"
          >
            Manage Subscriptions <ArrowRight size={16} />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="bg-blue-50 text-blue-950 w-fit p-3 rounded-xl">
            <ShieldCheck size={26} />
          </div>

          <h2 className="text-xl font-bold text-blue-950 mt-5">
            Security Center
          </h2>

          <p className="text-gray-600 mt-2">
            Review passwords, backups, updates, Wi-Fi security, and digital
            protection tasks.
          </p>

          <Link
            href="/security"
            className="inline-flex items-center gap-2 mt-5 text-blue-950 font-semibold"
          >
            Review Security <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center gap-3">
            <Wrench className="text-blue-950" />
            <h2 className="text-2xl font-bold text-blue-950">
              Quick Actions
            </h2>
          </div>

          <div className="mt-5 space-y-3">
            <Link
              href="/devices/add"
              className="block bg-blue-950 text-white rounded-xl px-4 py-3"
            >
              + Add a Device
            </Link>

            <Link
              href="/subscriptions"
              className="block border rounded-xl px-4 py-3"
            >
              Add Subscription
            </Link>

            <Link
              href="/maintenance"
              className="block border rounded-xl px-4 py-3"
            >
              Log Maintenance
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-bold text-blue-950">
            Home Tech Summary
          </h2>

          <p className="text-gray-600 mt-4">
            Your vault is starting to come together. The more information you
            add, the smarter your Home Tech Vault becomes.
          </p>

          <div className="mt-5 bg-gray-50 rounded-xl p-4">
            <p className="font-semibold text-blue-950">Next recommendation:</p>
            <p className="text-gray-600 mt-1">
              Add warranty dates and serial numbers to improve your Technology
              Score.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}