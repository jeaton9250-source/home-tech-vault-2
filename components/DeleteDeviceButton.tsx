"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { applyHouseholdMutationScope } from "@/lib/data/householdScope";
import { usePermissions } from "@/hooks/usePermissions";
import { Trash2 } from "lucide-react";

export default function DeleteDeviceButton({
  deviceId,
}: {
  deviceId: string;
}) {
  const {
    user,
    householdId,
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

      const { error } =
        await applyHouseholdMutationScope(
          supabase
            .from("devices")
            .delete()
            .eq("id", deviceId),
          householdId,
          user.id
        );

      if (error) {
        throw error;
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
