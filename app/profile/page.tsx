"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error(error);
      }

      if (data) {
        setFullName(data.full_name || "");
        setHouseholdName(data.household_name || "");
        setCity(data.city || "");
        setPhone(data.phone || "");
      }

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function saveProfile() {
    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullName.trim() || null,
        household_name: householdName.trim() || null,
        city: city.trim() || null,
        phone: phone.trim() || null,
      });

      if (error) {
        throw error;
      }

      alert("Profile updated successfully.");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to save your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <p>Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-4xl font-bold text-blue-950">
          My Profile
        </h1>

        <p className="mt-2 text-gray-600">
          Personalize your Home Tech Vault account.
        </p>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow">
          <label className="mb-2 block font-semibold">
            Full Name
          </label>

          <input
            className="mb-4 w-full rounded-xl border p-3"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jason Eaton"
          />

          <label className="mb-2 block font-semibold">
            Household Name
          </label>

          <input
            className="mb-4 w-full rounded-xl border p-3"
            value={householdName}
            onChange={(e) => setHouseholdName(e.target.value)}
            placeholder="The Eaton Household"
          />

          <label className="mb-2 block font-semibold">
            City
          </label>

          <input
            className="mb-4 w-full rounded-xl border p-3"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Wilmington, NC"
          />

          <label className="mb-2 block font-semibold">
            Phone Number
          </label>

          <input
            className="mb-4 w-full rounded-xl border p-3"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(910) 555-1234"
          />

          <button
            type="button"
            onClick={saveProfile}
            disabled={saving}
            className="rounded-xl bg-blue-950 px-6 py-3 font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </main>
  );
}