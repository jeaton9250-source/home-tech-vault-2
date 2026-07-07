
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function EditDevice({
  params,
}: {
  params: { id: string };
}) {
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

  useEffect(() => {
    async function loadDevice() {
      const { data, error } = await supabase
        .from("devices")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      setDeviceName(data.device_name || "");
      setCategory(data.category || "");
      setBrand(data.brand || "");
      setModelNumber(data.model_number || "");
      setSerialNumber(data.serial_number || "");
      setPurchaseDate(data.purchase_date || "");
      setWarrantyDate(data.warranty_date || "");
      setPurchasePrice(data.purchase_price ? String(data.purchase_price) : "");
      setLocation(data.location || "");
      setNotes(data.notes || "");
    }

    loadDevice();
  }, [params.id]);

  async function updateDevice() {
    const { error } = await supabase
      .from("devices")
      .update({
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
      })
      .eq("id", params.id);

    if (error) {
      alert(error.message);
    } else {
      alert("Device updated!");
      window.location.href = `/devices/${params.id}`;
    }
  }

  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-blue-950">Edit Device</h1>

      <div className="bg-white mt-8 p-6 rounded-2xl shadow max-w-2xl">
        <input className="border p-3 rounded-xl w-full mb-4" value={deviceName} placeholder="Device Name" onChange={(e) => setDeviceName(e.target.value)} />
        <input className="border p-3 rounded-xl w-full mb-4" value={category} placeholder="Category" onChange={(e) => setCategory(e.target.value)} />
        <input className="border p-3 rounded-xl w-full mb-4" value={brand} placeholder="Brand" onChange={(e) => setBrand(e.target.value)} />
        <input className="border p-3 rounded-xl w-full mb-4" value={modelNumber} placeholder="Model Number" onChange={(e) => setModelNumber(e.target.value)} />
        <input className="border p-3 rounded-xl w-full mb-4" value={serialNumber} placeholder="Serial Number" onChange={(e) => setSerialNumber(e.target.value)} />

        <label className="block mb-2 font-semibold">Purchase Date</label>
        <input type="date" className="border p-3 rounded-xl w-full mb-4" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />

        <label className="block mb-2 font-semibold">Warranty Expiration</label>
        <input type="date" className="border p-3 rounded-xl w-full mb-4" value={warrantyDate} onChange={(e) => setWarrantyDate(e.target.value)} />

        <input type="number" className="border p-3 rounded-xl w-full mb-4" value={purchasePrice} placeholder="Purchase Price" onChange={(e) => setPurchasePrice(e.target.value)} />
        <input className="border p-3 rounded-xl w-full mb-4" value={location} placeholder="Location" onChange={(e) => setLocation(e.target.value)} />
        <textarea className="border p-3 rounded-xl w-full mb-4" value={notes} placeholder="Notes" onChange={(e) => setNotes(e.target.value)} />

        <button onClick={updateDevice} className="bg-blue-950 text-white px-6 py-3 rounded-xl">
          Save Changes
        </button>
      </div>
    </main>
  );
}