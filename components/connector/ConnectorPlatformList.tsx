"use client";

import { Monitor, Smartphone } from "lucide-react";

import Button from "@/components/ui/Button";
import { getConnectorPlatforms } from "@/lib/connector/platforms";

export default function ConnectorPlatformList() {
  const platforms = getConnectorPlatforms();

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {platforms.map((platform) => {
        const isAvailable = platform.availability === "available";
        const isComingSoon =
          platform.availability === "coming_soon";

        return (
          <div
            key={platform.id}
            className="rounded-[24px] border border-border-subtle bg-surface-sunken p-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border-subtle bg-surface-card text-charcoal">
                {platform.id === "macos" ? (
                  <Monitor size={18} />
                ) : (
                  <Smartphone size={18} />
                )}
              </div>

              <div>
                <p className="font-semibold text-text-primary">
                  {platform.label}
                </p>
                <p className="text-xs text-text-tertiary">
                  {isComingSoon
                    ? "Coming Soon"
                    : isAvailable
                      ? `v${platform.version}`
                      : "Unavailable"}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-text-secondary">
              {platform.description}
            </p>

            {isAvailable && platform.downloadUrl ? (
              <div className="mt-4">
                <Button
                  href={platform.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                  fullWidth
                >
                  Download for {platform.label}
                </Button>
              </div>
            ) : isComingSoon ? (
              <p className="mt-4 text-sm font-medium text-text-tertiary">
                Coming Soon
              </p>
            ) : (
              <p className="mt-4 text-sm font-medium text-text-tertiary">
                Download coming soon.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
