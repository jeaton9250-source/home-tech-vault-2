# Home Tech Vault — App Store Connect copy

## Product page

- **Name:** Home Tech Vault
- **Subtitle:** Your home has a memory
- **Primary category:** Lifestyle
- **Secondary category:** Productivity
- **Promotional text:** Give your home one calm, private place for the devices, documents, warranties, and care it should never forget.
- **Keywords:** home,inventory,warranty,manual,receipt,maintenance,appliance,device,document,vault
- **Support URL:** https://www.hometechvault.com/contact
- **Marketing URL:** https://www.hometechvault.com
- **Privacy Policy URL:** https://www.hometechvault.com/privacy

## Description

Your home remembers more than you think. Home Tech Vault keeps its useful history together in one calm, private record.

Save the details that are usually scattered across drawers, inboxes, camera rolls, and old folders:

- Devices and appliances, with serial numbers, purchase details, and photos
- Manuals, receipts, warranties, and whole-home documents
- Maintenance and care reminders
- A shared household record for the people you trust

Scan a product label to start a device record, attach the documents that belong with it, and keep every update in sync with your Home Tech Vault on the web.

Home Tech Vault is private by design. Your records remain connected to your account and invited household members—not advertising profiles.

## Review notes

Home Tech Vault is a companion to the Home Tech Vault web service. The iOS app does not offer purchases or links to purchase. Reviewers can explore a clearly labeled fictional household without signing in by choosing **Explore a demo home** on the welcome screen.

For features that write data—adding or editing a device, uploading or deleting a document, completing maintenance, and push notification registration—use the permanent App Review account supplied in the Sign-In Information section of App Store Connect.

Account deletion is available in **Your account → Delete account**. Type `DELETE` and confirm. Access is disabled immediately, push tokens are disabled, and permanent deletion is queued for completion within seven days.

Camera access is requested only when the reviewer opens the device scanner. Photo-library access is requested only when adding a device image. Notification permission is requested only after the user enables reminders.

## Screenshot set (6.9-inch iPhone)

Use these six screens, in this order:

1. Home — “Everything your home remembers, together.”
2. Devices — “The details you need, right where they belong.”
3. Scan device — “Turn a product label into a lasting record.”
4. Documents — “Manuals, receipts, and warranties—finally findable.”
5. Care — “A quieter way to stay ahead of home maintenance.”
6. Device details — “Every useful detail travels with the home.”

Do not use demo badges in the final marketing screenshots unless the screen is specifically presenting the demo experience.

## App privacy answers to verify in App Store Connect

Declare only data actually collected in the production build. Based on the current product, review these categories:

- Contact info: name and email address (account and app functionality)
- User content: photos, documents, and other user content (app functionality)
- Identifiers: user ID and device push token (app functionality)
- Purchases: subscription status, if exposed to the app through the shared account
- Diagnostics: only if production crash or performance tooling is enabled

The current app does not use data for third-party advertising or cross-company tracking. Confirm this again immediately before submission.

## Release checklist

- Create a permanent, non-expiring reviewer account with representative devices, documents, and care items.
- Link the Expo project and confirm `extra.eas.projectId` before the production build.
- Configure the APNs key and test a remote notification on a physical iPhone.
- Apply all Supabase migrations and verify the account-deletion request appears in the admin database.
- Build with Xcode 26 / iOS 26 SDK or newer.
- Test account creation, email confirmation, password reset, sign in, sign out, and deletion on a physical iPhone.
- Test camera denial, photo denial, notification denial, offline launch, and session expiry.
- Capture the six 6.9-inch iPhone screenshots listed above.
- Complete export compliance using the configured non-exempt-encryption answer.
- Confirm the support, marketing, terms, and privacy URLs from a logged-out browser.
