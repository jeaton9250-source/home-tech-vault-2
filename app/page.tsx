"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { calculateTechnologyScore } from "@/lib/calculateTechnologyScore";
import {
  Laptop,
  CreditCard,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import StatCard from "@/components/StatCard";
import TechnologyScoreCard from "@/components/TechnologyScoreCard";
import RecommendationCard from "@/components/RecommendationCard";
import SmartAlertCard from "@/components/SmartAlertCard";

function isWithinDays(dateString?: string, days = 30) {
  if (!dateString) return false;

  const today = new Date();
  const target = new Date(dateString);
  const diffDays = Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return diffDays >= 0 && diffDays <= days;
}

export default function Home() {
  const [isDemo, setIsDemo] = useState(true);
  const [devices, setDevices] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsDemo(true);
        return;
      }

      setIsDemo(false);

      const { data: deviceData } = await supabase.from("devices").select("*");
      const { data: subscriptionData } = await supabase
        .from("subscriptions")
        .select("*");

      setDevices(deviceData || []);
      setSubscriptions(subscriptionData || []);
    }

    loadData();
  }, []);

  const deviceCount = isDemo ? 14 : devices.length;
  const subscriptionCount = isDemo ? 9 : subscriptions.length;
  const technologyScore = isDemo ? 94 : calculateTechnologyScore(devices);

  const monthlySpend = isDemo
    ? 84.97
    : subscriptions.reduce(
        (sum, sub) => sum + Number(sub.monthly_cost || 0),
        0
      );

  const totalDeviceValue = isDemo
    ? 12846
    : devices.reduce(
        (sum, device) => sum + Number(device.purchase_price || 0),
        0
      );

  const warrantiesExpiring = isDemo
    ? [{ id: "demo-1" }, { id: "demo-2" }]
    : devices.filter((device) => isWithinDays(device.warranty_date, 30));

  const renewalsComing = isDemo
    ? [{ id: "demo-1" }, { id: "demo-2" }, { id: "demo-3" }]
    : subscriptions.filter((sub) => isWithinDays(sub.renewal_date, 30));

  const missingSerials = isDemo
    ? 1
    : devices.filter((device) => !device.serial_number).length;

  const missingWarranty = isDemo
    ? 2
    : devices.filter((device) => !device.warranty_date).length;

  return (
    <main className="p-8">
      <div className="bg-gradient-to-r from-blue-950 to-blue-800 rounded-3xl p-8 text-white shadow">
        <p className="text-blue-200">
          {isDemo ? "Interactive Demo" : "Welcome back"}
        </p>

        <h1 className="text-4xl font-bold mt-2">Home Tech Vault™</h1>

        <p className="text-blue-100 mt-3 max-w-2xl">
          Organize your devices, protect your digital life, and simplify your
          home technology from one secure dashboard.
        </p>

        {isDemo && (
          <div className="mt-5 bg-blue-800/60 border border-blue-600 rounded-xl p-4">
            <p className="text-sm text-blue-100">
              👋 You&apos;re viewing a demo of Home Tech Vault. Create a free
              account to securely manage your own devices, subscriptions,
              documents, and home network.
            </p>
          </div>
        )}

        <div className="mt-6">
          <Link
            href={isDemo ? "/login" : "/devices/add"}
            className="inline-flex items-center gap-2 bg-white text-blue-950 px-5 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
          >
            {isDemo ? "Create Your Vault" : "Add New Device"}
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mt-8">
        <TechnologyScoreCard score={technologyScore} />

        <StatCard
          title="Devices"
          value={String(deviceCount)}
          description={isDemo ? "Demo preview" : "Saved in your vault"}
        />

        <StatCard
          title="Monthly Spend"
          value={`$${monthlySpend.toFixed(2)}`}
          description={`${subscriptionCount} subscriptions`}
        />

        <StatCard
          title="Tech Value"
          value={`$${totalDeviceValue.toFixed(2)}`}
          description="Estimated device value"
        />
      </div>

      <section className="mt-10">
        <h2 className="text-3xl font-bold text-blue-950 mb-6">
          Mission Control
        </h2>

        <div className="grid gap-6 lg:grid-cols-2">
          <SmartAlertCard
            tone={warrantiesExpiring.length > 0 ? "warning" : "success"}
            title={
              warrantiesExpiring.length > 0
                ? `${warrantiesExpiring.length} Warranty Alerts`
                : "All Warranties Look Good"
            }
            description={
              warrantiesExpiring.length > 0
                ? "Review warranties that expire within the next 30 days."
                : "No warranties require immediate attention."
            }
          />

          <SmartAlertCard
            tone={renewalsComing.length > 0 ? "warning" : "success"}
            title={
              renewalsComing.length > 0
                ? `${renewalsComing.length} Subscription Renewals`
                : "Subscriptions Up To Date"
            }
            description={
              renewalsComing.length > 0
                ? "Review upcoming renewals to avoid unwanted charges."
                : "No subscriptions renew within the next 30 days."
            }
          />

          <SmartAlertCard
            tone={missingWarranty > 0 ? "warning" : "success"}
            title={
              missingWarranty > 0
                ? `${missingWarranty} Devices Missing Warranty`
                : "Warranty Documentation Complete"
            }
            description={
              missingWarranty > 0
                ? "Adding warranty information improves your Technology Score."
                : "Every tracked device has warranty information."
            }
          />

          <SmartAlertCard
            tone={missingSerials > 0 ? "info" : "success"}
            title={
              missingSerials > 0
                ? `${missingSerials} Missing Serial Numbers`
                : "Inventory Complete"
            }
            description={
              missingSerials > 0
                ? "Serial numbers help with insurance claims, warranties, and technical support."
                : "Every device has a serial number recorded."
            }
          />
        </div>
      </section>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition">
          <div className="bg-blue-50 text-blue-950 w-fit p-3 rounded-xl">
            <Laptop size={26} />
          </div>

          <h2 className="text-xl font-bold text-blue-950 mt-5">
            Technology Inventory
          </h2>

          <p className="text-gray-600 mt-2">
            Track every computer, phone, TV, router, printer, and smart home
            device.
          </p>

          <Link
            href="/devices"
            className="inline-flex items-center gap-2 mt-5 text-blue-950 font-semibold"
          >
            View Inventory <ArrowRight size={16} />
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
            Track streaming, apps, cloud storage, and recurring subscriptions.
          </p>

          <Link
            href="/subscriptions"
            className="inline-flex items-center gap-2 mt-5 text-blue-950 font-semibold"
          >
            Manage Subscriptions <ArrowRight size={16} />
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
            Review passwords, backups, software updates, and improve your score.
          </p>

          <Link
            href="/security"
            className="inline-flex items-center gap-2 mt-5 text-blue-950 font-semibold"
          >
            Review Security <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <RecommendationCard
          title="Improve your Technology Score"
          description={`You have ${missingSerials} devices missing serial numbers and ${missingWarranty} missing warranty dates.`}
        />

        <RecommendationCard
          title="Watch upcoming renewals"
          description={`${renewalsComing.length} subscriptions renew within the next 30 days.`}
        />

        <RecommendationCard
          title="Protect your purchases"
          description={`${warrantiesExpiring.length} warranties expire within the next 30 days.`}
        />
      </div>
    </main>
  );
}