import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { calculateTechnologyScore } from "@/lib/calculateTechnologyScore";
import {
  Laptop,
  CreditCard,
  Wrench,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import StatCard from "@/components/StatCard";
import TechnologyScoreCard from "@/components/TechnologyScoreCard";

export default async function Home() {
  const { data: devices } = await supabase.from("devices").select("*");

  const deviceCount = devices?.length ?? 0;
  const technologyScore = calculateTechnologyScore(devices ?? []);

  return (
    <main className="p-8">
      <div className="bg-gradient-to-r from-blue-950 to-blue-800 rounded-3xl p-8 text-white shadow">
        <p className="text-blue-200">Welcome back</p>

        <h1 className="text-4xl font-bold mt-2">Home Tech Vault™</h1>

        <p className="text-blue-100 mt-3 max-w-2xl">
          Organize your devices, protect your digital life, and simplify
          your home technology from one secure dashboard.
        </p>

        <div className="mt-6">
          <Link
            href="/devices/add"
            className="inline-flex items-center gap-2 bg-white text-blue-950 px-5 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
          >
            Add New Device
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mt-8">
        <TechnologyScoreCard score={technologyScore} />

        <StatCard
          title="Devices"
          value={String(deviceCount)}
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
        <div className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition">
          <div className="bg-blue-50 text-blue-950 w-fit p-3 rounded-xl">
            <Laptop size={26} />
          </div>

          <h2 className="text-xl font-bold text-blue-950 mt-5">
            Technology Inventory
          </h2>

          <p className="text-gray-600 mt-2">
            Track every computer, phone, TV, router, printer, and smart
            home device.
          </p>

          <Link href="/devices" className="inline-flex items-center gap-2 mt-5 text-blue-950 font-semibold">
            View Inventory
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition">
          <div className="bg-blue-50 text-blue-950 w-fit p-3 rounded-xl">
            <CreditCard size={26} />
          </div>

          <h2 className="text-xl font-bold text-blue-950 mt-5">
            Subscription Tracker
          </h2>

          <p className="text-gray-600 mt-2">
            Keep track of streaming services, software, cloud storage,
            and recurring subscriptions.
          </p>

          <Link href="/subscriptions" className="inline-flex items-center gap-2 mt-5 text-blue-950 font-semibold">
            Manage Subscriptions
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition">
          <div className="bg-blue-50 text-blue-950 w-fit p-3 rounded-xl">
            <ShieldCheck size={26} />
          </div>

          <h2 className="text-xl font-bold text-blue-950 mt-5">
            Security Center
          </h2>

          <p className="text-gray-600 mt-2">
            Review passwords, backups, software updates, and improve your
            Technology Health Score™.
          </p>

          <Link href="/security" className="inline-flex items-center gap-2 mt-5 text-blue-950 font-semibold">
            Review Security
            <ArrowRight size={16} />
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
            <Link href="/devices/add" className="block bg-blue-950 text-white rounded-xl px-4 py-3 hover:bg-blue-900 transition">
              + Add Device
            </Link>

            <Link href="/subscriptions" className="block border rounded-xl px-4 py-3 hover:bg-gray-50 transition">
              Add Subscription
            </Link>

            <Link href="/maintenance" className="block border rounded-xl px-4 py-3 hover:bg-gray-50 transition">
              Log Maintenance
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-bold text-blue-950">
            Home Tech Summary
          </h2>

          <p className="text-gray-600 mt-4">
            Your Technology Score is now based on how complete your device
            records are.
          </p>

          <div className="mt-5 bg-blue-50 rounded-xl p-5">
            <h3 className="font-semibold text-blue-950"> Recommendation</h3>

            <p className="text-gray-700 mt-2">
              Add warranty dates, purchase prices, locations, notes, and serial
              numbers to improve your score.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}