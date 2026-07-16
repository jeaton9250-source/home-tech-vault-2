import { createPdf } from "./basePdf";

export function generateHouseholdReport(data: {
  devices: number;
  value: number;
  warranties: number;
  documents: number;
}) {
  const { pdf, autoTable } =
    createPdf("Household Summary");

  autoTable(pdf, {
    startY: 50,
    head: [["Metric", "Value"]],
    body: [
      ["Devices", data.devices],
      ["Protected Value", `$${data.value.toLocaleString()}`],
      ["Documents", data.documents],
      ["Active Warranties", data.warranties],
    ],
  });

  pdf.save("Household Summary.pdf");
}