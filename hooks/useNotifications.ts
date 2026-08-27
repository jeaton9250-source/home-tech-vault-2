"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/lib/supabase";

import {
  demoNotifications,
  generateNotifications,
  getDismissedStorageKey,
  getReadStorageKey,
  loadIdSet,
  saveIdSet,
  type VaultNotification,
} from "@/lib/notifications";

export type {
  NotificationCategory,
  NotificationPriority,
  NotificationTone,
  VaultNotification,
} from "@/lib/notifications";

/** @deprecated Use NotificationTone instead. */
export type NotificationType =
  VaultNotification["type"];

export function useNotifications() {
  const {
    user,
    isDemo,
    householdId,
    householdOwnerId,
    loading: permissionsLoading,
  } = usePermissions();

  const [notifications, setNotifications] =
    useState<VaultNotification[]>([]);

  const [readIds, setReadIds] = useState<
    Set<string>
  >(new Set());

  const [dismissedIds, setDismissedIds] =
    useState<Set<string>>(new Set());

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const localReadIds = loadIdSet(
      getReadStorageKey(user?.id)
    );

    const localDismissedIds = loadIdSet(
      getDismissedStorageKey(user?.id)
    );

    setReadIds(localReadIds);
    setDismissedIds(localDismissedIds);

    if (!user) {
      return;
    }

    const userId = user.id;

    async function loadRemoteNotificationState() {
      const { data, error } = await supabase
        .from("notification_user_state")
        .select(
          "notification_id, read_at, dismissed_at"
        )
        .eq("user_id", userId);

      if (error) {
        console.warn(
          "Unable to load synced notification state:",
          error
        );
        return;
      }

      const remoteReadIds = new Set<string>(
        localReadIds
      );

      const remoteDismissedIds = new Set<string>(
        localDismissedIds
      );

      for (const row of data ?? []) {
        if (row.read_at) {
          remoteReadIds.add(
            row.notification_id
          );
        }

        if (row.dismissed_at) {
          remoteDismissedIds.add(
            row.notification_id
          );
        }
      }

      setReadIds(remoteReadIds);
      setDismissedIds(
        remoteDismissedIds
      );

      saveIdSet(
        getReadStorageKey(userId),
        remoteReadIds
      );

      saveIdSet(
        getDismissedStorageKey(userId),
        remoteDismissedIds
      );
    }

    void loadRemoteNotificationState();
  }, [user?.id]);

  useEffect(() => {
    async function loadNotifications() {
      if (permissionsLoading) {
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        if (isDemo || !user) {
          setNotifications(
            demoNotifications.filter(
              (notification) =>
                !dismissedIds.has(
                  notification.id
                )
            )
          );

          return;
        }

        const result =
          await generateNotifications({
            userId: user.id,
            householdId,
            householdOwnerId,
            dismissedIds,
          });

        setNotifications(
          result.notifications
        );
      } catch (error) {
        console.error(
          "Unable to load notifications:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load notifications."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadNotifications();
  }, [
    user,
    isDemo,
    householdId,
    householdOwnerId,
    permissionsLoading,
    dismissedIds,
  ]);

  const unreadNotifications = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          !readIds.has(notification.id)
      ),
    [notifications, readIds]
  );

  const unreadCount =
    unreadNotifications.length;

  const saveReadIds = useCallback(
    (nextIds: Set<string>) => {
      setReadIds(nextIds);

      saveIdSet(
        getReadStorageKey(user?.id),
        nextIds
      );
    },
    [user?.id]
  );

  const saveDismissedIds = useCallback(
    (nextIds: Set<string>) => {
      setDismissedIds(nextIds);

      saveIdSet(
        getDismissedStorageKey(user?.id),
        nextIds
      );
    },
    [user?.id]
  );

  const markAsRead = useCallback(
    (notificationId: string) => {
      const nextIds = new Set(readIds);
      nextIds.add(notificationId);
      saveReadIds(nextIds);
    },
    [readIds, saveReadIds]
  );

  const markAllAsRead = useCallback(() => {
    const ids = notifications.map(
      (notification) =>
        notification.id
    );

    saveReadIds(
      new Set(ids)
    );

    if (!user || ids.length === 0) {
      return;
    }

    const now =
      new Date().toISOString();

    void supabase
      .from("notification_user_state")
      .upsert(
        ids.map((notificationId) => ({
          user_id: user.id,
          notification_id: notificationId,
          read_at: now,
          updated_at: now,
        })),
        {
          onConflict:
            "user_id,notification_id",
        }
      )
      .then(({ error }) => {
        if (error) {
          console.warn(
            "Unable to sync mark-all-as-read state:",
            error
          );
        }
      });
  }, [
    notifications,
    saveReadIds,
    user,
  ]);

  const dismissNotification = useCallback(
    (notificationId: string) => {
      const nextDismissed = new Set(
        dismissedIds
      );

      nextDismissed.add(notificationId);
      saveDismissedIds(nextDismissed);

      markAsRead(notificationId);

      setNotifications((current) =>
        current.filter(
          (notification) =>
            notification.id !==
            notificationId
        )
      );
    },
    [
      dismissedIds,
      saveDismissedIds,
      markAsRead,
    ]
  );

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    readIds,
    dismissedIds,
    loading:
      permissionsLoading || loading,
    errorMessage,
    markAsRead,
    markAllAsRead,
    dismissNotification,
  };
}

export type NotificationsState = ReturnType<typeof useNotifications>;
