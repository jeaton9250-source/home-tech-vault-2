import type {
  HomeHealthInput,
  HomeHealthRecommendation,
} from "@/lib/home-health/types";
import {
  getDaysRemaining,
  getWarrantyStatus,
} from "@/lib/home-health/warranty";

function findSoonestExpiringDevice(
  devices: HomeHealthInput["devices"]
) {
  let best: {
    device: HomeHealthInput["devices"][number];
    daysRemaining: number;
  } | null = null;

  for (const device of devices) {
    const status = getWarrantyStatus(
      device.warranty_date
    );

    if (status !== "expiring") {
      continue;
    }

    const daysRemaining = getDaysRemaining(
      device.warranty_date
    );

    if (daysRemaining === null) {
      continue;
    }

    if (
      !best ||
      daysRemaining < best.daysRemaining
    ) {
      best = {
        device,
        daysRemaining,
      };
    }
  }

  return best;
}

function findDocumentGapDevice(
  input: HomeHealthInput
) {
  return input.devices.find(
    (device) =>
      !input.deviceIdsWithDocuments.has(
        device.id
      )
  );
}

function hasOverdueMaintenance(
  tasks: HomeHealthInput["maintenanceTasks"]
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return tasks.some((task) => {
    if (task.completed || !task.due_date) {
      return false;
    }

    const due = new Date(
      `${task.due_date}T23:59:59`
    );

    return (
      !Number.isNaN(due.getTime()) &&
      due.getTime() < today.getTime()
    );
  });
}

function findRouterLikeDevice(
  devices: HomeHealthInput["devices"]
) {
  return devices.find((device) => {
    const label =
      `${device.device_name}`.toLowerCase();

    return (
      label.includes("router") ||
      label.includes("modem") ||
      label.includes("gateway")
    );
  });
}

export function getNextBestAction(
  input: HomeHealthInput
): HomeHealthRecommendation | null {
  const candidates: HomeHealthRecommendation[] =
    [];

  if (!input.networkConfigured) {
    candidates.push({
      id: "network",
      title: "Add your Wi-Fi network",
      description:
        "Save router, ISP, and Wi-Fi details so your home network is easy to find.",
      href: "/network/edit",
      estimate: "2 minutes",
      priority: 1,
    });
  }

  if (input.devices.length === 0) {
    candidates.push({
      id: "first-device",
      title: "Add your first device",
      description:
        "Start protecting warranties, receipts, and maintenance in one place.",
      href: "/devices/add",
      estimate: "2 minutes",
      priority: 2,
    });
  }

  const expiring = findSoonestExpiringDevice(
    input.devices
  );

  if (expiring) {
    const name =
      expiring.device.device_name.trim() ||
      "device";

    candidates.push({
      id: "warranty-expiring",
      title: `Protect your ${name} warranty`,
      description: `Coverage expires in ${expiring.daysRemaining} day${
        expiring.daysRemaining === 1
          ? ""
          : "s"
      }. Upload receipts or review warranty details.`,
      href: `/devices/${expiring.device.id}`,
      estimate: "2 minutes",
      priority: 3,
    });
  }

  const missingDocuments =
    input.devices.length > 0 &&
    input.deviceIdsWithDocuments.size <
      input.devices.length;

  if (missingDocuments) {
    const routerDevice =
      findRouterLikeDevice(input.devices);
    const gapDevice =
      findDocumentGapDevice(input);

    if (routerDevice) {
      candidates.push({
        id: "router-receipt",
        title: "Upload your router receipt",
        description:
          "Keep proof of purchase and warranty details with your network equipment.",
        href: `/devices/${routerDevice.id}`,
        estimate: "2 minutes",
        priority: 4,
      });
    } else if (gapDevice) {
      const name =
        gapDevice.device_name.trim() ||
        "device";

      candidates.push({
        id: "missing-documents",
        title: `Upload a receipt for ${name}`,
        description:
          "Attach manuals and receipts so important documents stay with the right device.",
        href: `/devices/${gapDevice.id}`,
        estimate: "2 minutes",
        priority: 4,
      });
    }
  } else if (
    input.documentCount === 0 &&
    input.devices.length > 0
  ) {
    candidates.push({
      id: "upload-document",
      title: "Upload your first document",
      description:
        "Store receipts, manuals, and warranties in your vault.",
      href: "/documents/upload",
      estimate: "2 minutes",
      priority: 4,
    });
  }

  if (
    hasOverdueMaintenance(
      input.maintenanceTasks
    )
  ) {
    candidates.push({
      id: "maintenance-overdue",
      title: "Complete overdue maintenance",
      description:
        "Catch up on scheduled tasks to keep your home technology running smoothly.",
      href: "/maintenance",
      estimate: "5 minutes",
      priority: 5,
    });
  }

  if (input.subscriptionCount === 0) {
    candidates.push({
      id: "subscriptions",
      title: "Add your subscriptions",
      description:
        "Track streaming, software, and service renewals in one calm place.",
      href: "/subscriptions/add",
      estimate: "2 minutes",
      priority: 6,
    });
  }

  if (input.familyMemberCount <= 1) {
    candidates.push({
      id: "invite-family",
      title: "Invite your family",
      description:
        "Share your vault with household members using roles you control.",
      href: "/family",
      estimate: "5 minutes",
      priority: 7,
    });
  }

  candidates.sort(
    (left, right) =>
      left.priority - right.priority
  );

  return candidates[0] ?? null;
}
