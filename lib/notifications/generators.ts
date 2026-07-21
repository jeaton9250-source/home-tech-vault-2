import {
  CircleAlert,
  FileText,
  Laptop,
  Radar,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";

import { supabase, formatSupabaseError } from "@/lib/supabase";

import {
  applyHouseholdScope,
  applyOwnerUserScope,
  resolveHouseholdScope,
} from "@/lib/data/householdScope";

import {
  daysUntil,
  formatCurrency,
} from "@/lib/notifications/state";

import type {
  NotificationGenerator,
  VaultNotification,
} from "@/lib/notifications/types";

type DeviceRow = {
  id: string;
  device_name: string | null;
  location: string | null;
  warranty_date: string | null;
  serial_number: string | null;
  purchase_price: number | null;
  created_at?: string | null;
  online?: boolean | null;
  last_seen_at?: string | null;
};

type DocumentRow = {
  device_id: string;
};

type MaintenanceRow = {
  id: string;
  title: string | null;
  due_date: string | null;
  completed: boolean | null;
  task_type: string | null;
};

type SubscriptionRow = {
  id: string;
  service_name: string | null;
  renewal_date: string | null;
};

type DiscoveryRow = {
  id: string;
  device_name: string | null;
};

async function loadDevices(
  userId: string,
  householdId: string | null
) {
  const scope = resolveHouseholdScope(
    householdId,
    userId
  );

  const result = await applyHouseholdScope(
    supabase.from("devices").select("*"),
    householdId,
    userId
  );

  if (result.error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "[Notifications] loadDevices failed:",
        {
          scope,
          userId,
          householdId,
          error: formatSupabaseError(
            result.error
          ),
        }
      );
    } else {
      console.error(
        "[Notifications] loadDevices failed:",
        formatSupabaseError(result.error)
      );
    }

    return [];
  }

  return (result.data || []) as DeviceRow[];
}

export const generateWarrantyNotifications: NotificationGenerator =
  async ({ userId, householdId, now }) => {
    const devices = await loadDevices(
      userId,
      householdId
    );

    const notifications: VaultNotification[] =
      [];

    for (const device of devices) {
      if (!device.warranty_date) {
        continue;
      }

      const remaining = daysUntil(
        device.warranty_date,
        now
      );

      const deviceName =
        device.device_name ||
        "Unnamed Device";

      const thresholds = [
        90, 30, 7, 0,
      ];

      if (
        !thresholds.includes(
          remaining
        ) &&
        !(remaining > 0 && remaining <= 60)
      ) {
        continue;
      }

      const priority =
        remaining <= 7
          ? "critical"
          : remaining <= 30
            ? "high"
            : "normal";

      notifications.push({
        id: `warranty-${device.id}-${device.warranty_date}-${remaining}`,
        title:
          remaining === 0
            ? `${deviceName} warranty expires today`
            : `${deviceName} warranty expires in ${remaining} days`,
        description:
          remaining === 0
            ? "Review coverage before it ends."
            : `Coverage ends on ${new Date(`${device.warranty_date}T12:00:00`).toLocaleDateString()}.`,
        timestamp: now.toISOString(),
        priority,
        category: "warranty",
        type: "warning",
        href: `/devices/${device.id}`,
        actionLabel: "Review Device",
        dismissible: true,
        icon: ShieldCheck,
      });
    }

    return notifications;
  };

export const generateMaintenanceNotifications: NotificationGenerator =
  async ({ userId, householdId, now }) => {
    const result =
      await applyHouseholdScope(
        supabase
          .from("maintenance_tasks")
          .select(
            "id, title, due_date, completed, task_type"
          )
          .eq("completed", false),
        householdId,
        userId
      );

    if (result.error) {
      console.error(
        "Maintenance notification error:",
        result.error
      );

      return [];
    }

    const tasks =
      (result.data ||
        []) as MaintenanceRow[];

    return tasks
      .filter((task) => task.due_date)
      .map((task) => {
        const remaining = daysUntil(
          task.due_date!,
          now
        );

        const overdue = remaining < 0;

        return {
          id: `maintenance-${task.id}-${task.due_date}`,
          title: overdue
            ? `${task.title || "Maintenance task"} is overdue`
            : `${task.title || "Maintenance task"} due in ${remaining} days`,
          description: overdue
            ? "Complete this maintenance task to keep your vault healthy."
            : "Scheduled maintenance is coming up soon.",
          timestamp: now.toISOString(),
          priority: overdue
            ? "high"
            : remaining <= 7
              ? "high"
              : "normal",
          category: "maintenance",
          type: overdue
            ? "warning"
            : "info",
          href: "/maintenance",
          actionLabel: "View Tasks",
          dismissible: true,
          icon: Wrench,
        } satisfies VaultNotification;
      });
  };

