import type { VaultActivityEvent } from "@/lib/activity/types";

export const demoActivityEvents: VaultActivityEvent[] =
  [
    {
      id: "demo-activity-1",
      activityType: "device.added",
      title: "MacBook Pro added to vault",
      description:
        "Primary work computer saved with AppleCare coverage.",
      occurredAt: "2026-07-18T14:20:00.000Z",
      userId: "demo-user",
      userDisplayName: "Demo Owner",
      householdId: "demo-household",
      deviceId: "demo-macbook",
      entityId: "demo-macbook",
      source: "derived",
    },
    {
      id: "demo-activity-2",
      activityType: "receipt.uploaded",
      title:
        "Receipt uploaded for Living Room Smart TV",
      description:
        "Purchase receipt attached to the device record.",
      occurredAt: "2026-07-17T10:05:00.000Z",
      userId: "demo-user",
      userDisplayName: "Demo Owner",
      householdId: "demo-household",
      deviceId: "demo-tv",
      entityId: "demo-tv-receipt",
      source: "local",
    },
    {
      id: "demo-activity-3",
      activityType:
        "maintenance.completed",
      title: "Router firmware update completed",
      description:
        "Network maintenance task marked complete.",
      occurredAt: "2026-07-16T18:40:00.000Z",
      userId: "demo-user",
      userDisplayName: "Demo Owner",
      householdId: "demo-household",
      deviceId: "demo-router",
      entityId: "demo-maintenance-1",
      source: "derived",
    },
    {
      id: "demo-activity-4",
      activityType:
        "network.scan.completed",
      title: "Network scan completed",
      description:
        "Found 8 devices with 2 new discoveries ready to review.",
      occurredAt: "2026-07-15T09:15:00.000Z",
      userId: "demo-user",
      userDisplayName: "Demo Owner",
      householdId: "demo-household",
      deviceId: null,
      entityId: "demo-scan-1",
      source: "derived",
    },
    {
      id: "demo-activity-5",
      activityType:
        "family.member.invited",
      title: "alex@example.com invited to household",
      description:
        "Family invitation sent with member access.",
      occurredAt: "2026-07-14T16:00:00.000Z",
      userId: "demo-user",
      userDisplayName: "Demo Owner",
      householdId: "demo-household",
      deviceId: null,
      entityId: "demo-invite-1",
      source: "local",
    },
    {
      id: "demo-activity-6",
      activityType: "room.created",
      title: "Home Office room created",
      description:
        "A new room was created when devices were assigned to Home Office.",
      occurredAt: "2026-07-13T11:30:00.000Z",
      userId: "demo-user",
      userDisplayName: "Demo Owner",
      householdId: "demo-household",
      deviceId: null,
      entityId: "demo-room-office",
      source: "local",
    },
    {
      id: "demo-activity-7",
      activityType: "subscription.added",
      title: "Netflix subscription added",
      description:
        "Streaming subscription recorded in the vault.",
      occurredAt: "2026-07-12T08:00:00.000Z",
      userId: "demo-user",
      userDisplayName: "Demo Owner",
      householdId: "demo-household",
      deviceId: null,
      entityId: "demo-subscription-1",
      source: "local",
    },
    {
      id: "demo-activity-8",
      activityType: "warranty.expiring",
      title:
        "Brother Laser Printer warranty expiring soon",
      description:
        "Coverage ends within the next 30 days.",
      occurredAt: "2026-07-10T12:00:00.000Z",
      userId: "demo-user",
      userDisplayName: "Demo Owner",
      householdId: "demo-household",
      deviceId: "demo-printer",
      entityId: "demo-printer",
      source: "derived",
    },
  ];
