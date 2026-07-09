"use client";
import { demoDevices } from "@/lib/demo/devices";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import DeviceCard from "@/components/DeviceCard";
import PageHeader from "@/components/PageHeader";
import { useDemoMode } from "@/hooks/useDemoMode";


export default function DevicesPage() {
  const { user, isDemo, loading } = useDemoMode();

  const [devices, setDevices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = ["All", "Computer", "Phone", "Tablet", "TV", "Smart Home", "Other"];

  useEffect(() => {
    async function loadDevices() {
      if (loading) return;

      if (isDemo || !user) {
        setDevices(demoDevices);
        return;
      }

      const { data, error } = await supabase
        .from("devices")
        .select("*")
        .eq("user_id", user.id)
        .order("device_name");

      if (error) {
        alert(error.message);
        return;
      }

      setDevices(data || []);
    }

    loadDevices();
  }, [user, isDemo, loading]);

  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      const matchesSearch =
        !search ||
        device.device_name?.toLowerCase().includes(search.toLowerCase()) ||
        device.brand?.toLowerCase().includes(search.toLowerCase()) ||
        device.category?.toLowerCase().includes(search.toLowerCase()) ||
        device.location?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = category === "All" || device.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [devices, search, category]);

  if (loading) {
    return <main className="p-8">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <PageHeader
        title={isDemo ? "Demo Technology Inventory" : "Technology Inventory"}
        description={
          isDemo
            ? "You are viewing sample devices. Sign in to manage your own vault."
            : "Search, filter, and manage only your saved devices."
        }
        action={
          <Link
            href={isDemo ? "/login" : "/devices/add"}
            className="bg-blue-950 text-white px-5 py-3 rounded-xl"
          >
            {isDemo ? "Create Your Vault" : "+ Add Device"}
          </Link>
        }
      />

      <div className="bg-white rounded-2xl shadow p-5 mt-8 flex gap-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search devices..."
          className="border rounded-xl px-4 py-3 flex-1"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded-xl px-4 py-3"
        >
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      {filteredDevices.length === 0 && (
        <p className="mt-8 text-gray-600">No devices found.</p>
      )}

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {filteredDevices.map((device) => (
          <DeviceCard key={device.id} device={device} />
        ))}
      </div>
    </main>
  );
}