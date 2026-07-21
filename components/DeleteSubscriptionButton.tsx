"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { applyHouseholdMutationScope } from "@/lib/data/householdScope";
import { usePermissions } from "@/hooks/usePermissions";
import { Trash2 } from "lucide-react";

export default function DeleteSubscriptionButton({
  subscriptionId,
}: {
  subscriptionId: string;
}) {
  const {
    user,
    householdId,
    canDelete,
    isDemo,
  } = usePermissions();

  const [deleting, setDeleting] = useState(false);

  async function deleteSubscription() {
    if (!canDelete || isDemo || !user) {
      return;
    }

    const confirmed = confirm(
      "Are you sure you want to delete this subscription?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      const { error } =
        await applyHouseholdMutationScope(
          supabase
            .from("subscriptions")
            .delete()
            .eq("id", subscriptionId),
          householdId,
          user.id
        );

      if (error) {
        throw error;
      }

      window.location.href = "/subscriptions";
    } catch (error) {
      console.error(
        "Unable to delete subscription:",
        error
      );

      alert(
        "Unable to delete this subscription. Please try again."
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
      onClick={deleteSubscription}
      disabled={deleting}
      className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Trash2 size={16} />
      {deleting ? "Deleting..." : "Delete"}
    </button>
  );
}
