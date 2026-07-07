import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Laptop, ArrowLeft } from "lucide-react";
import DeleteDeviceButton from "@/components/DeleteDeviceButton";

export default async function DeviceDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: device, error } = await supabase
    .from("devices")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !device) {
    return (
      <main className="p-8">
        <Link href="/devices" className="text-blue-950 font-semibold">
          Back to Inventory
        </Link>

        <p className="mt-6 text-red-600">Device not found.</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <div className="flex items-center justify-between">
        <Link
          href="/devices"
          className="inline-flex items-center gap-2 text-blue-950 font-semibold"
        >
          <ArrowLeft size={18} /> Back to Inventory
        </Link>

        <div className="flex gap-3">
          <Link
            href={`/devices/${device.id}/edit`}
            className="bg-blue-950 text-white px-5 py-3 rounded-xl"
          >
            Edit Device
          </Link>

          <DeleteDeviceButton deviceId={device.id} />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow p-8 mt-6">
        <div className="flex items-center gap-5">
          <div className="bg-blue-50 text-blue-950 p-5 rounded-2xl">
            <Laptop size={42} />
          </div>

          <div>
            <h1 className="text-4xl font-bold text-blue-950">
              {device.device_name}
            </h1>
            <p className="text-gray-500 mt-1">
              {device.brand} • {device.category}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-10">
          <Info title="Model Number" value={device.model_number} />
          <Info title="Serial Number" value={device.serial_number} />
          <Info title="Location" value={device.location} />
          <Info title="Purchase Date" value={device.purchase_date} />
          <Info title="Warranty Date" value={device.warranty_date} />
          <Info
            title="Purchase Price"
            value={device.purchase_price ? `$${device.purchase_price}` : "-"}
          />
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-blue-950">Tech Notes</h2>

          <p className="bg-gray-50 rounded-2xl p-5 mt-4 text-gray-700">
            {device.notes || "No notes added yet."}
          </p>
        </div>
      </div>
    </main>
  );
}

function Info({ title, value }: { title: string; value?: string }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="font-semibold text-blue-950 mt-1">{value || "-"}</p>
    </div>
  );
}