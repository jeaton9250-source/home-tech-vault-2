# Home Tech Vault Connector (macOS)

Phase 2A desktop connector for pairing, secure token storage, and heartbeat only.

## Stack

- Tauri 2
- React + TypeScript (Vite)
- Rust backend (`reqwest` for API calls)
- macOS Keychain via the Rust [`keyring`](https://github.com/hwchen/keyring-rs) crate with the `apple-native` feature

## Token storage threat model

- **Connector token** is stored only in the macOS Keychain through Rust commands (`save_connector_token`, `load_connector_token`, `delete_connector_token`).
- Service name: `com.hometechvault.connector`
- Account name: `connector-token`
- Non-sensitive metadata (`connectorId`, `householdId`, `connectorName`, `lastHeartbeatAt`) is stored in the app config directory as JSON.
- The frontend never writes tokens to `localStorage`, logs, or React state beyond transient in-memory use during pairing.
- If Keychain access fails, the app surfaces an error and does **not** fall back to plaintext storage.

## Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Purpose |
|----------|---------|
| `VITE_HTV_API_BASE_URL` | API origin (`http://localhost:3003` dev, `https://hometechvault.com` prod) |

Production builds require HTTPS for the configured API base URL.

## Development

```bash
npm install
npm run tauri dev
```

Set `VITE_HTV_API_BASE_URL=http://localhost:3003` if your local Next.js dev server uses port 3003.

## Heartbeat behavior (Phase 2A)

- Sends a heartbeat on app launch when paired
- Sends a heartbeat every **5 minutes** while the app is running
- Retries temporary network/server failures with restrained exponential backoff
- Stops retrying after revocation (`401`)
- Manual **Send Test Heartbeat** remains available for troubleshooting

## Tests

```bash
npm run typecheck
npm test
```

From the repo root:

```bash
npm run test:connector
```

## Build (unsigned local test builds)

```bash
npm run tauri build
```

### Build output

Unsigned macOS artifacts are written to:

```text
connector/desktop/src-tauri/target/release/bundle/macos/Home Tech Vault Connector.app
connector/desktop/src-tauri/target/release/bundle/dmg/Home Tech Vault Connector_0.1.0_aarch64.dmg
```

Exact filenames may vary by CPU architecture.

- **App name:** Home Tech Vault Connector
- **Version:** `0.1.0` (see `src/lib/config.ts` and `lib/connector/constants.ts`)
- **Signing:** not performed in Phase 2A unless Apple credentials are configured separately
- **Notarization:** not performed in Phase 2A

Unsigned builds are for controlled testing only. macOS Gatekeeper may block them until signing/notarization is added in a later release phase.

## Publishing the download link

Host the `.dmg` from a stable HTTPS URL (for example a GitHub Release asset), then set in the main app environment:

```bash
NEXT_PUBLIC_CONNECTOR_MACOS_DOWNLOAD_URL=https://example.com/path/Home-Tech-Vault-Connector.dmg
```

The website `/network/connect` page shows **Download for macOS** only when this variable is set.

## Manual test flow

1. Generate a pairing code at `/network/connect`
2. Launch the connector app
3. Enter the code and connector name
4. Confirm Connected state and first heartbeat
5. Leave the app open for 5+ minutes and confirm automatic heartbeat updates last seen on the website
6. Restart the app and confirm launch heartbeat + Keychain persistence
7. Revoke from the website and confirm the next heartbeat fails with unauthorized
8. Disconnect locally and confirm Keychain token removal

## Out of scope (Phase 2B)

- LAN scanning and device discovery
- Windows/Linux builds
- Auto-updater
- Code signing and notarization (unless credentials are added later)
