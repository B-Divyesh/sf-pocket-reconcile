# Pocket Reconcile v1 handoff

## Independent verification status — FAIL

Verification work order `pocket-reconcile-verify-1` tested candidate
`f2ecd58b85a34ca76f4a61568b1cb02e86198adb` and the live URL
<https://pocket-reconcile.sociobot.in/> on 2026-08-28. The live hashed JS, CSS,
and service-worker bytes match the candidate exactly, and the normal local-first
PWA flow passes. **Do not release this candidate:** CSV import accepts impossible
calendar dates and silently normalizes them, and a maximum accepted decimal
amount displays one cent wrong. The live host also applies only `max-age=30` to
hashed assets rather than immutable caching. Full evidence and reproduction are
in [verification.md](verification.md).

Verifier commands passed: `npm ci`, `npm test` (7 unit + 4 Playwright tests,
type check, production build), independent mobile/desktop/keyboard/axe/offline
checks, and Lighthouse 99 performance / 100 accessibility / 100 best practices
/ 100 SEO. No separate lint script exists. Product code was not changed during
verification; this report is the only verifier change.

Work order: `pocket-reconcile-build-1`

Completed: 2026-08-28

Deploy target: static `./dist`

## What was built

- A responsive, installable PWA for the complete weekly phone workflow: create local accounts, record spent/received transactions, compare the expected balance with a counted balance, require a note for any difference, carry the observed balance forward, and review every closed check.
- Exact decimal handling in integer minor units, including zero-decimal JPY. No money calculation uses floating-point addition.
- IndexedDB persistence for accounts, entries, and reconciliation history. Data survives refresh, tab close, offline use, and installed-app launches.
- CSV transaction import/export with quoted-field parsing, date/account/amount validation, and atomic import (any bad row prevents the whole write).
- Password-encrypted complete `.pocket` backups using browser WebCrypto: PBKDF2-SHA256 (250,000 iterations), AES-256-GCM, versioned envelope, explicit overwrite confirmation, and clear no-recovery copy.
- A hand-written, versioned service worker with shell precaching, cache-first same-origin assets, network-first navigation, offline fallback, immediate activation, and an in-app update toast.
- Manifest with 192px, 512px, and maskable icons plus a versioned standalone start URL.
- One-time ₹499 Field Kit: the free tier retains two accounts, all reconcile functions, accessibility, CSV, and encrypted backup; paid unlock adds unlimited accounts and manual theme choice. The app uses only the Sociobot checkout/verify contract, captures return tokens, caches the verified result for one day, works optimistically offline, handles revocation, and supports pasted-license restoration.
- Static `/privacy/` and `/terms/` pages, no analytics, no remote fonts/scripts, and no bank credential or payment-card collection.
- A product-specific botanical field-guide interface with light/dark treatments, mobile stacking, ≥44px targets, visible focus, reduced-motion behavior, designed empty/error/offline states, confirmation for destructive account/data deletion, and undo for transaction deletion.
- Original generated botanical artwork, optimized responsive WebP at 8KB/45KB (with 66KB JPEG fallback), plus hand-authored PWA/interface marks. Prompt, generator, review, and provenance are in `.factory/design.md` and `assets/src/`.

## Run and verify

```sh
npm install
npm test
npm run build
npm run preview
```

The exact deploy build command is `npm run build`. It produces `dist/index.html`, `dist/privacy/index.html`, `dist/terms/index.html`, the manifest, service worker, icons, and offline page.

Verification completed on 2026-08-28:

- `npm test`: passed — 7 unit tests and 4 Playwright mobile Chromium tests.
- Covered by E2E: first account → transaction → exact reconcile → history; light and dark/reduced-motion axe scans; privacy and terms scans; zero page/console errors; service-worker-controlled offline reload.
- `npm run build`: passed from the locked dependency tree.
- `npm audit --audit-level=low`: 0 vulnerabilities.
- Bundle: 35.62KB initial JS (12.04KB gzip), 17.77KB CSS (4.75KB gzip), no fonts, 8KB mobile hero. Budgets: JS ≤200KB, CSS ≤50KB, fonts ≤120KB, hero ≤300KB.
- Lighthouse 12.8.2 mobile against the production preview: Performance 100, Accessibility 100, Best Practices 100, SEO 100. FCP 1.0s, LCP 1.7s, Speed Index 1.0s, Total Blocking Time 0ms, CLS 0. Lab INP is not produced without interaction; 0ms TBT is the lab responsiveness proxy.
- Manual visual review completed at 390×844 and 1440×1000 for the welcome and populated-ledger states. The generated image was reviewed at source resolution for text artifacts, anatomy, seams, brands, and unintended symbols.

## Known gaps and next steps

- The factory must register the `pocket-reconcile` paid product, price, and return URL in the Sociobot billing engine before checkout can complete in production. No product ID is hardcoded. The client-side purchase/restore/verify behavior is implemented, but a real payment was not run from this disposable build environment.
- Records intentionally do not sync across devices. Moving devices requires an encrypted backup or CSV, matching the local-first brief.
- The service worker caches the current build on first visit. Users must visit once online before offline installation/use; this is standard PWA behavior.
- Currency is fixed per account in v1, and imported CSV rows must name an existing account. These constraints prevent silent conversion or accidental duplicate account creation.
