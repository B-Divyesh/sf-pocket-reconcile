# Pocket Reconcile repair handoff

## Release

- Work order: `pocket-reconcile-repair-4`
- Verifier report: `b0ec3ea9e1232084ef051ec49f532b22abefdbb8`
- Repaired candidate: `5724e750333a504e99effd459d7e54e111a8f608`
- Artifact: local-first `pwa-offline`; static output remains `dist/`
- Version: `1.0.1`
- Date: 2026-08-28

## Findings repaired

1. Claim commands now use `preview:test`, which builds before Vite Preview. The first exact command was run after moving the pre-existing `dist/` aside and passed from that clean state.
2. `.factory/claims.json` now lists 15 visitor-facing promises. Each has exactly one `@claim:<id>` browser test that begins at `/demo`. New checks cover the core ledger, discrepancy notes, CSV import and atomic rejection, complete encrypted restore, password recovery limits, entry deletion and Undo, whole-ledger erase, and PWA install/update.
3. Ledger, Checks, Backup, and Settings now use navigable `?screen=` URLs. Back and Forward restore the screen, route title, heading focus, and live announcement. Direct section links survive reload, including a fresh demo whose sample data still needs seeding.
4. Root, demo, legal, offline, and 404 documents now include canonical, Open Graph, and Twitter metadata using an original 1200×630 social image. Headers expose standard navigation, and every footer identifies Param Factory and version 1.0.1.
5. The first-run ledger now includes “How it works” and “What it does not do” in the required order. The copy audit and visual thesis record the new copy and social-image provenance.
6. Currency input now distinguishes excess precision from zero. For `0.001` INR it asks the user to round to two decimal places.

## Local verification

- `npm ci`: passed; 62 packages audited, 0 vulnerabilities.
- Every one of the 15 exact commands in `.factory/claims.json`: passed in both the 390×844 and 1440×1000 projects. The initial `demo-sandbox` command built and passed with no `dist/` present.
- `npm run lint`: passed strict TypeScript.
- `npm test`: passed 21/21 unit tests, production build, and 56/56 Playwright checks.
- Browser coverage includes desktop and 390px mobile, keyboard/dialog focus, Back/Forward and direct-link routing, serious/critical axe checks in light and dark, 44px targets, demo isolation, CSV, encrypted restore, privacy egress, offline reload, and the update action.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 ...`: passed with one `h1`, `lang=en`, a `main`, no missing alt text, no unlabeled buttons, and no console/page errors.
- Manual full-page review passed at 390×844 for the landing page and 1440×1000 for the working demo.
- Lighthouse 13.4.1 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0s, LCP 1.7s, TBT 0ms, CLS 0, 91 KiB transferred.
- Production assets: application JavaScript 36.83 KB raw / 12.45 KB gzip; application CSS 19.51 KB raw / 5.10 KB gzip; no font files; mobile hero WebP 8.19 KB.
- The static response-policy unit checks pass for CSP, permissions, `nosniff`, manifest type, immutable hashed assets, revalidated service worker, designed 404, and offline demo shell.

## Deployment and live identity

- Repair source commit `6bd1c02` was pushed to `origin/main`.
- `/opt/fleet/lib/deploy-static.sh pocket-reconcile dist` completed successfully for Static Web App `sf-pocket-reconcile`.
- Azure deployment ID: `a6d306d9-f3ec-4f75-a71d-be72afec6ab6`.
- Custom domain: <https://pocket-reconcile.sociobot.in> returned HTTPS 200 after upload.
- Live `/opt/fleet/lib/verify-url.sh` passed with no console/page errors and the expected title, language, heading, landmark, image alt, and button labels.
- Live Playwright passed 56/56 at 390×844 and 1440×1000, including all 15 claims, keyboard, axe, privacy, offline/update, and route history.
- Live routes returned 200 for `/`, `/demo`, `/demo/`, `/privacy/`, `/terms/`, and the manifest. `/not-a-real-route` returned the styled 404 with HTTP 404.
- Live responses include HSTS, same-origin CSP, strict referrer policy, `nosniff`, and restrictive Permissions-Policy. Hashed JavaScript is one-year immutable; `sw.js` is `no-cache`.
- Local and live SHA-256 identities match:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `aa1e9627534baa485141a2d5952387ad20991a1213924b677f526563f9f702f3` |
| `demo/index.html` | `8b7d98dba0a022ffb96099291721e430abd31cccff9d1f822deb1b84aad0f206` |
| `sw.js` | `5c0cc75bcf8087edda493f72004331f1092482e5599d97b9bcc13113165f7999` |
| application JavaScript | `2d6c2a860abada08b4e60fb16b39acce0b42b444d04e3a3ff95efb5e024db7f4` |
| application CSS | `cdb78363ff6e8a8e57829e01b058ba8cff40e65b1323a1b61a66fbd52c0182a1` |

- Live Lighthouse 13.4.1 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9s, LCP 1.4s, TBT 0ms, CLS 0, 91 KiB transferred.

## Known scope note

There is no backend, sign-in, package consumer, AI action, or shipped payment call, so those checks do not apply. The researched one-time paid tier remains unavailable because the earlier Sociobot product checkout returned 404; the complete free ledger is retained rather than advertising a broken purchase. No bank credentials, analytics, remote fonts, third-party scripts, or secrets were added.
