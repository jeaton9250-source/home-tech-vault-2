"use client";

import { Download } from "lucide-react";

import Button from "@/components/ui/Button";
import { cn } from "@/lib/design-system/cn";
import {
  detectBrowserPlatformHint,
  orderConnectorDownloadPlatforms,
  type ConnectorDownloadPlatformId,
} from "@/lib/connector/downloadOptions";
import { useConnectorDownloadOptions } from "@/hooks/useConnectorDownloadOptions";

type ConnectorDownloadActionsProps = {
  layout?: "row" | "stack";
  className?: string;
  platformIds?: ConnectorDownloadPlatformId[];
  showVersionLabel?: boolean;
};

export default function ConnectorDownloadActions({
  layout = "row",
  className,
  platformIds,
  showVersionLabel = true,
}: ConnectorDownloadActionsProps) {
  const browserPlatform = detectBrowserPlatformHint();
  const { options, loading } = useConnectorDownloadOptions();

  const orderedPlatforms =
    platformIds ??
    orderConnectorDownloadPlatforms(browserPlatform);

  if (loading || !options) {
    return (
      <div
        className={cn(
          layout === "row"
            ? "flex flex-wrap gap-3"
            : "flex flex-col gap-3",
          className
        )}
      >
        <Button type="button" variant="secondary" disabled>
          <Download size={16} />
          Loading download options...
        </Button>
      </div>
    );
  }

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
        const option = options[platformId];
        const highlighted = browserPlatform === platformId;

        if (!option.available || !option.downloadUrl) {
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
                {option.buttonLabel}
              </Button>
              {showVersionLabel ? (
                <p className="mt-2 text-xs font-medium text-text-tertiary">
                  {option.versionLabel}
                </p>
              ) : null}
              <p className="mt-2 text-sm text-text-secondary">
                {option.unavailableMessage}
              </p>
            </div>
          );
        }

        return (
          <div
            key={platformId}
            className={cn(
              layout === "stack" && "rounded-[20px] border border-border-subtle bg-surface-sunken p-4",
              highlighted && layout === "stack" && "ring-2 ring-charcoal/10"
            )}
          >
            <Button
              href={option.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              variant={highlighted ? "primary" : "secondary"}
              className={highlighted ? undefined : "shrink-0"}
            >
              <Download size={16} />
              {option.buttonLabel}
            </Button>
            {showVersionLabel ? (
              <p
                className={cn(
                  "text-xs font-medium text-text-tertiary",
                  layout === "stack" ? "mt-2" : "mt-1.5"
                )}
              >
                {option.versionLabel}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
