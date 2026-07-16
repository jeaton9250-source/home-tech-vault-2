"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";
import {
  CheckCircle2,
  CircleAlert,
  FileText,
  Laptop,
  Radar,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useDemoMode } from "@/hooks/useDemoMode";

export type NotificationType = "warning" | "info" | "success" | "insight";

export type VaultNotification = {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  href: string;
  icon: ComponentType<{
    size?: number;
    className?: string;
  }>;
};

type DeviceRow = {
  id: string;
  device_name: string | null;
  location: string | null;
  warranty_date: string | null;
  serial_number: string | null;
  purchase_price: number | null;
};

type DocumentRow = {
  device_id: string;
};

type DiscoveryRow = {
  id: string;
  device_name: string | null;
  added_to_vault: boolean | null;
};

const demoNotifications: VaultNotification[] = [
  {
    id: "demo-warranty",
    title: "PlayStation 5 warranty expires soon",
    description:
      "Coverage expires in 28 days. Review the warranty before it ends.",
    type: "warning",
    href: "/warranties",
    icon: ShieldCheck,
  },
  {
    id: "demo-receipt",
    title: "Brother Printer needs a document",
    description:
      "Upload its receipt or purchase record to improve vault coverage.",
    type: "info",
    href: "/devices",
    icon: FileText,
  },
  {
    id: "demo-network",
    title: "Two network devices are ready to review",
    description:
      "Open Network Discovery to identify and add them to your vault.",
    type: "success",
    href: "/network/discover",
    icon: Radar,
  },
  {
    id: "demo-insight",
    title: "Your office contains the most value",
    description:
      "The Home Office contains 62% of the household’s recorded technology value.",
    type: "insight",
    href: "/home",
    icon: Sparkles,
  },
];

function getReadStorageKey(userId?: string) {
  return `home-tech-vault-read-notifications-${userId || "demo"}`;
}

