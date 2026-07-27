import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildDeviceMaintenanceRecommendations } from "@/lib/devices/maintenanceRecommendations";

describe("device maintenance recommendations", () => {
  it("returns router maintenance tasks for network devices", () => {
    const recommendations = buildDeviceMaintenanceRecommendations(
      {
        id: "device-1",
        device_name: "Wi-Fi Router",
        category: "Network Equipment",
        manufacturer: "Ubiquiti",
        model_number: "UDR",
      },
      []
    );

    assert.ok(
      recommendations.some((item) => /firmware/i.test(item.title))
    );
    assert.ok(
      recommendations.some((item) => /backup/i.test(item.taskType))
    );
  });

  it("skips recommendations that already exist", () => {
    const recommendations = buildDeviceMaintenanceRecommendations(
      {
        id: "device-2",
        device_name: "Wi-Fi Router",
        category: "Network Equipment",
        manufacturer: "Ubiquiti",
        model_number: "UDR",
      },
      [
        {
          title: "Update firmware for Wi-Fi Router",
          task_type: "Software Update",
          description: "Install firmware updates.",
        },
      ]
    );

    assert.ok(
      !recommendations.some((item) => /firmware/i.test(item.title))
    );
  });

  it("returns printer-specific maintenance for printers", () => {
    const recommendations = buildDeviceMaintenanceRecommendations(
      {
        id: "device-3",
        device_name: "Office Printer",
        category: "Printer",
        manufacturer: "Epson",
        model_number: "EcoTank ET-3850",
      },
      []
    );

    assert.ok(
      recommendations.some((item) =>
        /print heads|ink or toner/i.test(item.title)
      )
    );
  });
});
