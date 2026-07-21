"use client";

import { usePermissions } from "@/hooks/usePermissions";

export type { HouseholdRole } from "@/hooks/usePermissions";

export function useHouseholdRole() {
  const {
    loading,
    role,
    householdId,
    isViewer,
    canCreate,
    canEdit,
    canDelete,
    canInvite,
  } = usePermissions();

  return {
    loading,
    role,
    householdId,
    isViewer,
    canAdd: canCreate,
    canEdit,
    canDelete,
    canInvite,
  };
}
