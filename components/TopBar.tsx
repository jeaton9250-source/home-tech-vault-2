"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function TopBar() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setEmail(user?.email ?? null);
    }

    loadUser();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <header className="bg-white border-b px-8 py-5 flex justify-between items-center">
      <h2 className="text-xl font-bold text-blue-950">Home Tech Vault™</h2>

      {email ? (
        <div className="flex items-center gap-5">
          <p className="text-gray-600 text-sm">{email}</p>

          <button
            onClick={signOut}
            className="bg-red-600 text-white px-4 py-2 rounded-xl"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          className="bg-blue-950 text-white px-4 py-2 rounded-xl"
        >
          Sign In
        </Link>
      )}
    </header>
  );
}