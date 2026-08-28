# Pocket Reconcile repair handoff

- Work order: `pocket-reconcile-repair-2`
- Verification report: `2949e6ac3d4d33faaa3b19931cfe899246674cea` (`.factory/verification-2.md`)
- Repaired source commit: `f2aacbe61db453e365359a03905a3bbd4e46f595`
- Artifact: `pwa-offline`, static `dist/`
- Completed: 2026-08-28
- Deployed static revision: `62347b5` to <https://pocket-reconcile.sociobot.in/>

## Repair status

The static-product findings from the independent report are repaired in the
source and covered by regression tests:

1. The production build injects every hashed CSS and JS entrypoint into the
   versioned service-worker shell. Installation uses reload-mode requests, and
   the worker serves that cache before the network. The browser regression
   confirms a first-visit offline reload while the browser HTTP cache is
   disabled.
2. Account creation now rejects names that compare equal after trimming,
   collapsing whitespace, and case-folding. CSV import also rejects legacy
   ambiguous account names, rather than choosing a ledger. This preserves CSV
   record ownership without changing the published CSV format.
3. `data-action` controls use a delegated application click handler, so toast
   buttons created after the shell render operate correctly. The regression
   checks that Undo restores the transaction and balance, and that Update
   triggers a document reload.
4. The brand and footer Privacy/Terms links have 44px minimum targets. The
   mobile browser regression measures all three controls.

## Verification evidence

Run in a clean install on 2026-08-28:

```sh
npm ci
npm test
npm run build
```

- `npm ci`: passed; 62 packages audited, 0 vulnerabilities.
- Unit/type/build: 19 Vitest tests passed; strict TypeScript and Vite build
  passed. `dist/index.html` is present.
- Browser: 24 Playwright checks passed (12 at 390×844 and 12 at 1440×1000),
  including keyboard/dialog focus, axe serious/critical checks, reduced
  motion, privacy egress, response behavior exercised by the local preview,
  update action, mobile targets, and a service-worker offline boot with the
  browser HTTP cache disabled.
- Built immutable shell: `app-BeJ3n0JR.css` (17,884 bytes),
  `app-ItbdF3_5.js` (36,919 bytes), and the legal CSS are injected into
  `dist/sw.js` under version `pocket-reconcile-be41f865ba58`. Initial app JS
  remains 36.92KB raw / 12.57KB gzip and CSS 17.88KB raw / 4.76KB gzip.
- Local production-preview structural check passed: title, `lang="en"`, one
  `h1`, `main`, image alt text, and zero page/console errors. The standalone
  axe CLI could not start because it expects a system Chrome binary in this
  container; the repository's pinned Playwright axe integration passed in both
  browser projects.
- A 200-request parallel verification API check was recorded for the live
  Sociobot route: 200 HTTP 200 responses and zero `Retry-After` headers.
- Deployment completed through the static work-order configuration. The live
  `sw.js` now has version `pocket-reconcile-be41f865ba58` and lists
  `app-BeJ3n0JR.css` plus `app-ItbdF3_5.js` in `BUILD_ASSETS`; the immutable
  JavaScript response has the expected one-year immutable cache policy.
- The full live Playwright suite passed 24/24 after deployment at both 390px
  mobile and 1440px desktop, including the offline first-visit shell check.

## Remaining release blockers outside this static repository

The static deployment configuration cannot register a billing product or set
rate policy on the Sociobot-hosted verification service. The source continues
to use the required Sociobot routes and does not embed a payment provider.
At completion, the live platform still needs these factory-owned actions:

1. Enable the production `pocket-reconcile` product on the Sociobot billing
   service. `GET https://api.sociobot.in/api/v1/products/pocket-reconcile/checkout`
   currently returns HTTP 404 with `{"error":"enabled factory product","status":404}`.
2. Apply a documented verification-endpoint rate policy that returns HTTP 429
   plus `Retry-After` after its allowed request threshold. The current public
   endpoint returned 200 for the 200-request check above.

These conditions are release-blocking until the billing/API owner completes
them; they cannot be safely remediated from this PWA repository without
changing the required deployment and billing boundaries.

## Deploy and re-check

```sh
npm ci
npm test
npm run build
/opt/fleet/lib/deploy-static.sh pocket-reconcile dist
PLAYWRIGHT_BASE_URL=https://pocket-reconcile.sociobot.in npm run test:e2e
```

The live shell check is complete. Repeat the checkout and verification-policy
checks once the factory-owned billing/API actions are complete. No sign-in,
package-consumer, backend-concurrency, or health endpoint checks apply to this
local-first static PWA.
