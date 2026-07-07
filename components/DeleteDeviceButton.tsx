"use client";

import { supabase } from "@/lib/supabase";
import { Trash2 } from "lucide-react";

export default function DeleteDeviceButton({ deviceId }: { deviceId: string }) {
  async function deleteDevice() {
    const confirmed = confirm(
      "Are you sure you want to delete this device? This cannot be undone."
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("devices")
      .delete()
      .eq("id", deviceId);

    if (error) {
      alert(error.message);
    } else {
      alert("Device deleted.");
      window.location.href = "/devices";
    }
  }

  return (
    <button
      onClick={deleteDevice}
      className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-3 rounded-xl hover:bg-red-700 transition"
    >
      <Trash2 size={18} />
      Delete Device
    </button>
  );
}