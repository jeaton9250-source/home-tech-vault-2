# TestFlight Release-Candidate Checklist

Test the exact build that will be selected in App Store Connect. Record the device, OS version, tester initials, and date next to each completed section.

## Installation and identity

- [ ] Fresh installation reaches the welcome screen without an error.
- [ ] Permanent review credentials sign in successfully.
- [ ] Sign in with Apple creates or opens the correct account.
- [ ] Google authentication returns to the app successfully.
- [ ] Email account creation, confirmation, sign-in, and password reset work.
- [ ] Sign out returns to the welcome screen and exposes no household data.
- [ ] Demo mode contains only fictional household information.

## Face ID Vault Lock

- [ ] Test the native TestFlight build on a physical Face ID or Touch ID device; do not use Expo Go for this section.
- [ ] The setting is off by default.
- [ ] Enabling it requires Face ID, Touch ID, or the device passcode.
- [ ] The app switcher does not expose vault content after backgrounding.
- [ ] Returning in under 30 seconds resumes without another prompt.
- [ ] Returning after 30 seconds shows the protected lock screen.
- [ ] Failed and canceled authentication can be retried.
- [ ] **Sign out instead** provides a safe recovery path.
- [ ] Disabling the setting requires device authentication.

## Devices and scanning

- [ ] Manual device creation synchronizes to the website.
- [ ] Barcode scanning populates a reviewable draft and saves correctly.
- [ ] Label scanning explains camera use before requesting permission.
- [ ] Denying camera access leaves manual entry available.
- [ ] Editing device details persists after refresh and app restart.
- [ ] Device images appear in the list and detail screen.

## Documents

- [ ] Upload a PDF and an image.
- [ ] File a document to a device.
- [ ] File a document to the whole home.
- [ ] Open each uploaded document.
- [ ] Delete a document in the app and confirm website removal.
- [ ] Delete a document on the website and confirm app removal after refresh.

## Care and notifications

- [ ] Complete a care item and confirm website synchronization.
- [ ] Enable notifications from the contextual prompt.
- [ ] Confirm 48-hour, 24-hour, and overdue reminders on a physical device.
- [ ] Opening a reminder routes into the Care experience.
- [ ] Denying notification permission does not block core functionality.

## Reliability and account controls

- [ ] Pull-to-refresh works on Home, Devices, Vault, and Care.
- [ ] Offline state is clearly explained and does not lose saved records.
- [ ] Interrupted uploads show an understandable error and can be retried.
- [ ] Support, privacy, terms, and family links open successfully.
- [ ] Feedback submission produces a support ticket number.
- [ ] Account deletion locks the account and displays confirmation.
- [ ] Relaunching after deletion does not restore the deleted session.

## App Store archive

- [ ] App icon, launch screen, version, and build number are correct.
- [ ] Apple Push Notification and Sign in with Apple capabilities are present.
- [ ] Export-compliance answer matches the app configuration.
- [ ] Xcode privacy report has been reviewed.
- [ ] App Store privacy answers match production behavior.
- [ ] Screenshots show fictional data only.
- [ ] Review credentials and notes are populated in App Store Connect.
