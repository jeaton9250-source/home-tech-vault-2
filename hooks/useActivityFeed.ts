import {
  demoActivityEvents,
} from "@/lib/activity/demoActivity";

import { loadActivityFeed } from "@/lib/activity/loadActivityFeed";

import type {
  ActivityFeedFilters,
  VaultActivityEvent,
} from "@/lib/activity/types";

import { usePermissions } from "@/hooks/usePermissions";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

export function useActivityFeed(
  filters: Omit<
    ActivityFeedFilters,
    "userId" | "householdId"
  > = {}
) {
  const {
    user,
    isDemo,
    householdId,
    householdOwnerId,
    loading: permissionsLoading,
  } = usePermissions();

  const [events, setEvents] = useState<
    VaultActivityEvent[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const reload = useCallback(async () => {
    if (permissionsLoading) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      if (isDemo || !user) {
        const demoEvents = filters.deviceId
          ? demoActivityEvents.filter(
              (event) =>
                event.deviceId ===
                filters.deviceId
            )
          : demoActivityEvents;

        setEvents(
          demoEvents.slice(
            0,
            filters.limit ?? 50
          )
        );

        return;
      }

      const loaded = await loadActivityFeed({
        ...filters,
        userId: user.id,
        householdId,
        householdOwnerId,
      });

      setEvents(loaded);
    } catch (error) {
      console.error(
        "Unable to load activity feed:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load activity."
      );
    } finally {
      setLoading(false);
    }
  }, [
    permissionsLoading,
    isDemo,
    user,
    householdId,
    householdOwnerId,
    filters.deviceId,
    filters.limit,
  ]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    events,
    loading:
      permissionsLoading || loading,
    errorMessage,
    reload,
  };
}
