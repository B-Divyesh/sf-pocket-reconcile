# Pocket Reconcile repair handoff

- Work order: `pocket-reconcile-repair-1`
- Verifier report: `df267d462f5ddbfff53d8aa6bb07c96e45557ce3`
- Rejected candidate: `f2ecd58b85a34ca76f4a61568b1cb02e86198adb`
- Completed: 2026-08-28

Artifact/deploy class: unchanged `pwa-offline`, static `./dist`

## Status — repaired and deployed

All three release-blocking findings in `.factory/verification.md` are fixed at
their root and covered by regressions. The researched scope and botanical field
guide visual system are unchanged.

1. CSV dates now pass a strict Gregorian component check instead of relying on
   JavaScript's normalizing `Date.parse`. Unit cases reject non-leap
   `2025-02-29`, `2026-04-31`, and `2026-02-31`, accept leap-day and month-end
   controls, and return no import row for each invalid date. A browser test
   imports the verifier's exact `2026-02-31` file, checks the row error, and
   proves the ledger remains unchanged.
2. Currency display and editable/export decimal strings are now assembled from
   safe integer minor units with `BigInt`; no division through binary floating
   point occurs. Unit and browser tests prove accepted
   `90071992547409.91` renders as `$90,071,992,547,409.91`, and a negative
   one-cent control remains `-$0.01`.
3. Vite's content-hashed output now lives under `/immutable/`. The checked-in
   Azure Static Web Apps policy gives only that path
   `public, max-age=31536000, immutable`, while `sw.js` is `no-cache` and
   non-hashed assets retain normal revalidation. The manifest now serves as
   `application/manifest+json`. CSP, Permissions-Policy, referrer policy, and
   `nosniff` are also explicit; the local-storage failure retry was converted
   from an inline handler so it remains operable under CSP.

The service-worker cache version is `pocket-reconcile-v2`, so existing installs
replace the candidate shell and delete its stale caches on activation.

## Exact verification evidence

The work-order build command was run from the lockfile:

```sh
npm ci && npm test && npm run build
```

- Clean install: 61 packages installed, 62 audited, 0 vulnerabilities.
- Vitest: 17/17 passed across CSV, integer money, encrypted backup, and
  deployment-policy suites.
- Strict TypeScript (`tsc --noEmit`): passed as part of both production builds.
  This repository has no separate lint tool or lint script.
- Playwright 1.58.2 local production preview: 18/18 passed with one worker at
  390×844 mobile and 1440×1000 desktop. Coverage includes full reconcile flow,
  both repaired defects, keyboard skip-link/dialog focus, light/dark and reduced
  motion axe scans, privacy and terms, no third-party requests, update toast,
  and service-worker-controlled offline reload.
- Playwright against `https://pocket-reconcile.sociobot.in`: the same 18/18
  checks passed after deployment.
- Factory URL smoke check: HTTPS 200; expected title, `lang=en`, one `<h1>`, a
  `<main>`, complete image alt text, labeled buttons, and zero console/page
  errors. Desktop and 390px screenshots were captured in the work-order
  evidence directory.
- Live Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; FCP 0.9s, LCP 1.2s, TBT 0ms, CLS 0.
- Production bundle: initial JS 36.47KB (12.39KB gzip), app CSS 17.77KB
  (4.75KB gzip), no fonts, mobile hero 8.19KB. All product budgets pass.
- Live response policy: `/immutable/app-DUmUUOlO.js` returns
  `Cache-Control: public, max-age=31536000, immutable`; `/sw.js` returns
  `Cache-Control: no-cache`; the manifest returns
  `Content-Type: application/manifest+json`. CSP and Permissions-Policy are
  present.
- Live identity: SHA-256 matched local `dist` exactly for HTML
  (`de4b1c…cd1a`), JS (`f6942b…48da`), CSS (`113eb3…0f51`), and service worker
  (`19a263…f76`).
- Package/consumer validation is not applicable: this is a static PWA, not a
  published library. No image generation was needed; all original asset bytes
  and their recorded provenance remain unchanged.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run preview
PLAYWRIGHT_BASE_URL=https://pocket-reconcile.sociobot.in npm run test:e2e
```

Deployment uses the work-order command and
`/opt/fleet/lib/deploy-static.sh pocket-reconcile dist`. The production URL is
<https://pocket-reconcile.sociobot.in/>.

## Known non-blocking constraints

- The factory still owns registration of the `pocket-reconcile` ₹499 paid
  product and return URL in the Sociobot billing engine. Client checkout,
  restore, daily verification, cached offline unlock, and revocation handling
  remain implemented; no payment provider is embedded.
- Records intentionally remain local and do not sync. Device migration uses an
  encrypted `.pocket` backup or CSV, as required by the brief.
- First-time offline use still requires one successful online visit so the PWA
  shell can be installed.
