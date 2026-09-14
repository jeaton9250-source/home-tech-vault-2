# App Review Notes — Version 1.0

Home Tech Vault is a private household record for devices, manuals, receipts, warranties, and recurring home-care tasks. It does not control smart-home hardware and does not require special accessories.

## Review access

- Account email: `[[ENTER PERMANENT REVIEW EMAIL IN APP STORE CONNECT]]`
- Account password: `[[ENTER PASSWORD IN APP STORE CONNECT — NEVER COMMIT IT]]`
- Two-factor authentication: Not required for the review account.

A supplementary demo experience is available without signing in. On the first screen, select **Explore a sample home**. Demo mode uses fictional household data and never displays the developer's or another customer's personal information.

## Suggested review path

1. Sign in with the permanent review account.
2. On **Home**, review the household summary and setup progress.
3. Open **Devices** and select a device to view its model, serial number, purchase date, warranty, image, and connected documents.
4. Select **Add a device**, then choose manual entry. Camera access is optional because every device can be entered without scanning.
5. Open **Vault** to view a document. Select **File a document** to attach a PDF or image to a device or to the whole home.
6. Open **Care** and complete a maintenance item. The completion synchronizes with the web account.
7. Open **Notifications** to optionally enable maintenance reminders.
8. Open **More → Face ID Vault Lock** to optionally protect the app. Face ID is disabled by default and is not required for review.
9. Open **More → Delete account** to see the in-app deletion flow. Deletion locks the account immediately and schedules its associated records for permanent erasure.

Face ID requires the App Store or TestFlight build on a Face ID-capable device. It is not available in Expo Go.

## Permissions

- **Camera:** Requested only after the reviewer chooses barcode or device-label scanning. Label images are transmitted securely for text and product-detail extraction and are not saved to the vault unless the user separately chooses to add a device image.
- **Photo library:** Requested only when the reviewer chooses an existing device image or document.
- **Notifications:** Requested only after the reviewer explicitly selects **Turn on notifications**. Used for 48-hour, 24-hour, and overdue maintenance reminders.
- **Face ID:** Requested only when the reviewer enables **Face ID Vault Lock**. Used locally to unlock the signed-in vault after the app has been away for 30 seconds.

## Account and business model

- Email/password, Sign in with Apple, and Google authentication are available.
- Version 1.0 contains no in-app purchase or checkout flow.
- The app's main functionality can also be explored using the fictional demo household.
- Backend services will remain enabled and accessible throughout review.

## Contact

- Review contact: `[[FULL NAME]]`
- Phone: `[[PHONE NUMBER]]`
- Email: `[[REVIEW CONTACT EMAIL]]`
