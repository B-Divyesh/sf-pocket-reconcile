# Pocket Reconcile repair handoff

- Work order: `pocket-reconcile-repair-3`
- Independent report: `7ad78161917b6ad548c35acad9963b27f3fd3d8f` (`.factory/verification-3.md`)
- Artifact: local-first `pwa-offline`; static `dist/`
- Repair date: 2026-08-28

## What changed

1. Added a direct `/demo` build entry and a first-screen **Try it with sample data** action. The demo contains Weekend cash, Daily card, three realistic entries, and one completed check.
2. Demo data uses `demo:pocket-reconcile` IndexedDB and `demo:` local-storage keys. It never reads or writes the real namespace. Reset restores the sample; Start for real deletes the demo database before opening the empty real ledger. The service worker precaches `/demo/` for offline use.
3. Added `.factory/claims.json`, `.factory/demo.md`, and six browser claim regressions that begin at `/demo`: sandbox isolation, offline reload, CSV export, encrypted backup, local/no-login flow, and maximum exact cents.
4. Rewrote the first screen in plain language for privacy-minded mobile budgeters, with the required one-click sample action. The copy audit is in `.factory/copy-audit.md`.
5. Removed the unavailable Field Kit purchase surface and stale paid copy. The verified Sociobot checkout URL returned 404, so advertising it would send a visitor to a failed purchase. The complete free product now has unlimited local accounts and paper-tone choice. This is a temporary honest deviation from the brief's one-time monetization until the factory registers a usable billing product.
6. Replaced the static-app catch-all with a product-styled `404.html` response and an Azure Static Web Apps 404 override. Unknown routes are no longer configured to return the normal ledger shell with HTTP 200.

## Verification before deploy

```sh
npm ci
npm run test:unit
npm run build
npm run test:e2e
```

- `npm ci`: passed; 62 packages audited, 0 vulnerabilities.
- Unit/type/build: 21 Vitest tests passed; strict TypeScript and Vite build passed. `dist/index.html`, `dist/demo/index.html`, and `dist/404.html` are present.
- Browser: 36 Playwright checks passed: 18 at 390×844 and 18 at 1440×1000. They include keyboard/dialog flow, axe serious/critical checks, update, privacy egress, demo isolation/reset/exit, and an offline first-visit demo reload with the browser HTTP cache disabled.
- Every command listed in `.factory/claims.json` passed in both browser projects (2 checks per command). Each claim has exactly one tagged source test and begins from `/demo`.
- `verify-url.sh` against the local production preview passed: title, `lang`, one `<h1>`, `<main>`, image alt text, and zero console/page errors. The Playwright axe integration is the accessibility scan; it passed on first run and dark legal routes.
- Production assets remain within budget: app JS 34.67 KB raw / 11.77 KB gzip; CSS 18.57 KB raw / 4.88 KB gzip. No shipped font files.

## Deploy and live evidence

Build and deploy the exact static artifact with:

```sh
npm ci
npm test
npm run build
/opt/fleet/lib/deploy-static.sh pocket-reconcile dist
PLAYWRIGHT_BASE_URL=https://pocket-reconcile.sociobot.in npm run test:e2e
```

The final live deployment SHA and response checks are appended after the static deployment completes.

## Scope notes

There is no sign-in, backend, package-consumer, or payment flow in this released free PWA. The unused historical `src/license.ts` is not imported or shipped in the production bundle. No bank credentials, analytics, remote fonts, third-party scripts, or payments are introduced.
