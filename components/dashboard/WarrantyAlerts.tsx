import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export type WarrantyDevice = {
  id: string;
  device_name: string | null;
  warranty_date: string | null;
  days_remaining: number;
};

type WarrantyAlertsProps = {
  warranties: WarrantyDevice[];
};

export default function WarrantyAlerts({
  warranties,
}: WarrantyAlertsProps) {
  return (
    <section className="rounded-[32px] border border-[#E8E2D6] bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F7F5EF] text-[#C8A96A]">
          <ShieldCheck size={22} />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#111827]">
            Warranty Alerts
          </h2>

          <p className="text-sm text-neutral-500">
            Coverage that may need your attention.
          </p>
        </div>
      </div>

      {warranties.length === 0 ? (
        <div className="mt-6 flex items-start gap-4 rounded-2xl bg-emerald-50 p-5">
          <CheckCircle2
            size={22}
            className="mt-0.5 text-emerald-700"
          />

          <div>
            <p className="font-semibold text-[#111827]">
              No warranties expiring soon
            </p>

            <p className="mt-1 text-sm text-neutral-500">
              Your tracked warranties are currently in good standing.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {warranties.map((warranty) => (
            <Link
              key={warranty.id}
              href={`/devices/${warranty.id}`}
              className="flex items-center justify-between gap-4 rounded-2xl bg-amber-50 p-4 transition hover:bg-amber-100"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle
                  size={20}
                  className="text-amber-700"
                />

                <div>
                  <p className="font-semibold text-[#111827]">
                    {warranty.device_name || "Unnamed Device"}
                  </p>

                  <p className="mt-1 text-sm text-neutral-500">
                    Warranty expires soon
                  </p>
                </div>
              </div>

              <span className="whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-700">
                {warranty.days_remaining} days
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}