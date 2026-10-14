# Home Tech Vault: AI troubleshooting implementation and App Review report

Prepared for Jason Eaton · October 13, 2026 (America/New_York)

**Release status:** Implemented on `codex/ai-troubleshooting`. Database migrations are applied to the existing Home Tech Vault Supabase project. Website/mobile source changes still require deployment and an iOS build. This is a source and configuration review against Apple's public guidelines, not an approval guarantee or an inspection of Apple's internal review procedures.

## What changed

| Files | Result |
|---|---|
| `mobile/src/app/(tabs)/index.tsx` | Ask My Home and Something Isn’t Working cards above setup/stats. Current colors, typography and components retained. |
| `mobile/src/app/ask-my-home.tsx` | Native conversation, suggested questions, eight issue categories, vault device selection, guided results, follow-ups, warranty indication, manual/warranty/receipt actions, photo capture/picker, issue saving/resolution and answer reporting. |
| `mobile/src/components/issue-history.tsx`, `mobile/src/lib/troubleshooting-history.ts` | Owner-scoped saved issues, history on devices and in the assistant, resume/delete controls and refresh after saving. |
| `mobile/src/app/device/[id].tsx`, `_layout.tsx` | Device troubleshooting entry point, history and assistant route. Warranty wording now describes the saved date rather than promising coverage. |
| `app/api/ai/ask/route.ts`, `lib/permissions/requireServerFeatureAccess.ts` | Existing endpoint accepts verified mobile bearer tokens as well as browser sessions. Existing AI plan entitlement remains enforced. Admin credentials are used only for existing entitlement resolution, never for the new vault-content queries. |
| `lib/troubleshooting/ask.ts`, `schema.ts`, mobile contract/API modules | Reuse existing Groq client/model and context loader. Owner-filtered RLS queries, bounded context/history, schema-constrained JSON, output validation, timeouts, hazard handling and warranty dates computed by application code. |
| `app/api/devices/vision/route.ts` | Reuse existing OpenAI photo service. Troubleshooting mode reads error/display text even without a product identity and requires AI consent. |
| `mobile/src/app/scan-device.tsx`, `mobile/app.json` | Removed “Allow camera access,” uses Continue and native iOS permission. Manual alternative follows denial. Added provider disclosure/consent and updated photo/camera purpose strings; no microphone requested by image picker. |
| `mobile/src/app/feedback.tsx` | AI/ad report drafts open existing feedback for the user to review and send. No automatic support messages. |
| `mobile/src/components/app-promo-card.tsx`, Home/Vault/More | Existing CrossPromo recommendations require optional opt-in, can be hidden, and have ad information/report controls. |
| `app/privacy/page.tsx`, store notes | AI provider/data/retention/withdrawal disclosures and corrected third-party advertising description. Policy must be deployed before release. |
| `mobile/package.json`, lockfile, `app.json` | Version 1.1.2, local iOS build 17, and four Expo patch updates required by Expo Doctor. EAS remote numbering still controls production builds. |
| `lib/troubleshooting/tests/*`, root `package.json` | Reproducible safety, output, context and actual PostgreSQL RLS tests: `npm run test:troubleshooting`. |

The AI sees owned device make/model, category, purchase details, saved warranty end dates, document metadata, maintenance completion, subscription summaries, non-secret ISP/router/modem information and previous issue summaries/resolutions. Device serial numbers, Wi-Fi passwords, credentials and signed document URLs are omitted from the snapshot. A selected device narrows device/document/maintenance/history context. Whole-home context is capped.

**Scope limits:** shared household records owned by another member are excluded from this new AI snapshot, even if the normal vault UI can show them. Manuals/receipts are surfaced through existing secure document viewing; their full contents are not parsed into the AI context. Troubleshooting photos are read for visible text, not a reliable visual diagnosis of damage. HTV does not persist those photos or full conversations. Saved issues retain the description, AI summary and optional resolution only. Provider processing may include retention despite `store:false`; confirm your provider agreements/settings.

## Database migrations — applied

Project: Home Tech Vault (`qljtalztwryrppgzhsbm`). Local filenames match the versions recorded by the remote migration service.

| Migration | Purpose |
|---|---|
| `20261014023018_troubleshooting_issues.sql` | Adds `public.troubleshooting_issues`, indexes, authenticated owner CRUD policies, ownership validation for optional device links and status/date constraints. |
| `20261014023128_troubleshooting_grants.sql` | Removes inherited authenticated privileges and grants only SELECT/INSERT/UPDATE/DELETE. TRUNCATE is explicitly absent because row policies do not protect it. |

Columns: `id`, `user_id`, optional `device_id`, `category`, `description`, `ai_summary`, `status`, `resolution`, `created_at`, `resolved_at`. User deletion cascades issues; device deletion detaches the issue so the personal history remains. No new storage bucket, service-role API, privileged function or AI infrastructure was added.

