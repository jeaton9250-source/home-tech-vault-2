"use client";

import {
  useEffect,
  type ReactNode,
} from "react";

import {
  AlertTriangle,
  CheckCircle2,
  Download,
  KeyRound,
  Laptop,
  Network,
  Settings,
  ShieldAlert,
  X,
} from "lucide-react";

import Button from "@/components/ui/Button";

export type ConnectorGuidePlatform =
  | "macos"
  | "windows";

type InstallationGuideDialogProps = {
  open: boolean;
  platform: ConnectorGuidePlatform;
  onClose: () => void;
};

const MACOS_QUARANTINE_COMMAND = `xattr -dr com.apple.quarantine "/Applications/Home Tech Vault Connector.app"
open "/Applications/Home Tech Vault Connector.app"`;

export default function InstallationGuideDialog({
  open,
  platform,
  onClose,
}: InstallationGuideDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const isMac = platform === "macos";
  const platformLabel = isMac
    ? "macOS"
    : "Windows";

  async function copyTerminalCommand() {
    try {
      await navigator.clipboard.writeText(
        MACOS_QUARANTINE_COMMAND
      );
    } catch {
      // The command remains visible for manual copying.
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="connector-installation-guide-title"
        aria-describedby="connector-installation-guide-description"
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-border-subtle bg-surface-card shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border-subtle bg-surface-card/95 px-6 py-5 backdrop-blur md:px-8">
          <div>
            <p className="text-overline text-section-network">
              Home Tech Vault Connector
            </p>

            <h2
              id="connector-installation-guide-title"
              className="mt-1 text-2xl font-semibold text-text-primary"
            >
              {platformLabel} installation
              guide
            </h2>

            <p
              id="connector-installation-guide-description"
              className="mt-2 text-sm leading-6 text-text-secondary"
            >
              Follow these steps to download,
              install, pair, and begin syncing
              your home network.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close installation guide"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-subtle text-text-secondary transition hover:bg-surface-sunken hover:text-text-primary"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-7 p-6 md:p-8">
          {isMac ? (
            <MacInstallationGuide
              onCopyTerminalCommand={() => {
                void copyTerminalCommand();
              }}
            />
          ) : (
            <WindowsInstallationGuide />
          )}

          <SharedPairingSteps />

          <section className="rounded-[22px] border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0 text-emerald-700"
              />

              <div>
                <h3 className="font-semibold text-emerald-950">
                  Installation complete
                </h3>

                <p className="mt-2 text-sm leading-6 text-emerald-900">
                  Return to the Network section
                  in Home Tech Vault to review
                  connector status, discoveries,
                  and synced devices.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 flex justify-end border-t border-border-subtle bg-surface-card/95 px-6 py-4 backdrop-blur md:px-8">
          <Button
            type="button"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

function MacInstallationGuide({
  onCopyTerminalCommand,
}: {
  onCopyTerminalCommand: () => void;
}) {
  return (
    <>
      <section className="rounded-[22px] border border-amber-300/60 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <ShieldAlert size={20} />
          </div>

          <div>
            <h3 className="font-semibold text-amber-950">
              macOS Beta — manual approval
              may be required
            </h3>

            <p className="mt-2 text-sm leading-6 text-amber-900">
              This beta build is not yet signed
              and notarized through Apple. macOS
              may block it the first time it is
              opened.
            </p>

            <p className="mt-2 text-sm leading-6 text-amber-900">
              Continue only when the connector
              was downloaded from the official
              Home Tech Vault website.
            </p>
          </div>
        </div>
      </section>

      <GuideStep
        number="1"
        icon={<Download size={19} />}
        title="Download the macOS connector"
      >
        <p>
          Select{" "}
          <strong>
            Download for macOS
          </strong>
          . When the download finishes, open
          the downloaded{" "}
          <strong>.dmg</strong> file.
        </p>
      </GuideStep>

      <GuideStep
        number="2"
        icon={<Laptop size={19} />}
        title="Move the app into Applications"
      >
        <p>
          Drag{" "}
          <strong>
            Home Tech Vault Connector
          </strong>{" "}
          into the{" "}
          <strong>Applications</strong>{" "}
          folder.
        </p>

        <p className="mt-2">
          Eject the installer after the copy
          finishes.
        </p>
      </GuideStep>

      <GuideStep
        number="3"
        icon={<Settings size={19} />}
        title="Open the connector"
      >
        <p>
          Open Finder, select{" "}
          <strong>Applications</strong>, and
          double-click{" "}
          <strong>
            Home Tech Vault Connector
          </strong>
          .
        </p>

        <p className="mt-2">
          If the app opens normally, continue
          to the pairing steps below.
        </p>
      </GuideStep>

      <GuideStep
        number="4"
        icon={<AlertTriangle size={19} />}
        title="Approve the app if macOS blocks it"
      >
        <p>
          Open:
        </p>

        <p className="mt-3 rounded-xl border border-border-subtle bg-surface-sunken px-4 py-3 font-medium text-text-primary">
          System Settings → Privacy &amp;
          Security
        </p>

        <p className="mt-3">
          Scroll to the Security section and
          click{" "}
          <strong>Open Anyway</strong> beside
          Home Tech Vault Connector. Confirm
          by selecting <strong>Open</strong>.
        </p>
      </GuideStep>

      <section className="rounded-[22px] border border-border-subtle bg-surface-sunken p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-card text-text-primary">
            <AlertTriangle size={19} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-text-primary">
              If macOS says the app is damaged
            </h3>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Trusted beta testers can remove
              the macOS quarantine flag using
              Terminal. Move the app into
              Applications before running this
              command.
            </p>

            <pre className="mt-4 overflow-x-auto rounded-xl bg-charcoal p-4 text-xs leading-6 text-white">
              <code>
                {MACOS_QUARANTINE_COMMAND}
              </code>
            </pre>

            <div className="mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={
                  onCopyTerminalCommand
                }
              >
                Copy Terminal command
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function WindowsInstallationGuide() {
  return (
    <>
      <section className="rounded-[22px] border border-amber-300/60 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <ShieldAlert size={20} />
          </div>

          <div>
            <h3 className="font-semibold text-amber-950">
              Windows Beta — SmartScreen may
              require approval
            </h3>

            <p className="mt-2 text-sm leading-6 text-amber-900">
              Windows may display a Microsoft
              Defender SmartScreen warning
              because this beta installer does
              not yet have a widely recognized
              signing reputation.
            </p>

            <p className="mt-2 text-sm leading-6 text-amber-900">
              Continue only when the connector
              was downloaded from the official
              Home Tech Vault website.
            </p>
          </div>
        </div>
      </section>

      <GuideStep
        number="1"
        icon={<Download size={19} />}
        title="Download the Windows connector"
      >
        <p>
          Select{" "}
          <strong>
            Download for Windows
          </strong>
          . Open the downloaded{" "}
          <strong>.exe</strong> installer when
          it finishes.
        </p>
      </GuideStep>

      <GuideStep
        number="2"
        icon={<ShieldAlert size={19} />}
        title="Approve the SmartScreen warning"
      >
        <p>
          If Windows displays{" "}
          <strong>
            Windows protected your PC
          </strong>
          , select <strong>More info</strong>.
        </p>

        <p className="mt-2">
          Confirm the app name is Home Tech
          Vault Connector, then select{" "}
          <strong>Run anyway</strong>.
        </p>
      </GuideStep>

      <GuideStep
        number="3"
        icon={<Laptop size={19} />}
        title="Complete the installer"
      >
        <p>
          Follow the installer prompts and
          allow Home Tech Vault Connector to
          be installed on the computer.
        </p>

        <p className="mt-2">
          Launch the connector after the
          installation completes.
        </p>
      </GuideStep>

      <GuideStep
        number="4"
        icon={<Network size={19} />}
        title="Allow private network access"
      >
        <p>
          Windows Firewall may ask whether Home
          Tech Vault Connector can communicate
          on your network.
        </p>

        <p className="mt-2">
          Enable <strong>Private networks</strong>{" "}
          so the connector can discover devices
          on your home Wi-Fi or Ethernet
          network.
        </p>

        <p className="mt-2">
          Public-network access is not required
          for normal home use.
        </p>
      </GuideStep>
    </>
  );
}

function SharedPairingSteps() {
  return (
    <>
      <GuideStep
        number="5"
        icon={<KeyRound size={19} />}
        title="Generate a pairing code"
      >
        <p>
          On the Home Tech Vault website, go
          to:
        </p>

        <p className="mt-3 rounded-xl border border-border-subtle bg-surface-sunken px-4 py-3 font-medium text-text-primary">
          Network → Connector → Connect Your
          Home Network
        </p>

        <p className="mt-3">
          Generate a new one-time pairing code.
          Pairing codes expire and can only be
          used once.
        </p>
      </GuideStep>

      <GuideStep
        number="6"
        icon={<Network size={19} />}
        title="Pair the connector"
      >
        <p>
          Enter the pairing code in the desktop
          connector, choose a name for the
          computer, and select{" "}
          <strong>Connect</strong>.
        </p>

        <p className="mt-2">
          The connector securely stores its
          connector credential using the
          computer’s protected credential
          storage.
        </p>
      </GuideStep>

      <GuideStep
        number="7"
        icon={<CheckCircle2 size={19} />}
        title="Connect Home Assistant and sync"
      >
        <p>
          Enter the local Home Assistant URL
          and long-lived access token. Test the
          connection, preview the devices, and
          sync them to Home Tech Vault.
        </p>

        <p className="mt-2">
          Leave the connector running when
          automatic heartbeats and monitoring
          should continue.
        </p>
      </GuideStep>
    </>
  );
}

function GuideStep({
  number,
  icon,
  title,
  children,
}: {
  number: string;
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-charcoal text-surface-card">
          {icon}
        </div>

        <div className="mt-2 h-full w-px bg-border-subtle" />
      </div>

      <div className="min-w-0 flex-1 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
          Step {number}
        </p>

        <h3 className="mt-1 text-lg font-semibold text-text-primary">
          {title}
        </h3>

        <div className="mt-2 text-sm leading-7 text-text-secondary">
          {children}
        </div>
      </div>
    </section>
  );
}