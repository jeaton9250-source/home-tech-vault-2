"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  async function signIn() {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "http://localhost:3000",
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Check your email for the login link.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-3xl shadow max-w-md w-full">
        <h1 className="text-3xl font-bold text-blue-950">
          Home Tech Vault™
        </h1>

        <p className="text-gray-600 mt-2">
          Sign in to access your vault.
        </p>

        <input
          className="border rounded-xl p-3 w-full mt-6"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={signIn}
          className="bg-blue-950 text-white w-full rounded-xl py-3 mt-4"
        >
          Send Login Link
        </button>
      </div>
    </main>
  );
}