Live verification: RLS=true; four policies; anonymous SELECT=false; authenticated SELECT=true; authenticated TRUNCATE=false. The local PostgreSQL test exercises owner creation/read/update/delete, spoofed ownership, foreign-device links, cross-user reads/updates/deletes, anonymous access, resolved-date constraints and deletion behavior.

The security advisor reported no finding naming the new table. Existing project warnings remain: mutable function search paths, broadly executable SECURITY DEFINER functions and disabled leaked-password protection. Review these separately; some functions/policies may be intentional. No blanket changes were made to existing authorization. References: [function paths](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable), [anonymous privileged functions](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), [password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Public App Review guideline coverage

This matrix indexes all five public guideline sections. “Implemented” means the described source behavior exists; “verify” means the signed release, service operations or App Store Connect settings still need evidence. “Not present” is based on inspected HTV features and is not a universal certification.

| Guideline scope | HTV evidence / remaining check |
|---|---|
| 1.1 | Assistant instructions restrict harmful/unrelated content; AI output is not guaranteed. Answer reporting is available. Test adversarial prompts with the deployed model. |
| 1.2, including creator provisions | Private vault/assistant, no new public community or creator marketplace. Reassess if users can publish/share AI output publicly. |
| 1.3 | No Kids Category feature added; verify actual category, age audience and advertising suitability. |
| 1.4 | Hazard interception, professional escalation, no elevated-risk repair steps, no home-safety certification. Test wording and OCR with real devices. Medical/drug/reckless-use services not present. |
| 1.5 | Existing Contact and feedback; verify support URL and monitored support address. |
| 1.6 | Existing authenticated client/RLS reused; new owner policies tested. Existing database advisories need separate assessment. |
| 1.7 | Crime-reporting service not present. |
| 2.1 | Source checks and bundles pass; configured live AI, reviewer access, signed device build and working URLs still required. |
| 2.2 | This feature is implemented; distribute test builds through TestFlight before release. |
| 2.3, all metadata subclauses | Update description/screenshots/What's New/age answers accurately. Do not claim guaranteed repairs or warranty eligibility. Store listing was not edited directly. |
| 2.4, platform/hardware subclauses | Phone-native controls and keyboard avoidance added. Test supported iPhones, launch/resume, memory/performance and large text. Tablet support remains disabled. Other-platform special features not added. |
| 2.5, all API/runtime subclauses | Expo supported APIs used, no downloaded executable code or new background service. Check signed entitlements, required-reason declarations, SDK manifests/signatures, push behavior and network transport. Ads now have optional consent/information/reporting; check served ads for age suitability. Health, audio recording, location, facial identification, extensions and other special APIs are not introduced. |
| 3.1.1 and external purchase links | No native purchases or new purchase links added. Existing paid website account entitlement is reused. Confirm companion-app treatment and storefront rules for the actual distribution; do not assume all regions have the same rules. |
| 3.1.2 | Native subscription sale/restore UI not added. If selling subscriptions in-app later, complete StoreKit and subscription disclosures. Give the reviewer an AI-entitled account now. |
| 3.1.3 (all exception subclauses) | HTV continues as a companion to its web service. Reader, enterprise, hardware-specific and other exceptions should not be claimed without matching the actual product. |
| 3.1.4–3.1.5 | Hardware sales and cryptocurrency functions not present in the native app. |
| 3.2.1–3.2.2 | Optional recommendations preserve vault access; no forced ad clicks/ratings/downloads. Charity, financial trading, lending, paid TestFlight rewards and similar services not added. |
| 4.1–4.3 | Existing HTV brand/native vault preserved; assistant is a native feature, not just a web wrapper. No duplicate app submitted. |
| 4.4 | No new extensions/keyboard extensions. |
| 4.5 | Existing notifications/sign-in preserved. Verify APNs and service terms on the signed build. No new Apple-services integrations. |
| 4.6 | Public guideline number intentionally omitted. |
| 4.7 | Built-in assistant; no mini-app/software/plugin catalog or downloaded code added. Reassess if externally provided software becomes a feature. |
| 4.8 | Existing Apple sign-in alongside Google preserved; verify both and private-email account matching. |
| 4.9 | Apple Pay not added. |
| 4.10 | AI service entitlement preserved; camera/photo selection has no separate hardware-access charge. |
| 5.1.1 (all subclauses) | Policy/disclosures updated; neutral native permissions and AI withdrawal available; photos optional. Existing in-app deletion preserved and issue cascade tested. Verify retention operations, collected-data labels, contact/education/financial/regulated-data applicability and SDK obligations in production. |
| 5.1.2 | Named AI providers and explicit mobile sharing consent added. Verify provider agreements/protection and actual data flows; user-entered sensitive content can still be included in a question/photo. |
| 5.1.3–5.1.5 | Health/research, Kids Category and location-based functions not added. |
| 5.2, all IP subclauses | HTV identity retained; only saved/official documents are surfaced. Verify rights to hosted assets/manuals and provider terms. No claims of Apple endorsement. |
| 5.3, all gambling subclauses | Gambling/lottery/sweepstakes not present. |
| 5.4–5.5 | VPN/MDM/configuration-profile services not added to the mobile app. |
| 5.6.1–5.6.4 | Maintain truthful developer identity, support and listing; no review/discovery incentives added. Operational verification remains required. |

Source: [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/). This is a coverage index and an implementation assessment; use the linked current text for full rules and examples.

## Verification evidence and limits

- Website and mobile TypeScript checks passed; mobile lint and targeted website lint passed.
- New suite: 15 tests passed, including actual PostgreSQL RLS execution through PGlite. AI response integration uses a mocked provider; no live provider keys were available locally.
- Expo Doctor: 21/21 after patch updates.
- Expo web export and iOS JavaScript/Hermes export passed. Neither is a signed iOS archive or native permission test.
- Website production build completed with placeholder environment variables. Expected CMS/backend warnings occurred with those placeholders; live production integration is not established by that build.
- Existing account-deletion helper tests passed. Broader selected regression tests: 28/29; existing `lib/popup/schema.test.ts` private-route exclusion test fails. Its source/test files are unchanged by this work.
- Screenshots could not be captured: no installed local browser, browser download blocked, and the cloud browser blocks localhost. Native camera/system-photo picker and visual layout still need device/TestFlight checks. No mockup is represented as an actual screenshot.

## Before submitting 1.1.2

1. Merge/deploy this branch's website API and policy changes. Both migrations are already applied to the connected project; apply them normally to any separate staging project. Do not reapply them as new versions to production.
2. Confirm server-only `GROQ_API_KEY` and the existing advisor-model configuration; confirm the chosen model supports Responses structured JSON. Photos need the existing `OPENAI_API_KEY` and vision-model configuration. Never put provider or service-role secrets in Expo public variables.
3. Confirm mobile public Supabase URL/key and `EXPO_PUBLIC_WEB_URL` point to the same HTTPS backend/project. `npm --prefix mobile run setup` reuses the existing public configuration.
4. Supply a permanent App Review account with Home Plus/Household AI entitlement, representative devices, manuals/receipts, warranty dates, care history and saved issues. Local demo mode intentionally does not call AI and cannot substitute for full reviewer access.
5. Set App Store Connect version to 1.1.2. Local build=17; `eas.json` uses remote numbering with autoIncrement. Inspect EAS's actual next build and ensure it exceeds reviewed build 16. Verify the selected version is open for submission.
6. Update App Privacy for questions/photos/saved issues and existing account/document data. For CrossPromo, its installed guide specifies Usage Data → Product Interaction and Advertising Data, purposes Third-Party Advertising and Analytics, not linked to identity, not tracking. Validate these vendor statements against the shipped SDK and your agreements rather than guessing. Inspect all SDK manifests and required-reason APIs in the Xcode archive. [Apple privacy details](https://developer.apple.com/app-store/app-privacy-details/) · [SDK requirements](https://developer.apple.com/support/third-party-SDK-requirements/).
7. Build with Xcode 26+/iOS 26 SDK+, and complete current age-rating answers and any applicable EU trader information. Existing deployment target=16.4. [Current submission requirements](https://developer.apple.com/news/upcoming-requirements/).
8. On a physical iPhone/TestFlight: fresh camera permission, denied camera, previously denied camera, restricted/limited photos, cancel picker, error-code image, no OCR text, offline, provider timeout, expired session, empty vault, unauthenticated/demo, foreign-device ID, real manual/receipt links, save/reopen/resolve/delete issue, account deletion, Apple/Google login, large text and VoiceOver. Verify user A cannot read/update user B's issues with real tokens in staging.
9. Test gas smell, CO alarm, fire/smoke, live/exposed wiring, major leak/electricity, and attempts to bypass safety. Confirm no hazardous steps appear, including in summary/follow-up text. Keyword and model guards reduce risk but are not a formal safety guarantee.
10. Capture genuine screenshots of Home, assistant consent/conversation, device-selected guidance and history. Update the listing/What's New, support URLs, privacy URL and encryption answers to the actual archived binary.

## Suggested App Review notes

Home Tech Vault 1.1.2 adds Ask My Home and guided troubleshooting to the Home screen. Please use the supplied review account for AI and saved-issue actions; the local fictional demo does not call AI. Home → Get Help lets you select a saved device or issue category. Groq processes relevant owner-scoped vault metadata/questions after explicit consent. Optional photos use OpenAI for visible-text extraction. Camera requests use Continue or Take a Photo and the native iOS permission dialog; denial permits continuing without camera access. Saved issues are private to the account, and gas/CO/fire/electrical hazards stop the repair flow. Warranty messages refer to saved dates and do not guarantee eligibility. “Report this answer” opens feedback for review. Account deletion remains under Your account. Optional CrossPromo recommendations can be declined/hidden/reported. The app has no native checkout or new purchase links.

Confirm these notes against the actual submitted build and supply the account credentials in App Store Connect's protected Sign-In Information fields, not in this document.
