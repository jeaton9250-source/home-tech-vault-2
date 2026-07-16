import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export type ReportPdfType =
  | "household"
  | "devices"
  | "insurance"
  | "warranties"
  | "network"
  | "maintenance";

export type ReportPdfDevice = {
  name: string;
  brand?: string;
  model?: string;
  location?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  warrantyDate?: string;
  hasPhoto?: boolean;
  hasDocument?: boolean;
};

export type ReportPdfNetwork = {
  isp?: string;
  downloadSpeed?: number;
  uploadSpeed?: number;
  routerModel?: string;
  modemModel?: string;
  wifiName?: string;
  guestNetwork?: string;
};

export type ReportPdfMaintenance = {
  deviceName?: string;
  eventType?: string;
  eventDate?: string;
  title?: string;
  description?: string;
};

type GenerateReportPdfOptions = {
  type: ReportPdfType;
  householdName: string;
  ownerName?: string;
  city?: string;
  devices: ReportPdfDevice[];
  network?: ReportPdfNetwork | null;
  maintenance?: ReportPdfMaintenance[];
};

const reportTitles: Record<ReportPdfType, string> = {
  household: "Household Summary",
  devices: "Device Inventory",
  insurance: "Insurance Inventory",
  warranties: "Warranty Report",
  network: "Network Report",
  maintenance: "Maintenance History",
};

export function generateReportPdf({
  type,
  householdName,
  ownerName = "",
  city = "",
  devices,
  network = null,
  maintenance = [],
}: GenerateReportPdfOptions) {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });

  const title = reportTitles[type];
  const generatedDate = new Date().toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  addHeader(pdf, title, householdName, generatedDate);

  let startY = 145;

  if (ownerName) {
    pdf.setFontSize(10);
    pdf.setTextColor(95, 95, 95);
    pdf.text(`Prepared for: ${ownerName}`, 40, startY);
    startY += 16;
  }

  if (city) {
    pdf.setFontSize(10);
    pdf.setTextColor(95, 95, 95);
    pdf.text(`Location: ${city}`, 40, startY);
    startY += 22;
  }

  if (type === "household") {
    buildHouseholdReport(pdf, devices, startY);
  }

  if (type === "devices") {
    buildDeviceReport(pdf, devices, startY);
  }

  if (type === "insurance") {
    buildInsuranceReport(pdf, devices, startY);
  }

  if (type === "warranties") {
    buildWarrantyReport(pdf, devices, startY);
  }

  if (type === "network") {
    buildNetworkReport(pdf, network, startY);
  }

  if (type === "maintenance") {
    buildMaintenanceReport(pdf, maintenance, startY);
  }

  addPageNumbers(pdf);

  const safeName =
    householdName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "home-tech-vault";

  pdf.save(`${safeName}-${type}-report.pdf`);
}

function addHeader(
  pdf: jsPDF,
  title: string,
  householdName: string,
  generatedDate: string,
) {
  pdf.setFillColor(17, 24, 39);
  pdf.rect(0, 0, 612, 112, "F");

  pdf.setTextColor(200, 169, 106);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("HOME TECH VAULT", 40, 34);

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.text(title, 40, 64);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(210, 214, 220);

  pdf.text(householdName, 40, 87);

  pdf.text(`Generated ${generatedDate}`, 572, 87, {
    align: "right",
  });
}

