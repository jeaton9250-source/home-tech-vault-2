"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePermissions } from "@/hooks/usePermissions";
import { Trash2 } from "lucide-react";

export default function DeleteDeviceButton({
  deviceId,
}: {
  deviceId: string;
}) {
  const {
    user,
    canDelete,
    isDemo,
  } = usePermissions();

  const [deleting, setDeleting] = useState(false);

  async function deleteDevice() {
    if (!canDelete || isDemo || !user) {
      return;
    }

    const confirmed = confirm(
      "Are you sure you want to delete this device? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      // Delete by id only — RLS enforces household admin / owner access.
      // Do not also filter household_id: older rows may still have a null
      // household_id and that filter would match 0 rows with no error.
      const { data, error } = await supabase
        .from("devices")
        .delete()
        .eq("id", deviceId)
        .select("id");

      if (error) {
        throw error;
      }

      if (!data?.length) {
        throw new Error(
          "You do not have permission to delete this device, or it was already removed."
        );
      }

      window.location.href = "/devices";
    } catch (error) {
      console.error(
        "Unable to delete device:",
        error
      );

      alert(
        "Unable to delete this device. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (!canDelete) {
    return null;
  }

  return (
    <button
      onClick={deleteDevice}
      disabled={deleting}
      className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Trash2 size={18} />
      {deleting ? "Deleting..." : "Delete Device"}
    </button>
  );
}
