"use client";

import { Monitor, Smartphone } from "lucide-react";

import Button from "@/components/ui/Button";
import { useConnectorDownloadOptions } from "@/hooks/useConnectorDownloadOptions";
import { CONNECTOR_DOWNLOAD_UNAVAILABLE_MESSAGE } from "@/lib/connector/release";
import { CONNECTOR_WINDOWS_UNAVAILABLE_MESSAGE } from "@/lib/connector/downloadOptions";

const PLATFORM_DESCRIPTIONS = {
  macos: "Install on a Mac that stays on your home network.",
  windows: "Install on a Windows PC that stays on your home network.",
  linux: "Linux connector support is planned for a future release.",
} as const;

export default function ConnectorPlatformList() {
  const { options, loading } = useConnectorDownloadOptions();

  if (loading || !options) {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="rounded-[24px] border border-border-subtle bg-surface-sunken p-5"
          >
            <p className="text-sm text-text-secondary">Loading platforms...</p>
          </div>
        ))}
      </div>
    );
  }

  const platforms = [
    {
      id: "macos" as const,
      option: options.macos,
      comingSoon: false,
      unavailableMessage: CONNECTOR_DOWNLOAD_UNAVAILABLE_MESSAGE,
    },
    {
      id: "windows" as const,
      option: options.windows,
      comingSoon: !options.windows.available,
      unavailableMessage: CONNECTOR_WINDOWS_UNAVAILABLE_MESSAGE,
    },
    {
      id: "linux" as const,
      option: null,
      comingSoon: true,
      unavailableMessage: "Coming Soon",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {platforms.map((platform) => {
        const isAvailable = platform.option?.available ?? false;

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
                  {platform.option?.label ??
                    (platform.id === "linux"
                      ? "Linux"
                      : platform.id === "windows"
                        ? "Windows"
                        : "macOS")}
                </p>
                <p className="text-xs text-text-tertiary">
                  {platform.comingSoon
                    ? "Coming Soon"
                    : isAvailable
                      ? platform.option?.versionLabel
                      : platform.unavailableMessage}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-text-secondary">
              {PLATFORM_DESCRIPTIONS[platform.id]}
            </p>

            {isAvailable && platform.option?.downloadUrl ? (
              <div className="mt-4">
                <Button
                  href={platform.option.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  size="sm"
                  fullWidth
                >
                  {platform.option.buttonLabel}
                </Button>
              </div>
            ) : (
              <p className="mt-4 text-sm font-medium text-text-tertiary">
                {platform.unavailableMessage}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
