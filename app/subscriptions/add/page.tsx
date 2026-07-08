"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AddSubscription() {
  const [serviceName, setServiceName] = useState("");
  const [category, setCategory] = useState("");
  const [monthlyCost, setMonthlyCost] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [billingCycle, setBillingCycle] = useState("Monthly");
  const [notes, setNotes] = useState("");

  async function saveSubscription() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please sign in first.");
      window.location.href = "/login";
      return;
    }

    const { error } = await supabase.from("subscriptions").insert({
      user_id: user.id,
      service_name: serviceName,
      category,
      monthly_cost: monthlyCost ? Number(monthlyCost) : 0,
      renewal_date: renewalDate || null,
      billing_cycle: billingCycle,
      notes,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Subscription saved!");
      window.location.href = "/subscriptions";
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold text-blue-950">Add Subscription</h1>

      <div className="bg-white mt-8 p-6 rounded-2xl shadow max-w-2xl">
        <input className="border p-3 rounded-xl w-full mb-4" placeholder="Service Name" onChange={(e) => setServiceName(e.target.value)} />
        <input className="border p-3 rounded-xl w-full mb-4" placeholder="Category" onChange={(e) => setCategory(e.target.value)} />
        <input type="number" className="border p-3 rounded-xl w-full mb-4" placeholder="Monthly Cost" onChange={(e) => setMonthlyCost(e.target.value)} />

        <label className="block mb-2 font-semibold">Renewal Date</label>
        <input type="date" className="border p-3 rounded-xl w-full mb-4" onChange={(e) => setRenewalDate(e.target.value)} />

        <select className="border p-3 rounded-xl w-full mb-4" value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)}>
          <option>Monthly</option>
          <option>Yearly</option>
          <option>Quarterly</option>
          <option>Weekly</option>
        </select>

        <textarea className="border p-3 rounded-xl w-full mb-4" placeholder="Notes" onChange={(e) => setNotes(e.target.value)} />

        <button onClick={saveSubscription} className="bg-blue-950 text-white px-6 py-3 rounded-xl">
          Save Subscription
        </button>
      </div>
    </main>
  );
}