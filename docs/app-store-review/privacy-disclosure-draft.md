# App Privacy Disclosure Draft

This is a working implementation map, not legal advice. Confirm it against the final App Store archive's privacy report and the production privacy policy before publishing the answers in App Store Connect.

## Tracking

- The app does not use data to track users across other companies' apps or websites.
- The app does not include an advertising SDK.

## Data linked to the user

### Contact information

- Name
- Email address
- Purpose: Account management and app functionality

### User content

- Device details, serial numbers, notes, purchase and warranty dates
- Uploaded documents, receipts, manuals, and device images
- Household and maintenance records
- Support and feedback messages submitted by the user
- Purpose: App functionality and customer support

### Identifiers

- Supabase account identifier
- Household identifier
- Push-notification token when notifications are enabled
- Purpose: App functionality, authentication, synchronization, and notifications

## Data handled transiently

- A device-label image selected for scanning is transmitted to Home Tech Vault's authenticated server and an AI processing provider to extract product details. It is not added to the user's vault unless the user separately saves an image.
- Barcode values are used to look up device information.

Confirm with counsel and Apple's current definitions whether transient label images require disclosure as collected user content for the final production implementation.

## Data not collected by the current mobile app

- Precise or coarse location
- Contacts
- Health or fitness information
- Browsing history
- Advertising identifier
- Audio recordings
- Payment card information

## Permission alignment

- Camera permission text must match label and barcode scanning behavior.
- Photo permission text must match device-image and document uploads.
- Notification permission is requested contextually from the Notifications screen.
- Face ID is opt-in and used only to unlock locally stored signed-in access.
