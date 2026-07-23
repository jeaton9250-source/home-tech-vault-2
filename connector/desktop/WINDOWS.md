# Windows Connector Support

Home Tech Vault Connector is a **single cross-platform Tauri 2 application** shared between macOS and Windows.

## Architecture

```
connector/desktop/
├── src/                     Shared React UI, API client, schedulers
│   ├── main.tsx
│   └── lib/
│       ├── api.ts           Pairing, heartbeat, sync via Rust commands
│       ├── heartbeatScheduler.ts
│       ├── monitoringScheduler.ts
│       ├── updates.ts
│       ├── autostart.ts
│       └── platform.ts
└── src-tauri/src/
    ├── lib.rs               Commands, credential storage, tray, autostart
    ├── http.rs              HTTPS client + platform metadata
    ├── tray.rs              System tray + close-to-tray behavior
    └── scan/
        ├── common.rs        Shared ARP types, private IP checks, dedupe
        ├── macos.rs         macOS ARP parsing
        ├── windows.rs       Windows ARP + neighbor fallback
        ├── fingerprint.rs   Shared fingerprint rules
        └── oui.rs           Shared OUI lookup
```

Platform selection uses `cfg(target_os = "...")` in Rust and browser hints in the website UI.

## Windows discovery

Primary path:

- `arp -a` output parsing for Windows neighbor table format

Fallback path:

- `Get-NetNeighbor` via PowerShell only when ARP output is empty

Not implemented:

- Packet capture
- Aggressive port scanning
- Public internet scanning
- PowerShell-only discovery

## Credential storage

- macOS: Keychain via `keyring` + `apple-native`
- Windows: Credential Manager via `keyring` + `windows-native`

Tokens are never stored in localStorage, plaintext files, or exposed to the webview.

## Installers

Tauri bundle targets:

- macOS: `.app`, `.dmg`
- Windows: NSIS `.exe`, optional `.msi`

Expected Windows artifact naming follows Tauri defaults, e.g.:

- `Home Tech Vault Connector_0.1.0_x64-setup.exe`

## Private testing only

Unsigned Windows builds produced by CI are labeled **Private testing only** in the release manifest. Do not distribute them as trusted public production releases until code signing is configured.

## Manual validation still required

Validate on Windows 11 or a Windows VM:

1. Install connector
2. Pair with one-time code
3. Confirm Credential Manager stores token
4. Restart app and confirm pairing persists
5. Send heartbeat
6. Run manual scan
7. Confirm discovery sync in Home Tech Vault
8. Enable monitoring and verify tray/minimize behavior
9. Pause/resume monitoring
10. Disconnect and confirm credential cleared
11. Revoke from website and confirm sync rejected
12. Uninstall successfully

## Environment variables

Website:

- `NEXT_PUBLIC_CONNECTOR_MACOS_DOWNLOAD_URL`
- `NEXT_PUBLIC_CONNECTOR_WINDOWS_DOWNLOAD_URL`

Desktop build:

- `VITE_HTV_API_BASE_URL=https://www.hometechvault.com`

Future signing secrets (not configured yet):

- `WINDOWS_CERTIFICATE`
- `WINDOWS_CERTIFICATE_PASSWORD`
- Azure Artifact Signing credentials

See `connector/desktop/CODE_SIGNING.md`.
