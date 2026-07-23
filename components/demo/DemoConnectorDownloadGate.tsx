"use client";

import { Download } from "lucide-react";

import Button from "@/components/ui/Button";
import { useDemoReadOnlyAction } from "@/components/demo/DemoExperienceProvider";

type DemoConnectorDownloadGateProps = {
  className?: string;
};

export default function DemoConnectorDownloadGate({
  className,
}: DemoConnectorDownloadGateProps) {
  const showReadOnlyModal = useDemoReadOnlyAction();

  return (
    <div className={className}>
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          showReadOnlyModal();
        }}
      >
        <Download size={16} />
        Smart Connector available after signup
      </Button>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        Create your free vault to download the connector and scan your own home
        network.
      </p>
    </div>
  );
}
