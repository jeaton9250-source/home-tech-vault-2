import type { ComponentType } from "react";

export type NotificationPriority =
  | "critical"
  | "high"
  | "normal"
  | "low";

export type NotificationCategory =
  | "warranty"
  | "maintenance"
  | "software"
  | "subscription"
  | "network"
  | "device"
  | "family"
  | "household"
  | "backup"
  | "security"
  | "insight";

/** Legacy visual tone used by existing UI components. */
export type NotificationTone =
  | "warning"
  | "info"
  | "success"
  | "insight";

export type VaultNotification = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  priority: NotificationPriority;
  category: NotificationCategory;
  type: NotificationTone;
  href: string;
  actionLabel?: string;
  dismissible: boolean;
  icon: ComponentType<{
    size?: number;
    className?: string;
  }>;
};

export type NotificationGeneratorContext = {
  userId: string;
  householdId: string | null;
  householdOwnerId: string | null;
  now: Date;
};

export type NotificationGenerator = (
  context: NotificationGeneratorContext
) => Promise<VaultNotification[]>;

export type NotificationEngineOptions = {
  userId: string;
  householdId: string | null;
  householdOwnerId?: string | null;
  dismissedIds?: Set<string>;
};

export type NotificationEngineResult = {
  notifications: VaultNotification[];
  generatedAt: string;
};
