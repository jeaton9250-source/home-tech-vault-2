"use client";

import ConnectorModal from "@/components/connector/ConnectorModal";
import { CONNECTOR_RELEASE_NOTES } from "@/lib/connector/releaseNotes";

type ReleaseNotesModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function ReleaseNotesModal({
  open,
  onClose,
}: ReleaseNotesModalProps) {
  return (
    <ConnectorModal
      open={open}
      title="What's New"
      description="Recent connector improvements and release highlights."
      onClose={onClose}
      maxWidthClassName="max-w-xl"
    >
      <div className="space-y-4">
        {CONNECTOR_RELEASE_NOTES.map((release) => (
          <div
            key={release.version}
            className="rounded-[24px] border border-border-subtle bg-surface-sunken p-5"
          >
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-lg font-semibold text-text-primary">
                v{release.version}
              </p>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-text-secondary">
                {release.date}
              </span>
            </div>
            <p className="mt-2 font-medium text-text-primary">
              {release.title}
            </p>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-text-secondary">
              {release.highlights.map((highlight) => (
                <li key={highlight}>• {highlight}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </ConnectorModal>
  );
}
