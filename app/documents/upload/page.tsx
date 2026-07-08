"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Device = {
  id: string;
  device_name: string;
};

export default function UploadDocumentPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceId, setDeviceId] = useState("");
  const [fileType, setFileType] = useState("Receipt");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadDevices() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("devices")
        .select("id, device_name")
        .eq("user_id", user.id);

      setDevices(data || []);
    }

    loadDevices();
  }, []);

  async function uploadDocument() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please sign in first.");
      window.location.href = "/login";
      return;
    }

    if (!deviceId || !file) {
      alert("Please select a device and file.");
      return;
    }

    const filePath = `${user.id}/${deviceId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (uploadError) {
      alert(uploadError.message);
      return;
    }

    const { data } = supabase.storage
      .from("documents")
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase.from("documents").insert({
      user_id: user.id,
      device_id: deviceId,
      file_name: file.name,
      file_url: data.publicUrl,
      file_type: fileType,
    });

    if (dbError) {
      alert(dbError.message);
    } else {
      alert("Document uploaded!");
      window.location.href = "/documents";
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold text-blue-950">Upload Document</h1>

      <div className="bg-white mt-8 p-6 rounded-2xl shadow max-w-2xl space-y-4">
        <select
          className="border rounded-xl p-3 w-full"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
        >
          <option value="">Select Device</option>
          {devices.map((device) => (
            <option key={device.id} value={device.id}>
              {device.device_name}
            </option>
          ))}
        </select>

        <select
          className="border rounded-xl p-3 w-full"
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
        >
          <option>Receipt</option>
          <option>Manual</option>
          <option>Warranty</option>
          <option>Invoice</option>
          <option>Photo</option>
          <option>Other</option>
        </select>

        <input
          type="file"
          className="border rounded-xl p-3 w-full"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={uploadDocument}
          className="bg-blue-950 text-white px-6 py-3 rounded-xl"
        >
          Upload Document
        </button>
      </div>
    </main>
  );
}