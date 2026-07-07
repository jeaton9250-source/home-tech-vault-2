"use client";

import { supabase } from "@/lib/supabase";
import { Trash2 } from "lucide-react";

export default function DeleteSubscriptionButton({
  subscriptionId,
}: {
  subscriptionId: string;
}) {
  async function deleteSubscription() {
    const confirmed = confirm(
      "Are you sure you want to delete this subscription?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("id", subscriptionId);

    if (error) {
      alert(error.message);
    } else {
      alert("Subscription deleted.");
      window.location.href = "/subscriptions";
    }
  }

  return (
    <button
      onClick={deleteSubscription}
      className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition text-sm"
    >
      <Trash2 size={16} />
      Delete
    </button>
  );
}