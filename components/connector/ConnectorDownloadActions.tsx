"use client";

import { Download } from "lucide-react";

import Button from "@/components/ui/Button";
import { cn } from "@/lib/design-system/cn";
import {
  detectBrowserPlatformHint,
  getConnectorDownloadOptions,
} from "@/lib/connector/downloadOptions";

type ConnectorDownloadActionsProps = {
  layout?: "row" | "stack";
  className?: string;
};

export default function ConnectorDownloadActions({
  layout = "row",
  className,
}: ConnectorDownloadActionsProps) {
  const browserPlatform = detectBrowserPlatformHint();
  const downloads = getConnectorDownloadOptions();

  const orderedPlatforms =
    browserPlatform === "windows"
      ? (["windows", "macos"] as const)
      : (["macos", "windows"] as const);

  return (
    <div
      className={cn(
        layout === "row"
          ? "flex flex-wrap gap-3"
          : "flex flex-col gap-3",
        className
      )}
    >
      {orderedPlatforms.map((platformId) => {
        const option = downloads[platformId];
        const highlighted = browserPlatform === platformId;

        if (!option.downloadUrl) {
          return (
            <div
              key={platformId}
              className={cn(
                "rounded-[20px] border border-border-subtle bg-surface-sunken p-4",
                highlighted && "ring-2 ring-charcoal/10"
              )}
            >
              <Button type="button" variant="secondary" disabled>
                <Download size={16} />
                Download for {option.label}
              </Button>
              <p className="mt-2 text-sm text-text-secondary">
                {option.unavailableMessage}
              </p>
            </div>
          );
        }

        return (
          <Button
            key={platformId}
            href={option.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant={highlighted ? "primary" : "secondary"}
            className={highlighted ? undefined : "shrink-0"}
          >
            <Download size={16} />
            Download for {option.label}
          </Button>
        );
      })}
    </div>
  );
}
