# Connector Code Signing Readiness

Unsigned connector builds are suitable for **private testing only**.

## Files that must be signed (Windows)

- NSIS setup executable: `Home Tech Vault Connector_<version>_x64-setup.exe`
- Optional MSI installer
- Application binaries inside the bundle

## Files that must be signed (macOS)

- `.app` bundle
- `.dmg` installer

## Where signing should occur

1. GitHub Actions Windows workflow: `.github/workflows/connector-windows-build.yml`
2. Future macOS release workflow (not yet added)

Sign **after** `npm run tauri build` and **before** uploading release artifacts.

## Recommended approaches

1. Azure Artifact Signing
2. Trusted OV code-signing certificate
3. Microsoft Store distribution

## Future GitHub secrets

- `WINDOWS_CERTIFICATE_BASE64`
- `WINDOWS_CERTIFICATE_PASSWORD`
- `AZURE_SIGNING_*`
- `APPLE_CERTIFICATE_BASE64`
- `APPLE_CERTIFICATE_PASSWORD`
- `APPLE_TEAM_ID`

Do not log secret values in CI output.

## Verification

- Publish SHA-256 checksums alongside release assets
- Enable timestamp signing for long-lived trust chains
- Verify installers before attaching to public download URLs

## Release manifest

`/api/connector/releases` exposes:

- version
- platform
- architecture
- installer URL
- checksum (future)
- published time
- `privateTestingOnly: true` until signing is live

Do not remove the private-testing label until signed installers are available through the official download URLs.
