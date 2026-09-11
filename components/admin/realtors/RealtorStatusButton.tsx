"use client";

import { useState } from "react";

export default function RealtorStatusButton({
  partnerId,
  currentStatus,
}: {
  partnerId: string;
  currentStatus: string;
}) {
  const [loading, setLoading] = useState(false);

  const suspending =
    currentStatus !== "suspended";

  const nextStatus =
    suspending ? "suspended" : "active";

  async function updateStatus() {
    if (
      suspending &&
      !window.confirm(
        "Suspend this Realtor account?"
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/realtors/${partnerId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const payload =
        await response.json();

      if (!response.ok) {
        throw new Error(
          payload.error ||
            "Unable to update Realtor."
        );
      }

      window.location.reload();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to update Realtor."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => void updateStatus()}
      className={[
        "inline-flex min-h-9 items-center justify-center rounded-xl border px-3 text-xs font-semibold transition disabled:opacity-50",
        suspending
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-[#718d4f]/25 bg-[#718d4f]/10 text-[#617c43]",
      ].join(" ")}
    >
      {loading
        ? "Saving..."
        : suspending
          ? "Suspend"
          : "Reactivate"}
    </button>
  );
}
