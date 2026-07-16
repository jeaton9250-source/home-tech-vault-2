import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function createPdf(title: string) {
  const pdf = new jsPDF();

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text("Home Tech Vault", 20, 22);

  pdf.setFontSize(14);
  pdf.text(title, 20, 34);

  pdf.setDrawColor(200);
  pdf.line(20, 40, 190, 40);

  return {
    pdf,
    autoTable,
  };
}