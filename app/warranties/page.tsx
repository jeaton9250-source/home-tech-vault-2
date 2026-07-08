import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";

function getWarrantyStatus(warrantyDate?: string) {
  if (!warrantyDate) {
    return {
      label: "Missing Warranty",
      group: "missing",
      style: "bg-gray-100 text-gray-700",
      days: null,
    };
  }

  const today = new Date();
  const warranty = new Date(warrantyDate);
  const diffDays = Math.ceil(
    (warranty.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) {
    return {
      label: "Expired",
      group: "expired",
      style: "bg-red-100 text-red-700",
      days: diffDays,
    };
  }

  if (diffDays <= 30) {
    return {
      label: `${diffDays} days left`,
      group: "expiring",
      style: "bg-yellow-100 text-yellow-800",
      days: diffDays,
    };
  }

  return {
    label: "Active",
    group: "active",
    style: "bg-green-100 text-green-700",
    days: diffDays,
  };
}

export default async function WarrantiesPage() {
  const { data: devices, error } = await supabase.from("devices").select("*");

  if (error) {
    return <main className="p-8">Error: {error.message}</main>;
  }

  const deviceList = devices ?? [];

  const active = deviceList.filter(
    (device) => getWarrantyStatus(device.warranty_date).group === "active"
  );

  const expiring = deviceList.filter(
    (device) => getWarrantyStatus(device.warranty_date).group === "expiring"
  );

  const expired = deviceList.filter(
    (device) => getWarrantyStatus(device.warranty_date).group === "expired"
  );

  const missing = deviceList.filter(
    (device) => getWarrantyStatus(device.warranty_date).group === "missing"
  );

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <PageHeader
        title="Warranty Center"
        description="Track active, expiring, expired, and missing warranties."
      />

      <div className="grid md:grid-cols-4 gap-6 mt-8">
        <WarrantyStat title="Active" value={active.length} />
        <WarrantyStat title="Expiring Soon" value={expiring.length} />
        <WarrantyStat title="Expired" value={expired.length} />
        <WarrantyStat title="Missing" value={missing.length} />
      </div>

      <Section title="Expiring Soon" devices={expiring} />
      <Section title="Active Warranties" devices={active} />
      <Section title="Expired Warranties" devices={expired} />
      <Section title="Missing Warranty Info" devices={missing} />
    </main>
  );
}

function WarrantyStat({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-4xl font-bold text-blue-950 mt-2">{value}</h2>
    </div>
  );
}

function Section({ title, devices }: { title: string; devices: any[] }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 mt-8">
      <h2 className="text-2xl font-bold text-blue-950">{title}</h2>

      {devices.length === 0 && (
        <p className="text-gray-600 mt-4">No devices in this group.</p>
      )}

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {devices.map((device) => {
          const warranty = getWarrantyStatus(device.warranty_date);

          return (
            <Link
              key={device.id}
              href={`/devices/${device.id}`}
              className="border rounded-2xl p-5 hover:shadow transition"
            >
              <h3 className="font-bold text-blue-950">
                {device.device_name}
              </h3>

              <p className="text-gray-500 mt-1">
                {device.brand || "No brand"} • {device.location || "No location"}
              </p>

              <span
                className={`inline-block mt-4 text-xs font-semibold px-3 py-1 rounded-full ${warranty.style}`}
              >
                {warranty.label}
              </span>

              <p className="text-sm text-gray-500 mt-3">
                Warranty Date: {device.warranty_date || "Not added"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}