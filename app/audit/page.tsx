import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import DownloadAuditPdfButton from "@/components/DownloadAuditPdfButton";
import { calculateTechnologyScore } from "@/lib/calculateTechnologyScore";

export default async function AuditPage() {
  const { data: devices } = await supabase.from("devices").select("*");
  const { data: subscriptions } = await supabase.from("subscriptions").select("*");
  const { data: documents } = await supabase.from("documents").select("*");
  const { data: network } = await supabase
    .from("network_info")
    .select("*")
    .limit(1)
    .maybeSingle();

  const deviceList = devices ?? [];
  const subscriptionList = subscriptions ?? [];
  const documentList = documents ?? [];

  const score = calculateTechnologyScore(deviceList);

  const totalValue = deviceList.reduce(
    (sum, device) => sum + Number(device.purchase_price || 0),
    0
  );

  const monthlySpend = subscriptionList.reduce(
    (sum, sub) => sum + Number(sub.monthly_cost || 0),
    0
  );

  const missingSerials = deviceList.filter((device) => !device.serial_number);
  const missingWarranties = deviceList.filter((device) => !device.warranty_date);
  const missingPhotos = deviceList.filter((device) => !device.photo_url);

  return (
    <main className="min-h-screen bg-gray-100 p-8 print:bg-white">
      <div className="print:hidden flex items-center justify-between">
        <PageHeader
          title="Technology Audit"
          description="A complete snapshot of your home technology health."
        />

        <DownloadAuditPdfButton />
      </div>

      <div className="hidden print:block mb-8">
        <h1 className="text-4xl font-bold text-blue-950">Home Tech Vault™</h1>
        <p className="text-gray-600 mt-2">Technology Audit Report</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mt-8 print:grid-cols-4">
        <StatCard
          title="Tech Score"
          value={`${score}/100`}
          description="Overall health"
        />

        <StatCard
          title="Devices"
          value={String(deviceList.length)}
          description="Tracked devices"
        />

        <StatCard
          title="Documents"
          value={String(documentList.length)}
          description="Stored files"
        />

        <StatCard
          title="Monthly Spend"
          value={`$${monthlySpend.toFixed(2)}`}
          description="Subscriptions"
        />
      </div>

      <div className="bg-white rounded-3xl shadow p-8 mt-8 print:shadow-none print:border">
        <h2 className="text-2xl font-bold text-blue-950">Audit Summary</h2>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="bg-blue-50 rounded-2xl p-6">
            <p className="text-gray-600">Estimated Technology Value</p>
            <h3 className="text-3xl font-bold text-blue-950 mt-2">
              ${totalValue.toFixed(2)}
            </h3>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6">
            <p className="text-gray-600">Network Status</p>
            <h3 className="text-3xl font-bold text-blue-950 mt-2">
              {network ? "Documented" : "Missing"}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <AuditCard
          title="Missing Serial Numbers"
          count={missingSerials.length}
          items={missingSerials.map((device) => device.device_name)}
        />

        <AuditCard
          title="Missing Warranties"
          count={missingWarranties.length}
          items={missingWarranties.map((device) => device.device_name)}
        />

        <AuditCard
          title="Missing Photos"
          count={missingPhotos.length}
          items={missingPhotos.map((device) => device.device_name)}
        />
      </div>

      <div className="bg-white rounded-3xl shadow p-8 mt-8 print:shadow-none print:border">
        <h2 className="text-2xl font-bold text-blue-950">
          Recommended Next Steps
        </h2>

        <ul className="mt-5 space-y-3 text-gray-700">
          <li>✓ Add missing serial numbers for better insurance documentation.</li>
          <li>✓ Upload receipts and warranty documents for high-value devices.</li>
          <li>✓ Add device photos to improve your inventory quality.</li>
          <li>✓ Keep subscription renewal dates updated.</li>
          <li>✓ Review your network information at least twice per year.</li>
        </ul>

        <Link
          href="/devices"
          className="inline-block mt-6 bg-blue-950 text-white px-6 py-3 rounded-xl print:hidden"
        >
          Improve My Vault
        </Link>
      </div>
    </main>
  );
}

function AuditCard({
  title,
  count,
  items,
}: {
  title: string;
  count: number;
  items: string[];
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 print:shadow-none print:border">
      <p className="text-gray-500">{title}</p>

      <h2 className="text-4xl font-bold text-blue-950 mt-2">{count}</h2>

      {items.length === 0 ? (
        <p className="text-gray-600 mt-4">Nothing missing here.</p>
      ) : (
        <ul className="mt-4 space-y-2 text-gray-700">
          {items.slice(0, 5).map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}