export const generateSoftwareUpdateNotifications: NotificationGenerator =
  async ({ userId, householdId, now }) => {
    const result =
      await applyHouseholdScope(
        supabase
          .from("maintenance_tasks")
          .select(
            "id, title, due_date, completed, task_type"
          )
          .eq("completed", false)
          .ilike(
            "task_type",
            "%software%"
          ),
        householdId,
        userId
      );

    if (result.error) {
      return [];
    }

    return (
      (result.data ||
        []) as MaintenanceRow[]
    ).map((task) => ({
      id: `software-${task.id}`,
      title:
        task.title ||
        "Software update available",
      description:
        "A firmware or software update task is pending.",
      timestamp: now.toISOString(),
      priority: "normal",
      category: "software",
      type: "info",
      href: "/maintenance",
      actionLabel: "Schedule Update",
      dismissible: true,
      icon: Wrench,
    }));
  };

export const generateSubscriptionNotifications: NotificationGenerator =
  async ({ userId, householdId, now }) => {
    const result =
      await applyHouseholdScope(
        supabase
          .from("subscriptions")
          .select(
            "id, service_name, renewal_date"
          ),
        householdId,
        userId
      );

    if (result.error) {
      return [];
    }

    const notifications: VaultNotification[] =
      [];

    for (const subscription of (result.data ||
      []) as SubscriptionRow[]) {
      if (!subscription.renewal_date) {
        continue;
      }

      const remaining = daysUntil(
        subscription.renewal_date,
        now
      );

      if (remaining < 0 || remaining > 30) {
        continue;
      }

      notifications.push({
        id: `subscription-${subscription.id}-${subscription.renewal_date}`,
        title: `${subscription.service_name || "Subscription"} renews in ${remaining} days`,
        description:
          "Review recurring service costs before renewal.",
        timestamp: now.toISOString(),
        priority:
          remaining <= 7 ? "high" : "normal",
        category: "subscription",
        type: "info",
        href: "/subscriptions",
        actionLabel: "Review",
        dismissible: true,
        icon: FileText,
      });
    }

    return notifications;
  };

export const generateNetworkNotifications: NotificationGenerator =
  async ({
    userId,
    householdId,
    householdOwnerId,
    now,
  }) => {
    const [
      devices,
      discoveriesResult,
    ] = await Promise.all([
      loadDevices(userId, householdId),
      applyOwnerUserScope(
        supabase
          .from("network_discoveries")
          .select("id, device_name")
          .eq("added_to_vault", false)
          .limit(10),
        householdId,
        userId,
        householdOwnerId
      ),
    ]);

    const notifications: VaultNotification[] =
      [];

    if (discoveriesResult.error) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          "[Notifications] network discoveries failed:",
          {
            userId,
            householdId,
            error: formatSupabaseError(
              discoveriesResult.error
            ),
          }
        );
      }
    } else {
      const discoveries =
        (discoveriesResult.data ||
          []) as DiscoveryRow[];

      if (discoveries.length > 0) {
        notifications.push({
          id: `network-discoveries-${discoveries.map((row) => row.id).join("-")}`,
          title: `${discoveries.length} network device${
            discoveries.length === 1
              ? ""
              : "s"
          } ready to review`,
          description:
            "Open Network Discovery to identify and add them to your vault.",
          timestamp: now.toISOString(),
          priority: "normal",
          category: "network",
          type: "success",
          href: "/network/discover",
          actionLabel: "Review Scan",
          dismissible: true,
          icon: Radar,
        });
      }
    }

    for (const device of devices) {
      if (device.online === false) {
        notifications.push({
          id: `device-offline-${device.id}`,
          title: `${device.device_name || "Device"} appears offline`,
          description:
            "This device has not been seen on your network recently.",
          timestamp: now.toISOString(),
          priority: "normal",
          category: "network",
          type: "warning",
          href: `/devices/${device.id}`,
          actionLabel: "View Device",
          dismissible: true,
          icon: Radar,
        });
      }
    }

    return notifications;
  };

