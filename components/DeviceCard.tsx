import Link from "next/link";
import { Laptop, ArrowRight } from "lucide-react";

type DeviceCardProps = {
  device: {
    id: string;
    device_name: string;
    brand?: string;
    category?: string;
    model_number?: string;
    warranty_date?: string;
    location?: string;
    photo_url?: string;
  };
};

function getWarrantyStatus(warrantyDate?: string) {
  if (!warrantyDate) {
    return { label: "Warranty Unknown", style: "bg-gray-100 text-gray-700" };
  }

  const today = new Date();
  const warranty = new Date(warrantyDate);
  const diffDays = Math.ceil(
    (warranty.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return { label: "Warranty Expired", style: "bg-red-100 text-red-700" };
  if (diffDays <= 30) return { label: `${diffDays} days left`, style: "bg-yellow-100 text-yellow-800" };

  return { label: "Warranty Active", style: "bg-green-100 text-green-700" };
}

export default function DeviceCard({ device }: DeviceCardProps) {
  const warranty = getWarrantyStatus(device.warranty_date);

  return (
    <Link href={`/devices/${device.id}`}>
      <div className="bg-white rounded-2xl shadow border border-gray-100 hover:shadow-lg transition overflow-hidden cursor-pointer">
        {device.photo_url ? (
          <img
            src={device.photo_url}
            alt={device.device_name}
            className="w-full h-44 object-cover"
          />
        ) : (
          <div className="h-44 bg-blue-50 flex items-center justify-center text-blue-950">
            <Laptop size={56} />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-blue-950">
                {device.device_name}
              </h2>
              <p className="text-gray-500">{device.brand || "No brand added"}</p>
            </div>

            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${warranty.style}`}>
              {warranty.label}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-400">Category</p>
              <p className="font-medium">{device.category || "-"}</p>
            </div>

            <div>
              <p className="text-gray-400">Location</p>
              <p className="font-medium">{device.location || "-"}</p>
            </div>

            <div>
              <p className="text-gray-400">Model</p>
              <p className="font-medium">{device.model_number || "-"}</p>
            </div>

            <div>
              <p className="text-gray-400">Warranty</p>
              <p className="font-medium">{device.warranty_date || "-"}</p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 text-blue-950 font-semibold">
            View Details <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  );
}