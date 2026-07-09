"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-blue-950 text-white px-6 py-3 rounded-xl print:hidden"
    >
      Export PDF
    </button>
  );
}