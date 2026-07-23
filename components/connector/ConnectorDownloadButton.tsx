"use client";

import { Download } from "lucide-react";

import Button from "@/components/ui/Button";
import { useConnectorDownloadOptions } from "@/hooks/useConnectorDownloadOptions";

type ConnectorDownloadButtonProps = {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
  showVersionLabel?: boolean;
};

export default function ConnectorDownloadButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  showVersionLabel = true,
}: ConnectorDownloadButtonProps) {
  const { options, loading } = useConnectorDownloadOptions();
  const macos = options?.macos;

  if (loading || !macos) {
    return (
      <Button
        type="button"
        variant="secondary"
        size={size}
        fullWidth={fullWidth}
        className={className}
        disabled
      >
        <Download size={16} />
        Download for macOS
      </Button>
    );
  }

  if (!macos.available || !macos.downloadUrl) {
    return (
      <div className={className}>
        <Button
          type="button"
          variant="secondary"
          size={size}
          fullWidth={fullWidth}
          disabled
        >
          <Download size={16} />
          {macos.buttonLabel}
        </Button>
        {showVersionLabel ? (
          <p className="mt-2 text-xs font-medium text-text-tertiary">
            {macos.versionLabel}
          </p>
        ) : null}
        <p className="mt-2 text-sm text-text-secondary">
          {macos.unavailableMessage}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <Button
        href={macos.downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        download
        variant={variant}
        size={size}
        fullWidth={fullWidth}
      >
        <Download size={16} />
        {macos.buttonLabel}
      </Button>
      {showVersionLabel ? (
        <p className="mt-2 text-xs font-medium text-text-tertiary">
          {macos.versionLabel}
        </p>
      ) : null}
    </div>
  );
}