function buildHouseholdReport(
  pdf: jsPDF,
  devices: ReportPdfDevice[],
  startY: number,
) {
  const totalValue = devices.reduce(
    (sum, device) => sum + Number(device.purchasePrice || 0),
    0,
  );

  const roomNames = new Set(
    devices.map((device) => device.location || "Unassigned"),
  );

  const documentCount = devices.filter((device) => device.hasDocument).length;

  const photoCount = devices.filter((device) => device.hasPhoto).length;

  const activeWarrantyCount = devices.filter((device) =>
    isWarrantyActive(device.warrantyDate),
  ).length;

  autoTable(pdf, {
    startY,
    theme: "grid",
    head: [["Household Metric", "Value"]],
    body: [
      ["Total Devices", devices.length.toString()],
      ["Rooms", roomNames.size.toString()],
      ["Recorded Value", formatCurrency(totalValue)],
      ["Devices With Documents", `${documentCount} of ${devices.length}`],
      ["Devices With Photos", `${photoCount} of ${devices.length}`],
      ["Active Warranties", activeWarrantyCount.toString()],
    ],
    styles: {
      fontSize: 10,
      cellPadding: 8,
    },
    headStyles: {
      fillColor: [17, 24, 39],
      textColor: [255, 255, 255],
    },
  });

  const roomRows = Array.from(roomNames)
    .map((roomName) => {
      const roomDevices = devices.filter(
        (device) => (device.location || "Unassigned") === roomName,
      );

      const roomValue = roomDevices.reduce(
        (sum, device) => sum + Number(device.purchasePrice || 0),
        0,
      );

      return [
        roomName,
        roomDevices.length.toString(),
        formatCurrency(roomValue),
      ];
    })
    .sort((a, b) => a[0].localeCompare(b[0]));

  autoTable(pdf, {
    startY: getLastTableY(pdf) + 24,
    theme: "striped",
    head: [["Room", "Devices", "Recorded Value"]],
    body: roomRows,
    styles: {
      fontSize: 9,
      cellPadding: 7,
    },
    headStyles: {
      fillColor: [200, 169, 106],
      textColor: [17, 24, 39],
    },
  });
}

