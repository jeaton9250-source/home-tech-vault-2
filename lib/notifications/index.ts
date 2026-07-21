import { demoNotifications } from "@/lib/notifications/demoNotifications";

export type {
  NotificationCategory,
  NotificationEngineOptions,
  NotificationEngineResult,
  NotificationGenerator,
  NotificationGeneratorContext,
  NotificationPriority,
  NotificationTone,
  VaultNotification,
} from "@/lib/notifications/types";

export {
  formatCurrency,
  getDismissedStorageKey,
  getReadStorageKey,
  loadIdSet,
  NOTIFICATIONS_LOCAL_STATE_NOTE,
  priorityRank,
  saveIdSet,
} from "@/lib/notifications/state";

export { generateNotifications } from "@/lib/notifications/notificationEngine";

export {
  notificationGenerators,
} from "@/lib/notifications/generators";

export { demoNotifications };
