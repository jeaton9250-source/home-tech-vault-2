# Home Tech Vault mobile

The native iOS and Android companion app for Home Tech Vault. It uses the same Supabase project and row-level security policies as the web product. Demo mode is local, read-only, and never queries or displays a signed-in person's household data.

## Run locally

1. Run `npm run setup` to copy only the web app's public Supabase values into the ignored mobile environment file. Never use the service-role key in this app.
2. Run `npm install`.
3. Run `npm run ios` (or `npm run android`).

The first App Store bundle identifier is `com.hometechvault.app`. Change it before creating the App Store Connect record only if that identifier is unavailable.

## Release path

- `npx eas-cli build --platform ios --profile preview` creates a tester build.
- `npx eas-cli build --platform ios --profile production` creates the App Store build.
- `npx eas-cli submit --platform ios --profile production` submits the signed build after the App Store Connect listing is ready.

Store listing, privacy disclosures, screenshots, support URL, and Apple Developer membership are still required before submission.