function buildDeviceReport(
  pdf: jsPDF,
  devices: ReportPdfDevice[],
  startY: number,
) {
  autoTable(pdf, {
    startY,
    theme: "striped",
    head: [["Device", "Brand / Model", "Room", "Serial", "Value"]],
    body: devices.map((device) => [
      device.name,
      [device.brand, device.model].filter(Boolean).join(" ") || "Not provided",
      device.location || "Unassigned",
      device.serialNumber || "Missing",
      formatCurrency(Number(device.purchasePrice || 0)),
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 6,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [17, 24, 39],
    },
    columnStyles: {
      0: { cellWidth: 105 },
      1: { cellWidth: 115 },
      2: { cellWidth: 85 },
      3: { cellWidth: 110 },
      4: {
        cellWidth: 70,
        halign: "right",
      },
    },
  });
}

function buildInsuranceReport(
  pdf: jsPDF,
  devices: ReportPdfDevice[],
  startY: number,
) {
  const totalValue = devices.reduce(
    (sum, device) => sum + Number(device.purchasePrice || 0),
    0,
  );

  const missingSerials = devices.filter(
    (device) => !device.serialNumber,
  ).length;

  const missingDocuments = devices.filter(
    (device) => !device.hasDocument,
  ).length;

  const missingPhotos = devices.filter((device) => !device.hasPhoto).length;

  autoTable(pdf, {
    startY,
    theme: "grid",
    head: [["Insurance Metric", "Value"]],
    body: [
      ["Total Recorded Value", formatCurrency(totalValue)],
      ["Total Devices", devices.length.toString()],
      ["Missing Serial Numbers", missingSerials.toString()],
      ["Missing Documents", missingDocuments.toString()],
      ["Missing Photos", missingPhotos.toString()],
    ],
    styles: {
      fontSize: 10,
      cellPadding: 8,
    },
    headStyles: {
      fillColor: [17, 24, 39],
    },
  });

  autoTable(pdf, {
    startY: getLastTableY(pdf) + 24,
    theme: "striped",
    head: [["Device", "Serial", "Document", "Photo", "Value"]],
    body: devices.map((device) => [
      device.name,
      device.serialNumber || "Missing",
      device.hasDocument ? "Saved" : "Missing",
      device.hasPhoto ? "Saved" : "Missing",
      formatCurrency(Number(device.purchasePrice || 0)),
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 6,
    },
    headStyles: {
      fillColor: [200, 169, 106],
      textColor: [17, 24, 39],
    },
  });
}

function buildWarrantyReport(
  pdf: jsPDF,
  devices: ReportPdfDevice[],
  startY: number,
) {
  const warrantyDevices = devices
    .filter((device) => device.warrantyDate)
    .sort((a, b) => (a.warrantyDate || "").localeCompare(b.warrantyDate || ""));

  if (warrantyDevices.length === 0) {
    pdf.setFontSize(11);
    pdf.setTextColor(90, 90, 90);
    pdf.text("No warranty information has been recorded.", 40, startY);
    return;
  }

  autoTable(pdf, {
    startY,
    theme: "striped",
    head: [["Device", "Room", "Expiration", "Status"]],
    body: warrantyDevices.map((device) => [
      device.name,
      device.location || "Unassigned",
      formatDate(device.warrantyDate),
      getWarrantyStatus(device.warrantyDate),
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 7,
    },
    headStyles: {
      fillColor: [17, 24, 39],
    },
  });
}

function buildNetworkReport(
  pdf: jsPDF,
  network: ReportPdfNetwork | null,
  startY: number,
) {
  if (!network) {
    pdf.setFontSize(11);
    pdf.setTextColor(90, 90, 90);
    pdf.text("No network information has been recorded.", 40, startY);
    return;
  }

  autoTable(pdf, {
    startY,
    theme: "grid",
    head: [["Network Information", "Saved Value"]],
    body: [
      ["Internet Provider", network.isp || "Not provided"],
      [
        "Download Speed",
        network.downloadSpeed
          ? `${network.downloadSpeed} Mbps`
          : "Not provided",
      ],
      [
        "Upload Speed",
        network.uploadSpeed ? `${network.uploadSpeed} Mbps` : "Not provided",
      ],
      ["Router", network.routerModel || "Not provided"],
      ["Modem", network.modemModel || "Not provided"],
      ["Wi-Fi Name", network.wifiName || "Not provided"],
      ["Guest Network", network.guestNetwork || "Not provided"],
    ],
    styles: {
      fontSize: 10,
      cellPadding: 8,
    },
    headStyles: {
      fillColor: [17, 24, 39],
    },
  });
}

function buildMaintenanceReport(
  pdf: jsPDF,
  maintenance: ReportPdfMaintenance[],
  startY: number,
) {
  if (maintenance.length === 0) {
    pdf.setFontSize(11);
    pdf.setTextColor(90, 90, 90);
    pdf.text("No maintenance history has been recorded.", 40, startY);
    return;
  }

  autoTable(pdf, {
    startY,
    theme: "striped",
    head: [["Date", "Device", "Type", "Details"]],
    body: maintenance.map((event) => [
      formatDate(event.eventDate),
      event.deviceName || "Unknown Device",
      event.eventType || "Maintenance",
      event.title || event.description || "No details",
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 6,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [17, 24, 39],
    },
  });
}

function getLastTableY(pdf: jsPDF) {
  const documentWithTable = pdf as jsPDF & {
    lastAutoTable?: {
      finalY?: number;
    };
  };

  return documentWithTable.lastAutoTable?.finalY || 150;
}

function addPageNumbers(pdf: jsPDF) {
  const pageCount = pdf.getNumberOfPages();

  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page);
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);

    pdf.text(`Home Tech Vault • Page ${page} of ${pageCount}`, 306, 770, {
      align: "center",
    });
  }
}

function isWarrantyActive(value?: string) {
  if (!value) {
    return false;
  }

  const expiration = new Date(`${value}T23:59:59`);

  return expiration.getTime() >= Date.now();
}

function getWarrantyStatus(value?: string) {
  if (!value) {
    return "Not recorded";
  }

  const expiration = new Date(`${value}T23:59:59`);

  const daysRemaining = Math.ceil(
    (expiration.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  if (daysRemaining < 0) {
    return "Expired";
  }

  if (daysRemaining === 0) {
    return "Expires today";
  }

  if (daysRemaining <= 60) {
    return `${daysRemaining} days remaining`;
  }

  return "Active";
}

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatDate(value?: string) {
  if (!value) {
    return "Not provided";
  }

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