export const generateDeviceNotifications: NotificationGenerator =
  async ({ userId, householdId, now }) => {
    const devices = await loadDevices(
      userId,
      householdId
    );

    const deviceIds = devices.map(
      (device) => device.id
    );

    const documentsResult =
      deviceIds.length > 0
        ? await supabase
            .from("device_documents")
            .select("device_id")
            .in("device_id", deviceIds)
        : { data: [], error: null };

    const documentDeviceIds = new Set(
      (
        (documentsResult.data ||
          []) as DocumentRow[]
      ).map((row) => row.device_id)
    );

    const notifications: VaultNotification[] =
      [];

    for (const device of devices) {
      const deviceName =
        device.device_name ||
        "Unnamed Device";

      if (
        device.created_at &&
        daysUntil(
          device.created_at.slice(0, 10),
          now
        ) >= -7
      ) {
        notifications.push({
          id: `new-device-${device.id}`,
          title: `${deviceName} was added to your vault`,
          description:
            "Review the device record and attach supporting documents.",
          timestamp:
            device.created_at,
          priority: "low",
          category: "device",
          type: "success",
          href: `/devices/${device.id}`,
          actionLabel: "Open Device",
          dismissible: true,
          icon: Laptop,
        });
      }

      if (!device.serial_number?.trim()) {
        notifications.push({
          id: `serial-${device.id}`,
          title: `${deviceName} is missing a serial number`,
          description:
            "Add it to prepare for warranty and insurance claims.",
          timestamp: now.toISOString(),
          priority: "normal",
          category: "security",
          type: "info",
          href: `/devices/${device.id}`,
          actionLabel: "Add Serial",
          dismissible: true,
          icon: Laptop,
        });
      }

      if (
        !device.purchase_price ||
        Number(device.purchase_price) <= 0
      ) {
        notifications.push({
          id: `price-${device.id}`,
          title: `${deviceName} is missing its value`,
          description:
            "Add the purchase price to improve household totals.",
          timestamp: now.toISOString(),
          priority: "low",
          category: "device",
          type: "info",
          href: `/devices/${device.id}`,
          actionLabel: "Add Value",
          dismissible: true,
          icon: FileText,
        });
      }

      if (
        !documentDeviceIds.has(device.id)
      ) {
        notifications.push({
          id: `document-${device.id}`,
          title: `${deviceName} needs a document`,
          description:
            "Upload a receipt, manual, or warranty file to improve coverage.",
          timestamp: now.toISOString(),
          priority: "normal",
          category: "backup",
          type: "info",
          href: `/devices/${device.id}`,
          actionLabel: "Upload",
          dismissible: true,
          icon: FileText,
        });
      }
    }

    return notifications;
  };

export const generateFamilyNotifications: NotificationGenerator =
  async ({ userId, householdId, now }) => {
    if (!householdId) {
      return [];
    }

    const invitationsResult =
      await supabase
        .from("household_invitations")
        .select("id, email, status, created_at")
        .eq("household_id", householdId)
        .eq("status", "accepted")
        .order("created_at", {
          ascending: false,
        })
        .limit(5);

    if (invitationsResult.error) {
      return [];
    }

    return (
      invitationsResult.data || []
    ).map((invitation) => ({
      id: `family-accepted-${invitation.id}`,
      title: `${invitation.email} joined your household`,
      description:
        "A family invitation was accepted.",
      timestamp:
        invitation.created_at ||
        now.toISOString(),
      priority: "normal",
      category: "family",
      type: "success",
      href: "/family",
      actionLabel: "View Household",
      dismissible: true,
      icon: Users,
    }));
  };

export const generateInsightNotifications: NotificationGenerator =
  async ({ userId, householdId, now }) => {
    const devices = await loadDevices(
      userId,
      householdId
    );

    const valueByRoom = new Map<
      string,
      number
    >();

    let totalValue = 0;

    for (const device of devices) {
      const value = Number(
        device.purchase_price || 0
      );

      const room =
        device.location?.trim() ||
        "Unassigned";

      totalValue += value;

      valueByRoom.set(
        room,
        (valueByRoom.get(room) || 0) +
          value
      );
    }

    const notifications: VaultNotification[] =
      [];

    const highestValueRoom = Array.from(
      valueByRoom.entries()
    ).sort(
      (first, second) =>
        second[1] - first[1]
    )[0];

    if (
      highestValueRoom &&
      totalValue > 0
    ) {
      const [roomName, roomValue] =
        highestValueRoom;

      const percentage = Math.round(
        (roomValue / totalValue) * 100
      );

      notifications.push({
        id: `insight-room-${roomName}-${roomValue}`,
        title: `${roomName} contains the most technology value`,
        description: `${formatCurrency(
          roomValue
        )}, or ${percentage}% of your recorded household total.`,
        timestamp: now.toISOString(),
        priority: "low",
        category: "insight",
        type: "insight",
        href: `/devices?search=${encodeURIComponent(roomName)}`,
        actionLabel: "View Devices",
        dismissible: true,
        icon: Sparkles,
      });
    }

    const undocumentedValue = devices
      .filter(
        (device) =>
          !device.serial_number?.trim()
      )
      .reduce(
        (total, device) =>
          total +
          Number(
            device.purchase_price || 0
          ),
        0
      );

    if (undocumentedValue > 0) {
      notifications.push({
        id: `security-rec-${undocumentedValue}`,
        title:
          "Security recommendation: complete device records",
        description: `${formatCurrency(
          undocumentedValue
        )} in technology is missing serial numbers or supporting records.`,
        timestamp: now.toISOString(),
        priority: "normal",
        category: "security",
        type: "insight",
        href: "/audit",
        actionLabel: "Run Audit",
        dismissible: true,
        icon: CircleAlert,
      });
    }

    return notifications;
  };

export const notificationGenerators: NotificationGenerator[] =
  [
    generateWarrantyNotifications,
    generateMaintenanceNotifications,
    generateSoftwareUpdateNotifications,
    generateSubscriptionNotifications,
    generateNetworkNotifications,
    generateDeviceNotifications,
    generateFamilyNotifications,
    generateInsightNotifications,
  ];
