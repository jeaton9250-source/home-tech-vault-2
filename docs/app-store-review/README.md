# Home Tech Vault — App Review Package

This folder contains the copy, test path, privacy draft, and release checklist for the first iOS submission.

## Before submission

1. Create a permanent homeowner review account that is not tied to a team member's personal data.
2. Populate that account with the sample records listed in `review-account-template.md`.
3. Put the credentials directly into App Store Connect. Never add a password to this repository.
4. Replace every `[[PLACEHOLDER]]` in `app-review-notes.md` and `submission-metadata.md`.
5. Complete the physical-device checks in `testflight-checklist.md` using the exact build selected for review.
6. Confirm the privacy answers in `privacy-disclosure-draft.md` against the final Xcode privacy report.

## Files

- `app-review-notes.md` — copy into the App Review Information notes field.
- `review-account-template.md` — permanent reviewer account setup and fixture list.
- `submission-metadata.md` — draft App Store name, subtitle, description, keywords, and URLs.
- `privacy-disclosure-draft.md` — working map for App Store privacy questions.
- `testflight-checklist.md` — release-candidate test plan and approval record.

Apple requires working reviewer access and enough detail to exercise non-obvious functionality. The built-in demo household is supplementary; the permanent review account is the primary review path.
