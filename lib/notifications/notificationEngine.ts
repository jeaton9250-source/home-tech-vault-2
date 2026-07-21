import { notificationGenerators } from "@/lib/notifications/generators";

import {
  priorityRank,
} from "@/lib/notifications/state";

import { formatSupabaseError } from "@/lib/supabase";

import type {
  NotificationEngineOptions,
  NotificationEngineResult,
  VaultNotification,
} from "@/lib/notifications/types";

export async function generateNotifications(
  options: NotificationEngineOptions
): Promise<NotificationEngineResult> {
  const now = new Date();

  const context = {
    userId: options.userId,
    householdId: options.householdId,
    householdOwnerId:
      options.householdOwnerId ?? null,
    now,
  };

  const batches = await Promise.all(
    notificationGenerators.map(
      (generator, index) =>
        generator(context).catch(
          (error) => {
            console.error(
              "Notification generator failed:",
              {
                generatorIndex: index,
                userId: options.userId,
                householdId:
                  options.householdId,
                error: formatSupabaseError(
                  error
                ),
              }
            );

            return [] as VaultNotification[];
          }
        )
    )
  );

  const dismissedIds =
    options.dismissedIds ??
    new Set<string>();

  const seenIds = new Set<string>();

  const merged = batches
    .flat()
    .filter((notification) => {
      if (
        dismissedIds.has(notification.id) ||
        seenIds.has(notification.id)
      ) {
        return false;
      }

      seenIds.add(notification.id);

      return true;
    })
    .sort((first, second) => {
      const priorityDiff =
        priorityRank(first.priority) -
        priorityRank(second.priority);

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return (
        new Date(
          second.timestamp
        ).getTime() -
        new Date(
          first.timestamp
        ).getTime()
      );
    });

  return {
    notifications: merged,
    generatedAt: now.toISOString(),
  };
}
