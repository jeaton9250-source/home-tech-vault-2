"use client";

import { useEffect } from "react";
import { analytics } from "@heycatch/sdk";

import { supabase } from "@/lib/supabase";

type AuthUser = {
  id: string;
  email?: string | null;
  created_at?: string;
  user_metadata?: Record<string, unknown>;
};

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : undefined;
}

function getName(user: AuthUser): string | undefined {
  const metadata = user.user_metadata ?? {};

  const metadataName =
    readString(metadata.full_name) ??
    readString(metadata.name);

  if (metadataName) {
    return metadataName;
  }

  const name = [
    readString(metadata.first_name),
    readString(metadata.last_name),
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || undefined;
}

function identify(user: AuthUser) {
  const email = readString(user.email);
  const name = getName(user);
  const signupDate = readString(user.created_at);

  analytics.setIdentity(
    user.id,
    {
      ...(email ? { email } : {}),
      ...(name ? { name } : {}),
    },
    signupDate ? { signup_date: signupDate } : undefined
  );
}

export default function HeyCatchIdentity() {
  useEffect(() => {
    let active = true;

    void supabase.auth.getUser().then(({ data }) => {
      if (!active) {
        return;
      }

      if (data.user) {
        identify(data.user);
      } else {
        analytics.resetIdentity();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        identify(session.user);
      } else {
        analytics.resetIdentity();
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
