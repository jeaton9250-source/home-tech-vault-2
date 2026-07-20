"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  User,
} from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

export type HouseholdRole =
  | "viewer"
  | "member"
  | "admin";

type HouseholdMembership = {
  household_id: string;
  role: string | null;
};

function normalizeRole(
  value: string | null | undefined
): HouseholdRole {
  if (value === "admin") {
    return "admin";
  }

  if (value === "member") {
    return "member";
  }

  return "viewer";
}

export function usePermissions() {
  const [user, setUser] =
    useState<User | null>(null);

  const [role, setRole] =
    useState<HouseholdRole>("viewer");

  const [householdId, setHouseholdId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadPermissions =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const {
          data: authData,
          error: authError,
        } =
          await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        const currentUser =
          authData.user ?? null;

        setUser(currentUser);

        /*
         * Signed-out visitors are Demo Mode
         * users and remain read-only.
         */
        if (!currentUser) {
          setRole("viewer");
          setHouseholdId(null);
          return;
        }

        const {
          data: membershipData,
          error: membershipError,
        } = await supabase
          .from("household_members")
          .select(
            `
              household_id,
              role
            `
          )
          .eq("user_id", currentUser.id)
          .limit(1)
          .maybeSingle<HouseholdMembership>();

        if (membershipError) {
          console.warn(
            "Unable to load household permissions:",
            membershipError.message
          );

          /*
           * Fail safely. If permissions cannot
           * be verified, the user is read-only.
           */
          setRole("viewer");
          setHouseholdId(null);
          return;
        }

        setRole(
          normalizeRole(
            membershipData?.role
          )
        );

        setHouseholdId(
          membershipData?.household_id ??
            null
        );
      } catch (caughtError) {
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load permissions.";

        console.error(
          "Permission loading error:",
          caughtError
        );

        setError(message);
        setUser(null);
        setRole("viewer");
        setHouseholdId(null);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadPermissions();

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        () => {
          void loadPermissions();
        }
      );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [loadPermissions]);

 const permissions = useMemo(() => {
  const isDemo = !user;

  const isViewer =
    role === "viewer";

  const isMember =
    role === "member";

  const isAdmin =
    role === "admin";

  return {
    isDemo,
    isViewer,
    isMember,
    isAdmin,

    canView: true,

    canCreate:
      !isDemo &&
      (isMember || isAdmin),

    canEdit:
      !isDemo &&
      (isMember || isAdmin),

    canDelete:
      !isDemo &&
      isAdmin,

    canUpload:
      !isDemo &&
      (isMember || isAdmin),

    canComplete:
      !isDemo &&
      (isMember || isAdmin),

    canManageHousehold:
      !isDemo &&
      isAdmin,

    canManageMembers:
      !isDemo &&
      isAdmin,
  };
}, [role, user]);

  return {
    user,
    role,
    householdId,
    loading,
    error,

    ...permissions,

    refreshPermissions:
      loadPermissions,
  };
}