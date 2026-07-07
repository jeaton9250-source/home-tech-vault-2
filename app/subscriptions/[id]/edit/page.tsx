"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function EditSubscription({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [serviceName, setServiceName] = useState("");
  const [category, setCategory] = useState("");
  const [monthlyCost, setMonthlyCost] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [billingCycle, setBillingCycle] = useState("Monthly");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function loadSubscription() {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      setServiceName(data.service_name || "");
      setCategory(data.category || "");
      setMonthlyCost(data.monthly_cost ? String(data.monthly_cost) : "");
      setRenewalDate(data.renewal_date || "");
      setBillingCycle(data.billing_cycle || "Monthly");
      setNotes(data.notes || "");
    }

    loadSubscription();
  }, [id]);

  async function updateSubscription() {
    const { error } = await supabase
      .from("subscriptions")
      .update({
        service_name: serviceName,
        category,
        monthly_cost: monthlyCost ? Number(monthlyCost) : 0,
        renewal_date: renewalDate || null,
        billing_cycle: billingCycle,
        notes,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
    } else {
      alert("Subscription updated!");
      window.location.href = "/subscriptions";
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold text-blue-950">Edit Subscription</h1>

      <div className="bg-white mt-8 p-6 rounded-2xl shadow max-w-2xl">
        <input className="border p-3 rounded-xl w-full mb-4" value={serviceName} placeholder="Service Name" onChange={(e) => setServiceName(e.target.value)} />
        <input className="border p-3 rounded-xl w-full mb-4" value={category} placeholder="Category" onChange={(e) => setCategory(e.target.value)} />
        <input type="number" className="border p-3 rounded-xl w-full mb-4" value={monthlyCost} placeholder="Monthly Cost" onChange={(e) => setMonthlyCost(e.target.value)} />

        <label className="block mb-2 font-semibold">Renewal Date</label>
        <input type="date" className="border p-3 rounded-xl w-full mb-4" value={renewalDate} onChange={(e) => setRenewalDate(e.target.value)} />

        <select className="border p-3 rounded-xl w-full mb-4" value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)}>
          <option>Monthly</option>
          <option>Yearly</option>
          <option>Quarterly</option>
          <option>Weekly</option>
        </select>

        <textarea className="border p-3 rounded-xl w-full mb-4" value={notes} placeholder="Notes" onChange={(e) => setNotes(e.target.value)} />

        <button onClick={updateSubscription} className="bg-blue-950 text-white px-6 py-3 rounded-xl">
          Save Changes
        </button>
      </div>
    </main>
  );
}