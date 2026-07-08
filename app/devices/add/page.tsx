"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AddDevice() {
  const [deviceName, setDeviceName] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warrantyDate, setWarrantyDate] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  async function saveDevice() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please sign in first.");
      window.location.href = "/login";
      return;
    }

    const { error } = await supabase.from("devices").insert({
      user_id: user.id,
      device_name: deviceName,
      category,
      brand,
      model_number: modelNumber,
      serial_number: serialNumber,
      purchase_date: purchaseDate || null,
      warranty_date: warrantyDate || null,
      purchase_price: purchasePrice ? Number(purchasePrice) : null,
      location,
      notes,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Device saved!");
      window.location.href = "/devices";
    }
  }

  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-blue-950">Add New Device</h1>

      <div className="bg-white mt-8 p-6 rounded-2xl shadow max-w-2xl">
        <input className="border p-3 rounded-xl w-full mb-4" placeholder="Device Name" onChange={(e) => setDeviceName(e.target.value)} />
        <input className="border p-3 rounded-xl w-full mb-4" placeholder="Category" onChange={(e) => setCategory(e.target.value)} />
        <input className="border p-3 rounded-xl w-full mb-4" placeholder="Brand" onChange={(e) => setBrand(e.target.value)} />
        <input className="border p-3 rounded-xl w-full mb-4" placeholder="Model Number" onChange={(e) => setModelNumber(e.target.value)} />
        <input className="border p-3 rounded-xl w-full mb-4" placeholder="Serial Number" onChange={(e) => setSerialNumber(e.target.value)} />

        <label className="block mb-2 font-semibold">Purchase Date</label>
        <input type="date" className="border p-3 rounded-xl w-full mb-4" onChange={(e) => setPurchaseDate(e.target.value)} />

        <label className="block mb-2 font-semibold">Warranty Expiration</label>
        <input type="date" className="border p-3 rounded-xl w-full mb-4" onChange={(e) => setWarrantyDate(e.target.value)} />

        <input type="number" className="border p-3 rounded-xl w-full mb-4" placeholder="Purchase Price" onChange={(e) => setPurchasePrice(e.target.value)} />
        <input className="border p-3 rounded-xl w-full mb-4" placeholder="Location" onChange={(e) => setLocation(e.target.value)} />
        <textarea className="border p-3 rounded-xl w-full mb-4" placeholder="Notes" onChange={(e) => setNotes(e.target.value)} />

        <button onClick={saveDevice} className="bg-blue-950 text-white px-6 py-3 rounded-xl">
          Save Device
        </button>
      </div>
    </main>
  );
}