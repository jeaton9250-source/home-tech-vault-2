"use client";

import { useState } from "react";
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

      const response = await fetch(
        `/api/devices/${encodeURIComponent(deviceId)}`,
        {
          method: "DELETE",
          credentials: "same-origin",
        }
      );

      const payload = (await response.json().catch(
        () => null
      )) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(
          payload?.error ||
            `Unable to delete this device (${response.status}).`
        );
      }

      window.location.href = "/devices";
    } catch (error) {
      console.error(
        "Unable to delete device:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete this device. Please try again."
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
