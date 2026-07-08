"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signUp() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Account created. You can now sign in.");
    }
  }

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      window.location.href = "/";
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-3xl shadow max-w-md w-full">
        <h1 className="text-3xl font-bold text-blue-950">
          Home Tech Vault™
        </h1>

        <p className="text-gray-600 mt-2">
          Sign in or create your vault.
        </p>

        <input
          className="border rounded-xl p-3 w-full mt-6"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border rounded-xl p-3 w-full mt-4"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={signIn}
          className="bg-blue-950 text-white w-full rounded-xl py-3 mt-5"
        >
          Sign In
        </button>

        <button
          onClick={signUp}
          className="border border-blue-950 text-blue-950 w-full rounded-xl py-3 mt-3"
        >
          Create Account
        </button>
      </div>
    </main>
  );
}