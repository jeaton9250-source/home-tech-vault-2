"use client";

import { Download } from "lucide-react";

import Button from "@/components/ui/Button";
import type { AdminExportKind } from "@/lib/admin/controlCenterTypes";

export default function AdminExportMenu({
  kinds,
}: {
  kinds: AdminExportKind[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {kinds.map((kind) => (
        <Button
          key={kind}
          href={`/api/admin/export?kind=${kind}`}
          variant="secondary"
          size="sm"
        >
          <Download size={15} />
          Export {kind}
        </Button>
      ))}
    </div>
  );
}
