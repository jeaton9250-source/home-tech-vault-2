import Link from "next/link";
import { Laptop, ArrowRight } from "lucide-react";
import {
  calculateDeviceHealth,
  getDeviceHealthLabel,
} from "@/lib/calculateDeviceHealth";

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
    serial_number?: string;
    purchase_date?: string;
    purchase_price?: number;
    notes?: string;
  };
};

export default function DeviceCard({ device }: DeviceCardProps) {
  const healthScore = calculateDeviceHealth(device);
  const healthLabel = getDeviceHealthLabel(healthScore);

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

            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
              {healthScore}/100
            </span>
          </div>

          <p className="text-sm text-gray-500 mt-3">
            Health: {healthLabel}
          </p>

          <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
            <div
              className="bg-blue-950 h-2 rounded-full"
              style={{ width: `${healthScore}%` }}
            />
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
          </div>

          <div className="mt-5 flex items-center gap-2 text-blue-950 font-semibold">
            View Details <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  );
}