export function useNotifications() {
  const { user, isDemo, loading: demoLoading } = useDemoMode();

  const [notifications, setNotifications] = useState<VaultNotification[]>([]);

  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storageKey = getReadStorageKey(user?.id);

    try {
      const savedValue = window.localStorage.getItem(storageKey);

      const savedIds = savedValue ? (JSON.parse(savedValue) as string[]) : [];

      setReadIds(new Set(savedIds));
    } catch {
      setReadIds(new Set());
    }
  }, [user?.id]);

  useEffect(() => {
    async function loadNotifications() {
      if (demoLoading) {
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        if (isDemo || !user) {
          setNotifications(demoNotifications);
          return;
        }

        const [devicesResult, documentsResult, discoveriesResult] =
          await Promise.all([
            supabase
              .from("devices")
              .select(
                `
                id,
                device_name,
                location,
                warranty_date,
                serial_number,
                purchase_price
              `,
              )
              .eq("user_id", user.id),

            supabase
              .from("device_documents")
              .select("device_id")
              .eq("user_id", user.id),

            supabase
  .from("network_discoveries")
  .select(
    `
    id,
    device_name,
    added_to_vault
  `,
  )
  .eq("user_id", user.id)
  .eq("added_to_vault", false)
  .limit(10),
          ]);

        if (devicesResult.error) {
          throw devicesResult.error;
        }

        if (documentsResult.error) {
          console.error(
            "Unable to load notification documents:",
            documentsResult.error,
          );
        }

        if (discoveriesResult.error) {
          console.error(
            "Unable to load network notifications:",
            discoveriesResult.error,
          );
        }

        const devices = (devicesResult.data || []) as DeviceRow[];

        const documentRows = (documentsResult.data || []) as DocumentRow[];

        const discoveryRows = (discoveriesResult.data || []) as DiscoveryRow[];

        const documentDeviceIds = new Set(
          documentRows.map((row) => row.device_id),
        );

        const generated: VaultNotification[] = [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const device of devices) {
          const deviceName = device.device_name || "Unnamed Device";

          if (device.warranty_date) {
            const expiration = new Date(`${device.warranty_date}T23:59:59`);

            const daysRemaining = Math.ceil(
              (expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
            );

            if (daysRemaining >= 0 && daysRemaining <= 60) {
              generated.push({
                id: `warranty-${device.id}-${device.warranty_date}`,
                title:
                  daysRemaining === 0
                    ? `${deviceName} warranty expires today`
                    : `${deviceName} warranty expires soon`,
                description:
                  daysRemaining === 0
                    ? "Review its coverage before the warranty ends."
                    : `Coverage expires in ${daysRemaining} day${
                        daysRemaining === 1 ? "" : "s"
                      }.`,
                type: "warning",
                href: `/devices/${device.id}`,
                icon: ShieldCheck,
              });
            }
          }

          if (!device.serial_number?.trim()) {
            generated.push({
              id: `serial-${device.id}`,
              title: `${deviceName} is missing a serial number`,
              description:
                "Add it to prepare this device for warranty and insurance claims.",
              type: "info",
              href: `/devices/${device.id}`,
              icon: Laptop,
            });
          }

          if (!device.purchase_price || Number(device.purchase_price) <= 0) {
            generated.push({
              id: `price-${device.id}`,
              title: `${deviceName} is missing its value`,
              description:
                "Add the purchase price to improve household value totals.",
              type: "info",
              href: `/devices/${device.id}`,
              icon: FileText,
            });
          }

          if (!documentDeviceIds.has(device.id)) {
            generated.push({
              id: `document-${device.id}`,
              title: `${deviceName} needs a document`,
              description:
                "Upload a receipt, manual, or warranty file to improve coverage.",
              type: "info",
              href: `/devices/${device.id}`,
              icon: FileText,
            });
          }
        }

        if (discoveryRows.length > 0) {
          generated.push({
            id: `network-discoveries-${discoveryRows
              .map((row) => row.id)
              .join("-")}`,
            title: `${discoveryRows.length} network device${
              discoveryRows.length === 1 ? " is" : "s are"
            } ready to review`,
            description:
              "Open Network Discovery to identify and add them to your vault.",
            type: "success",
            href: "/network/discover",
            icon: Radar,
          });
        }

        const valueByRoom = new Map<string, number>();

        let totalValue = 0;

        for (const device of devices) {
          const value = Number(device.purchase_price || 0);

          const room = device.location?.trim() || "Unassigned";

          totalValue += value;

          valueByRoom.set(room, (valueByRoom.get(room) || 0) + value);
        }

        const highestValueRoom = Array.from(valueByRoom.entries()).sort(
          (first, second) => second[1] - first[1],
        )[0];

        if (highestValueRoom && totalValue > 0) {
          const [roomName, roomValue] = highestValueRoom;

          const percentage = Math.round((roomValue / totalValue) * 100);

          generated.push({
            id: `insight-room-${roomName}-${roomValue}`,
            title: `${roomName} contains the most technology value`,
            description: `${formatCurrency(
              roomValue,
            )}, or ${percentage}% of your recorded household total.`,
            type: "insight",
            href: `/devices?search=${encodeURIComponent(roomName)}`,
            icon: Sparkles,
          });
        }

        const missingDocumentValue = devices
          .filter((device) => !documentDeviceIds.has(device.id))
          .reduce(
            (total, device) => total + Number(device.purchase_price || 0),
            0,
          );

        if (missingDocumentValue > 0) {
          generated.push({
            id: `insight-undocumented-${missingDocumentValue}`,
            title: "Some recorded value is missing documentation",
            description: `${formatCurrency(
              missingDocumentValue,
            )} in technology does not currently have a saved document.`,
            type: "insight",
            href: "/documents",
            icon: CircleAlert,
          });
        }

        generated.sort((first, second) => {
          const priority: Record<NotificationType, number> = {
            warning: 0,
            info: 1,
            success: 2,
            insight: 3,
          };

          return priority[first.type] - priority[second.type];
        });

        setNotifications(generated);
      } catch (error) {
        console.error("Unable to load notifications:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load notifications.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, [user, isDemo, demoLoading]);

  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !readIds.has(notification.id)),
    [notifications, readIds],
  );

  const unreadCount = unreadNotifications.length;

  const saveReadIds = useCallback(
    (nextIds: Set<string>) => {
      setReadIds(nextIds);

      if (typeof window === "undefined") {
        return;
      }

      window.localStorage.setItem(
        getReadStorageKey(user?.id),
        JSON.stringify(Array.from(nextIds)),
      );
    },
    [user?.id],
  );

  const markAsRead = useCallback(
    (notificationId: string) => {
      const nextIds = new Set(readIds);

      nextIds.add(notificationId);
      saveReadIds(nextIds);
    },
    [readIds, saveReadIds],
  );

  const markAllAsRead = useCallback(() => {
    saveReadIds(new Set(notifications.map((notification) => notification.id)));
  }, [notifications, saveReadIds]);

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    readIds,
    loading: demoLoading || loading,
    errorMessage,
    markAsRead,
    markAllAsRead,
  };
}

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
