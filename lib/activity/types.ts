export type VaultActivityType =
  | "device.added"
  | "device.edited"
  | "device.deleted"
  | "document.uploaded"
  | "receipt.uploaded"
  | "warranty.added"
  | "warranty.expiring"
  | "maintenance.scheduled"
  | "maintenance.completed"
  | "subscription.added"
  | "network.scan.completed"
  | "family.member.invited"
  | "family.member.joined"
  | "family.member.removed"
  | "room.created"
  | "room.deleted"
  | "photo.uploaded";

export type VaultActivityEvent = {
  id: string;
  activityType: VaultActivityType;
  title: string;
  description: string | null;
  occurredAt: string;
  userId: string | null;
  userDisplayName: string | null;
  householdId: string | null;
  deviceId: string | null;
  entityId: string | null;
  source: "device_events" | "local" | "derived";
};

export type RecordActivityInput = {
  activityType: VaultActivityType;
  title: string;
  description?: string | null;
  userId: string;
  householdId?: string | null;
  deviceId?: string | null;
  entityId?: string | null;
  userDisplayName?: string | null;
  occurredAt?: string;
};

export type ActivityFeedFilters = {
  deviceId?: string;
  householdId?: string | null;
  householdOwnerId?: string | null;
  userId?: string | null;
  limit?: number;
};
