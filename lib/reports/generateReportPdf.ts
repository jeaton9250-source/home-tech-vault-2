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
  imageDataUrl?: string;
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
  insurance: "Insurance Readiness Report",
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

  const withSerial = devices.filter((device) =>
    Boolean(device.serialNumber?.trim()),
  ).length;

  const withPhotos = devices.filter((device) =>
    Boolean(device.hasPhoto),
  ).length;

  const withDocuments = devices.filter((device) =>
    Boolean(device.hasDocument),
  ).length;

  const withPurchaseDates = devices.filter((device) =>
    Boolean(device.purchaseDate?.trim()),
  ).length;

  const withRecordedValue = devices.filter(
    (device) => Number(device.purchasePrice || 0) > 0,
  ).length;

  const evidenceItems = devices.length * 5;

  const completedEvidence =
    withSerial +
    withPhotos +
    withDocuments +
    withPurchaseDates +
    withRecordedValue;

  const readinessScore =
    evidenceItems === 0
      ? 0
      : Math.round((completedEvidence / evidenceItems) * 100);

  const normalizedLocation = (device: ReportPdfDevice) => {
    const value = device.location?.trim() || "";

    if (value.toLowerCase() === "network") {
      return "Home Network";
    }

    if (
      !value ||
      value.toLowerCase() === "unassigned" ||
      value.toLowerCase() === "needs a room"
    ) {
      return "Needs a Room";
    }

    return value;
  };

  const roomNames = new Set(
    devices
      .map((device) => normalizedLocation(device))
      .filter((value) => value !== "Home Network" && value !== "Needs a Room"),
  );

  const formatRecordedValue = (device: ReportPdfDevice) => {
    const value = Number(device.purchasePrice || 0);

    return value > 0 ? formatCurrency(value) : "Not recorded";
  };

  /*
   * CLAIM PREP OVERVIEW
   */
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.setTextColor(17, 24, 39);
  pdf.text("Claim-prep overview", 40, startY);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  pdf.setTextColor(90, 97, 105);

  const intro =
    "This report organizes the household technology and supporting information currently saved in Home Tech Vault. Your readiness score reflects five core record types for each device: serial number, photo evidence, supporting record, purchase date, and recorded value.";

  const introLines = pdf.splitTextToSize(intro, 525);

  pdf.text(introLines, 40, startY + 18);

  const metricStartY = startY + 18 + introLines.length * 11 + 15;

  autoTable(pdf, {
    startY: metricStartY,
    theme: "grid",
    head: [["Insurance Readiness", "Recorded"]],
    body: [
      ["Readiness Score", `${readinessScore}%`],
      ["Devices Documented", devices.length.toString()],
      ["Rooms Represented", roomNames.size.toString()],
      [
        "Total Recorded Value",
        totalValue > 0 ? formatCurrency(totalValue) : "Not recorded",
      ],
      ["Photo Evidence", `${withPhotos} of ${devices.length}`],
      ["Supporting Records", `${withDocuments} of ${devices.length}`],
      ["Serial Numbers", `${withSerial} of ${devices.length}`],
    ],
    styles: {
      fontSize: 9,
      cellPadding: 7,
    },
    headStyles: {
      fillColor: [17, 24, 39],
      textColor: [255, 255, 255],
    },
    columnStyles: {
      1: {
        halign: "right",
      },
    },
  });

  /*
   * COMPACT INVENTORY
   */
  const inventoryY = getLastTableY(pdf) + 28;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(17, 24, 39);
  pdf.text("Documented property", 40, inventoryY);

  autoTable(pdf, {
    startY: inventoryY + 10,
    theme: "striped",
    head: [["Device", "Location", "Serial", "Evidence", "Value"]],
    body: devices.map((device) => {
      const identity = [device.brand, device.model].filter(Boolean).join(" ");

      return [
        identity ? `${device.name}\n${identity}` : device.name,
        normalizedLocation(device),
        device.serialNumber || "Missing",
        [
          device.hasPhoto ? "Photo saved" : "No photo",
          device.hasDocument ? "Record saved" : "No record",
        ].join("\n"),
        formatRecordedValue(device),
      ];
    }),
    styles: {
      fontSize: 7.5,
      cellPadding: 5,
      overflow: "linebreak",
      valign: "top",
    },
    headStyles: {
      fillColor: [200, 169, 106],
      textColor: [17, 24, 39],
    },
    columnStyles: {
      0: {
        cellWidth: 145,
      },
      1: {
        cellWidth: 90,
      },
      2: {
        cellWidth: 105,
      },
      3: {
        cellWidth: 82,
      },
      4: {
        cellWidth: 77,
        halign: "right",
      },
    },
    margin: {
      left: 40,
      right: 40,
      bottom: 38,
    },
  });

  /*
   * COMPACT DEVICE CARDS
   */
  pdf.addPage();

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(17, 24, 39);
  pdf.text("Property details", 40, 52);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(100, 105, 112);
  pdf.text("Individual records currently stored in your Vault.", 40, 68);

  let cardY = 90;

  devices.forEach((device, index) => {
    const cardHeight = 178;

    if (cardY + cardHeight > 730) {
      pdf.addPage();
      cardY = 52;
    }

    const identity = [device.brand, device.model].filter(Boolean).join(" ");

    pdf.setFillColor(248, 247, 244);
    pdf.setDrawColor(222, 222, 218);

    pdf.roundedRect(40, cardY, 532, cardHeight, 8, 8, "FD");

    /*
     * Card header.
     */
    pdf.setFillColor(24, 48, 71);

    pdf.roundedRect(40, cardY, 532, 40, 8, 8, "F");

    pdf.rect(40, cardY + 28, 532, 12, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(255, 255, 255);

    const titleLines = pdf.splitTextToSize(device.name, 325);

    pdf.text(titleLines.slice(0, 2), 54, cardY + 18);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(206, 214, 220);

    pdf.text(identity || "Brand / model not recorded", 558, cardY + 20, {
      align: "right",
    });

    /*
     * Two-column details.
     */
    const hasEmbeddedImage = Boolean(device.imageDataUrl);

    const photoX = 56;
    const photoY = cardY + 56;
    const photoWidth = 112;
    const photoHeight = 88;

    const leftX = hasEmbeddedImage ? 188 : 56;

    const rightX = hasEmbeddedImage ? 374 : 314;

    let leftY = cardY + 62;

    let rightY = cardY + 62;

    if (hasEmbeddedImage && device.imageDataUrl) {
      pdf.setFillColor(238, 238, 234);

      pdf.roundedRect(photoX, photoY, photoWidth, photoHeight, 6, 6, "F");

      try {
        const imageProperties = pdf.getImageProperties(device.imageDataUrl);

        const sourceWidth = Number(imageProperties.width || 1);

        const sourceHeight = Number(imageProperties.height || 1);

        const scale = Math.min(
          photoWidth / sourceWidth,
          photoHeight / sourceHeight,
        );

        const renderedWidth = sourceWidth * scale;

        const renderedHeight = sourceHeight * scale;

        const renderedX = photoX + (photoWidth - renderedWidth) / 2;

        const renderedY = photoY + (photoHeight - renderedHeight) / 2;

        pdf.addImage(
          device.imageDataUrl,
          "JPEG",
          renderedX,
          renderedY,
          renderedWidth,
          renderedHeight,
          undefined,
          "FAST",
        );

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(6.5);
        pdf.setTextColor(97, 124, 67);

        pdf.text("PHOTO EVIDENCE", photoX, photoY + photoHeight + 12);
      } catch (error) {
        console.warn(
          "[insurance-report] Unable to render device photo:",
          device.name,
          error,
        );

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(110, 116, 122);

        pdf.text(
          "Photo saved",
          photoX + photoWidth / 2,
          photoY + photoHeight / 2,
          {
            align: "center",
          },
        );
      }
    }

    const drawField = (x: number, y: number, label: string, value: string) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.setTextColor(108, 116, 122);
      pdf.text(label.toUpperCase(), x, y);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(28, 39, 48);
      pdf.text(value, x, y + 13);
    };

    drawField(
      leftX,
      leftY,
      normalizedLocation(device) === "Home Network" ? "Location" : "Room",
      normalizedLocation(device),
    );

    leftY += 38;

    drawField(
      leftX,
      leftY,
      "Serial Number",
      device.serialNumber || "Not recorded",
    );

    leftY += 38;

    drawField(
      leftX,
      leftY,
      "Purchase Date",
      device.purchaseDate ? formatDate(device.purchaseDate) : "Not recorded",
    );

    drawField(rightX, rightY, "Recorded Value", formatRecordedValue(device));

    rightY += 38;

    drawField(
      rightX,
      rightY,
      "Warranty",
      device.warrantyDate
        ? `${formatDate(device.warrantyDate)} · ${getWarrantyStatus(
            device.warrantyDate,
          )}`
        : "Not recorded",
    );

    rightY += 38;

    drawField(
      rightX,
      rightY,
      "Evidence",
      `${device.hasPhoto ? "Photo saved" : "Photo missing"} · ${
        device.hasDocument ? "Record saved" : "Record missing"
      }`,
    );

    /*
     * Progress indicator.
     */
    const completenessFields = [
      Boolean(device.serialNumber?.trim()),
      Boolean(device.purchaseDate?.trim()),
      Number(device.purchasePrice || 0) > 0,
      Boolean(device.hasPhoto),
      Boolean(device.hasDocument),
    ];

    const completed = completenessFields.filter(Boolean).length;

    const itemScore = Math.round((completed / 5) * 100);

    pdf.setDrawColor(228, 228, 224);

    pdf.line(56, cardY + 151, 556, cardY + 151);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.setTextColor(97, 124, 67);

    pdf.text(`${itemScore}% documented`, 56, cardY + 166);

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(120, 125, 130);

    pdf.text(`Item ${index + 1} of ${devices.length}`, 556, cardY + 166, {
      align: "right",
    });

    cardY += cardHeight + 18;
  });

  /*
   * MISSING INFORMATION APPENDIX
   */
  const missingRows = devices
    .map((device) => {
      const missing: string[] = [];

      if (!device.serialNumber?.trim()) {
        missing.push("serial number");
      }

      if (!device.hasPhoto) {
        missing.push("photo evidence");
      }

      if (!device.hasDocument) {
        missing.push("supporting record");
      }

      if (!device.purchaseDate?.trim()) {
        missing.push("purchase date");
      }

      if (Number(device.purchasePrice || 0) <= 0) {
        missing.push("recorded value");
      }

      if (normalizedLocation(device) === "Needs a Room") {
        missing.push("room");
      }

      return {
        name: device.name,
        missing,
      };
    })
    .filter((entry) => entry.missing.length > 0);

  pdf.addPage();

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(17, 24, 39);
  pdf.text("Missing Information", 40, 54);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(100, 105, 112);

  const appendixIntro =
    missingRows.length === 0
      ? "Every documented device currently includes the core information checked by this report."
      : "Adding the information below can strengthen your household records and improve insurance readiness.";

  pdf.text(pdf.splitTextToSize(appendixIntro, 520), 40, 72);

  if (missingRows.length === 0) {
    pdf.setFillColor(238, 244, 232);

    pdf.roundedRect(40, 105, 532, 62, 8, 8, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(82, 107, 57);

    pdf.text("Core records complete", 58, 132);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);

    pdf.text("No missing core fields were identified.", 58, 150);
  } else {
    autoTable(pdf, {
      startY: 105,
      theme: "striped",
      head: [["Device", "Recommended additions"]],
      body: missingRows.map((entry) => [entry.name, entry.missing.join(", ")]),
      styles: {
        fontSize: 8,
        cellPadding: 6,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [200, 169, 106],
        textColor: [17, 24, 39],
      },
      columnStyles: {
        0: {
          cellWidth: 175,
        },
        1: {
          cellWidth: 325,
        },
      },
      margin: {
        left: 40,
        right: 40,
        bottom: 55,
      },
    });
  }

  /*
   * DISCLAIMER
   */
  const disclaimerY = missingRows.length
    ? Math.min(720, getLastTableY(pdf) + 28)
    : 195;

  pdf.setDrawColor(218, 220, 222);

  pdf.line(40, disclaimerY, 572, disclaimerY);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(120, 124, 130);

  const disclaimer =
    "Home Tech Vault organizes information supplied by the account holder. This report is not proof of ownership, valuation, coverage, or claim acceptance. Keep original receipts, photographs, invoices, and other supporting records when available.";

  pdf.text(pdf.splitTextToSize(disclaimer, 525), 40, disclaimerY + 15);
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
