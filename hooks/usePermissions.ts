"use client";

import { useMemo } from "react";

import { useDemoMode } from "@/hooks/useDemoMode";

export type UserRole =
  | "viewer"
  | "member"
  | "admin";

export function usePermissions() {
  const {
    user,
    isDemo,
    loading,
  } = useDemoMode();

  

  const role = useMemo<UserRole>(() => {
    if (isDemo || !user) {
      return "viewer";
    }

    const metadataRole = String(
      user.app_metadata?.role ??
        user.user_metadata?.role ??
        "viewer"
    )
      .trim()
      .toLowerCase();

    if (metadataRole === "admin") {
      return "admin";
    }

    if (metadataRole === "viewer") {
      return "viewer";
    }

    return "member";
  }, [
    user,
    isDemo,
  ]);

  const isViewer =
    role === "viewer";

  const isMember =
    role === "member";

  const isAdmin =
    role === "admin";

  const canView = true;

  const canCreate =
    isMember || isAdmin;

  const canEdit =
    isMember || isAdmin;

  const canUpload =
    isMember || isAdmin;

  const canCompleteTasks =
    isMember || isAdmin;

  const canDelete =
    isAdmin;

  const canManageHousehold =
    isAdmin;

  const canManageMembers =
    isAdmin;

  const canChangeRoles =
    isAdmin;

  const protectedHref = (
    allowedHref: string
  ) => {
    return canEdit
      ? allowedHref
      : "/signup";
  };

  return {
    user,
    role,
    loading,
    isDemo,

    isViewer,
    isMember,
    isAdmin,

    canView,
    canCreate,
    canEdit,
    canUpload,
    canCompleteTasks,
    canDelete,
    canManageHousehold,
    canManageMembers,
    canChangeRoles,

    protectedHref,
  };
}