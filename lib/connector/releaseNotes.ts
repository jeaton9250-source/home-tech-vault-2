export type ConnectorReleaseNote = {
  version: string;
  date: string;
  title: string;
  highlights: string[];
};

export const CONNECTOR_RELEASE_NOTES: ConnectorReleaseNote[] = [
  {
    version: "0.1.0",
    date: "2026-07-21",
    title: "Connector foundation",
    highlights: [
      "Secure household pairing with one-time codes",
      "Heartbeat presence and connector status",
      "Manual LAN discovery and device sync",
      "Automatic matching and enrichment pipeline",
      "Discovery review with import and ignore flows",
    ],
  },
];

export function getLatestConnectorReleaseNote(): ConnectorReleaseNote {
  return CONNECTOR_RELEASE_NOTES[0];
}

export function hasUnreadConnectorReleaseNotes(
  seenVersion: string | null | undefined,
  latestVersion = CONNECTOR_RELEASE_NOTES[0].version
): boolean {
  if (!seenVersion?.trim()) {
    return true;
  }

  return seenVersion.trim() !== latestVersion;
}
