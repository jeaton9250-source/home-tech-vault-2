import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Wifi, Router, Globe } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default async function NetworkPage() {
  const { data, error } = await supabase
    .from("network_info")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    return <main className="p-8">Error: {error.message}</main>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <PageHeader
        title="Network Center"
        description="Store your home internet information in one secure place."
        action={
          <Link
            href="/network/edit"
            className="bg-blue-950 text-white px-6 py-3 rounded-xl"
          >
            {data ? "Edit Network" : "Setup Network"}
          </Link>
        }
      />

      {!data && (
        <div className="bg-white rounded-2xl shadow p-10 mt-8 text-center">
          <Wifi className="mx-auto text-blue-950" size={70} />
          <h2 className="text-2xl font-bold mt-5">No Network Information</h2>
          <p className="text-gray-600 mt-2">
            Add your router, modem, Wi-Fi information and internet speeds.
          </p>
        </div>
      )}

      {data && (
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center gap-3">
              <Globe className="text-blue-950" />
              <h2 className="text-2xl font-bold text-blue-950">
                Internet Provider
              </h2>
            </div>

            <div className="mt-5 space-y-3">
              <p><strong>ISP:</strong> {data.isp || "-"}</p>
              <p><strong>Download:</strong> {data.speed_download || "-"} Mbps</p>
              <p><strong>Upload:</strong> {data.speed_upload || "-"} Mbps</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center gap-3">
              <Router className="text-blue-950" />
              <h2 className="text-2xl font-bold text-blue-950">Equipment</h2>
            </div>

            <div className="mt-5 space-y-3">
              <p><strong>Router:</strong> {data.router_model || "-"}</p>
              <p><strong>Modem:</strong> {data.modem_model || "-"}</p>
              <p><strong>Wi-Fi:</strong> {data.wifi_name || "-"}</p>
              <p><strong>Guest:</strong> {data.guest_network || "-"}</p>
              <p><strong>Admin URL:</strong> {data.admin_url || "-"}</p>
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-2xl shadow p-6">
            <h2 className="text-2xl font-bold text-blue-950">Notes</h2>
            <p className="mt-4 text-gray-700">{data.notes || "No notes saved."}</p>
          </div>
        </div>
      )}
    </main>
  );
}