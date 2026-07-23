"use client";

import { Download } from "lucide-react";

import Button from "@/components/ui/Button";
import {
  getConnectorDownloadUnavailableMessage,
  getConnectorMacosDownloadUrl,
} from "@/lib/connector/release";
import { getPrimaryConnectorPlatform } from "@/lib/connector/platforms";

type ConnectorDownloadButtonProps = {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
};

export default function ConnectorDownloadButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: ConnectorDownloadButtonProps) {
  const downloadUrl = getConnectorMacosDownloadUrl();
  const platform = getPrimaryConnectorPlatform();

  if (!downloadUrl) {
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
          Download for macOS
        </Button>
        <p className="mt-2 text-sm text-text-secondary">
          {getConnectorDownloadUnavailableMessage()}
        </p>
      </div>
    );
  }

  return (
    <Button
      href={downloadUrl}
      target="_blank"
      rel="noopener noreferrer"
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      className={className}
    >
      <Download size={16} />
      Download for {platform.label}
    </Button>
  );
}
