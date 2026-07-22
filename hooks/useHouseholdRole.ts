"use client";

import { usePermissions } from "@/hooks/usePermissions";

export type { HouseholdRole } from "@/hooks/usePermissions";

export function useHouseholdRole() {
  const {
    loading,
    permissionsReady,
    role,
    householdId,
    isViewer,
    isMember,
    isAdmin,
    canCreate,
    canEdit,
    canDelete,
    canUpload,
    canComplete,
    canCompleteMaintenance,
    canDeleteContent,
    canInvite,
    canManageHousehold,
    canManageMembers,
  } = usePermissions();

  return {
    loading,
    permissionsReady,
    role,
    householdId,
    isViewer,
    isMember,
    isAdmin,
    canAdd: canCreate,
    canCreate,
    canEdit,
    canDelete,
    canUpload,
    canComplete,
    canCompleteMaintenance,
    canDeleteContent,
    canInvite,
    canManageHousehold,
    canManageMembers,
  };
}
