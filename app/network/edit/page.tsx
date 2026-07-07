"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function EditNetwork() {
  const [id, setId] = useState<string | null>(null);

  const [isp, setIsp] = useState("");
  const [routerModel, setRouterModel] = useState("");
  const [modemModel, setModemModel] = useState("");
  const [wifiName, setWifiName] = useState("");
  const [wifiPasswordHint, setWifiPasswordHint] = useState("");
  const [guestNetwork, setGuestNetwork] = useState("");
  const [adminUrl, setAdminUrl] = useState("");
  const [downloadSpeed, setDownloadSpeed] = useState("");
  const [uploadSpeed, setUploadSpeed] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function loadNetwork() {
      const { data } = await supabase
        .from("network_info")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (!data) return;

      setId(data.id);
      setIsp(data.isp || "");
      setRouterModel(data.router_model || "");
      setModemModel(data.modem_model || "");
      setWifiName(data.wifi_name || "");
      setWifiPasswordHint(data.wifi_password_hint || "");
      setGuestNetwork(data.guest_network || "");
      setAdminUrl(data.admin_url || "");
      setDownloadSpeed(String(data.speed_download || ""));
      setUploadSpeed(String(data.speed_upload || ""));
      setNotes(data.notes || "");
    }

    loadNetwork();
  }, []);

  async function saveNetwork() {
    const payload = {
      isp,
      router_model: routerModel,
      modem_model: modemModel,
      wifi_name: wifiName,
      wifi_password_hint: wifiPasswordHint,
      guest_network: guestNetwork,
      admin_url: adminUrl,
      speed_download: downloadSpeed ? Number(downloadSpeed) : null,
      speed_upload: uploadSpeed ? Number(uploadSpeed) : null,
      notes,
    };

    let error;

    if (id) {
      ({ error } = await supabase
        .from("network_info")
        .update(payload)
        .eq("id", id));
    } else {
      ({ error } = await supabase
        .from("network_info")
        .insert(payload));
    }

    if (error) {
      alert(error.message);
    } else {
      alert("Network information saved!");
      window.location.href = "/network";
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold text-blue-950">
        Home Network
      </h1>

      <div className="bg-white rounded-2xl shadow p-6 mt-8 max-w-3xl space-y-4">

        <input
          className="border rounded-xl p-3 w-full"
          placeholder="Internet Provider"
          value={isp}
          onChange={(e) => setIsp(e.target.value)}
        />

        <input
          className="border rounded-xl p-3 w-full"
          placeholder="Router Model"
          value={routerModel}
          onChange={(e) => setRouterModel(e.target.value)}
        />

        <input
          className="border rounded-xl p-3 w-full"
          placeholder="Modem Model"
          value={modemModel}
          onChange={(e) => setModemModel(e.target.value)}
        />

        <input
          className="border rounded-xl p-3 w-full"
          placeholder="Wi-Fi Name"
          value={wifiName}
          onChange={(e) => setWifiName(e.target.value)}
        />

        <input
          className="border rounded-xl p-3 w-full"
          placeholder="Wi-Fi Password Hint"
          value={wifiPasswordHint}
          onChange={(e) => setWifiPasswordHint(e.target.value)}
        />

        <input
          className="border rounded-xl p-3 w-full"
          placeholder="Guest Network"
          value={guestNetwork}
          onChange={(e) => setGuestNetwork(e.target.value)}
        />

        <input
          className="border rounded-xl p-3 w-full"
          placeholder="Router Admin URL"
          value={adminUrl}
          onChange={(e) => setAdminUrl(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            className="border rounded-xl p-3"
            placeholder="Download Mbps"
            value={downloadSpeed}
            onChange={(e) => setDownloadSpeed(e.target.value)}
          />

          <input
            className="border rounded-xl p-3"
            placeholder="Upload Mbps"
            value={uploadSpeed}
            onChange={(e) => setUploadSpeed(e.target.value)}
          />
        </div>

        <textarea
          className="border rounded-xl p-3 w-full"
          rows={5}
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button
          onClick={saveNetwork}
          className="bg-blue-950 text-white px-6 py-3 rounded-xl"
        >
          Save Network
        </button>

      </div>
    </main>
  );
}