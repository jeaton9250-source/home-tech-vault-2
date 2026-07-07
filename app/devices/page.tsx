import { supabase } from "@/lib/supabase";
import Link from "next/link";
import DeviceCard from "@/components/DeviceCard";

export default async function Devices({
  searchParams,
}: {
  searchParams?: {
    q?: string;
    category?: string;
  };
}) {
  const search = searchParams?.q || "";
  const category = searchParams?.category || "All";

  let query = supabase.from("devices").select("*");

  if (search) {
    query = query.or(
      `device_name.ilike.%${search}%,brand.ilike.%${search}%,category.ilike.%${search}%,location.ilike.%${search}%`
    );
  }

  if (category !== "All") {
    query = query.eq("category", category);
  }

  const { data: devices, error } = await query;

  if (error) {
    return <main className="p-8">Error: {error.message}</main>;
  }

  const categories = ["All", "Computer", "Phone", "Tablet", "TV", "Smart Home", "Other"];

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-blue-950">
            Technology Inventory
          </h1>
          <p className="text-gray-600 mt-2">
            Search, filter, and manage your home technology.
          </p>
        </div>

        <Link
          href="/devices/add"
          className="bg-blue-950 text-white px-5 py-3 rounded-xl"
        >
          + Add Device
        </Link>
      </div>

      <form className="bg-white rounded-2xl shadow p-5 mt-8 flex gap-4">
        <input
          name="q"
          defaultValue={search}
          placeholder="Search devices..."
          className="border rounded-xl px-4 py-3 flex-1"
        />

        <select
          name="category"
          defaultValue={category}
          className="border rounded-xl px-4 py-3"
        >
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>

        <button className="bg-blue-950 text-white px-5 py-3 rounded-xl">
          Search
        </button>
      </form>

      {devices?.length === 0 && (
        <p className="mt-8 text-gray-600">
          No devices found.
        </p>
      )}

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {devices?.map((device) => (
          <DeviceCard key={device.id} device={device} />
        ))}
      </div>
    </main>
  );
}