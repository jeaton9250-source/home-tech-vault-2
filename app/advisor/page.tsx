"use client";

import AdvisorPageContent from "@/components/advisor/AdvisorPageContent";
import PageShell from "@/components/ui/PageShell";

export default function AdvisorPage() {
  return (
    <PageShell className="!pt-4 md:!pt-5">
      <AdvisorPageContent />
    </PageShell>
  );
}
