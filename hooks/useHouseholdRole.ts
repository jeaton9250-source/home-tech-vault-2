"use client";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import { useDemoMode } from "@/hooks/useDemoMode";

export type HouseholdRole =
  | "owner"
  | "admin"
  | "member"
  | "viewer";

export function useHouseholdRole() {
  const {
    user,
    isDemo,
    loading: demoLoading,
  } = useDemoMode();

  const [role, setRole] =
    useState<HouseholdRole | null>(null);

  const [householdId, setHouseholdId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadRole() {
      if (demoLoading) {
        return;
      }

      try {
        setLoading(true);

        if (isDemo || !user) {
          setRole(null);
          setHouseholdId(null);
          return;
        }

        const {
          data,
          error,
        } = await supabase
          .from("household_members")
          .select(
            "household_id, role"
          )
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

        if (error) {
          throw error;
        }

        setHouseholdId(
          data?.household_id || null
        );

        setRole(
          (data?.role as HouseholdRole) ||
            null
        );
      } catch (error) {
        console.error(
          "Unable to load household role:",
          error
        );

        setRole(null);
        setHouseholdId(null);
      } finally {
        setLoading(false);
      }
    }

    void loadRole();
  }, [
    user,
    isDemo,
    demoLoading,
  ]);

  const canAdd =
    role === "owner" ||
    role === "admin" ||
    role === "member";

  const canEdit = canAdd;

  const canDelete =
    role === "owner" ||
    role === "admin";

  const canInvite =
    role === "owner" ||
    role === "admin";

  const isViewer =
    role === "viewer";

  return {
    loading,
    role,
    householdId,
    isViewer,
    canAdd,
    canEdit,
    canDelete,
    canInvite,
  };
}