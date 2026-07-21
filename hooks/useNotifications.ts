"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { usePermissions } from "@/hooks/usePermissions";

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

    setReadIds(
      loadIdSet(
        getReadStorageKey(user?.id)
      )
    );

    setDismissedIds(
      loadIdSet(
        getDismissedStorageKey(user?.id)
      )
    );
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
    saveReadIds(
      new Set(
        notifications.map(
          (notification) =>
            notification.id
        )
      )
    );
  }, [notifications, saveReadIds]);

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
