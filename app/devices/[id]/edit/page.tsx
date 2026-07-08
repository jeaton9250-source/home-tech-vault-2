"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function EditDevice({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

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
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadDevice() {
      const { data, error } = await supabase
        .from("devices")
        .select("*")
        .eq("id", id)
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
      setPhotoUrl(data.photo_url || "");
    }

    loadDevice();
  }, [id]);

  async function uploadPhoto() {
    if (!photoFile) return photoUrl;

    const filePath = `${id}/${Date.now()}-${photoFile.name}`;

    const { error } = await supabase.storage
      .from("device-photos")
      .upload(filePath, photoFile);

    if (error) {
      alert(error.message);
      return photoUrl;
    }

    const { data } = supabase.storage
      .from("device-photos")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function updateDevice() {
    const newPhotoUrl = await uploadPhoto();

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
        photo_url: newPhotoUrl,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
    } else {
      alert("Device updated!");
      window.location.href = `/devices/${id}`;
    }
  }

  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-blue-950">Edit Device</h1>

      <div className="bg-white mt-8 p-6 rounded-2xl shadow max-w-2xl">
        {photoUrl && (
          <img
            src={photoUrl}
            alt="Device photo"
            className="w-full h-64 object-cover rounded-2xl mb-6"
          />
        )}

        <label className="block mb-2 font-semibold">Device Photo</label>
        <input
          type="file"
          accept="image/*"
          className="border p-3 rounded-xl w-full mb-4"
          onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
        />

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