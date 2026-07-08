"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setEmail(user?.email || "");
    }

    loadUser();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <PageHeader
        title="Settings"
        description="Manage your Home Tech Vault account and preferences."
      />

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-bold text-blue-950">Account</h2>

          <div className="mt-5 space-y-3 text-gray-700">
            <p>
              <strong>Email:</strong> {email || "Not signed in"}
            </p>

            <p>
              <strong>Plan:</strong> Free Beta
            </p>

            <p>
              <strong>Status:</strong> Active
            </p>
          </div>

          <button
            onClick={signOut}
            className="bg-red-600 text-white px-5 py-3 rounded-xl mt-6"
          >
            Sign Out
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-bold text-blue-950">Preferences</h2>

          <div className="mt-5 space-y-3 text-gray-700">
            <p>
              <strong>Theme:</strong> Light Mode
            </p>

            <p>
              <strong>Currency:</strong> USD
            </p>

            <p>
              <strong>Date Format:</strong> MM/DD/YYYY
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 md:col-span-2">
          <h2 className="text-2xl font-bold text-blue-950">Beta Notice</h2>

          <p className="text-gray-600 mt-4">
            Home Tech Vault is currently in beta. Features like AI insights,
            mobile optimization, PDF reports, reminders, and paid plans are
            planned for future versions.
          </p>
        </div>
      </div>
    </main>
  );
}