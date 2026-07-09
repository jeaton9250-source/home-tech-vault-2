"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function useDemoMode() {
  const [user, setUser] = useState<User | null>(null);
  const [isDemo, setIsDemo] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setIsDemo(!user);
      setLoading(false);
    }

    checkUser();
  }, []);

  return { user, isDemo, loading };
}