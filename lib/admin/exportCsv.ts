export function escapeCsvValue(
  value: string | number | null | undefined
) {
  if (value === null || value === undefined) {
    return "";
  }

  const normalized = String(value);

  if (
    normalized.includes(",") ||
    normalized.includes('"') ||
    normalized.includes("\n")
  ) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }

  return normalized;
}

export function buildCsv(
  headers: string[],
  rows: Array<Array<string | number | null | undefined>>
) {
  const lines = [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) =>
      row.map(escapeCsvValue).join(",")
    ),
  ];

  return lines.join("\n");
}

export function csvDownloadResponse(
  filename: string,
  csv: string
) {
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
