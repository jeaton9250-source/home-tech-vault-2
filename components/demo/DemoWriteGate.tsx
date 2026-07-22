"use client";

import { useEffect } from "react";

import { ArrowLeft } from "lucide-react";

import { useDemoReadOnlyAction } from "@/components/demo/DemoExperienceProvider";
import Button from "@/components/ui/Button";
import PageCard from "@/components/ui/PageCard";
import PageShell from "@/components/ui/PageShell";

type DemoWriteGateProps = {
  backHref: string;
  backLabel?: string;
};

export default function DemoWriteGate({
  backHref,
  backLabel = "Continue Exploring",
}: DemoWriteGateProps) {
  const showReadOnlyModal = useDemoReadOnlyAction();

  useEffect(() => {
    showReadOnlyModal();
  }, [showReadOnlyModal]);

  return (
    <PageShell>
      <PageCard className="flex min-h-64 flex-col items-center justify-center py-14 text-center">
        <Button href={backHref} variant="secondary">
          <ArrowLeft size={16} />
          {backLabel}
        </Button>
      </PageCard>
    </PageShell>
  );
}
