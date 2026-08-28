# Pocket Reconcile polish-1 handoff

## Delivered

- Fixed every F-1-1 through F-1-11 finding in `.factory/review-1.md`.
- Repair commits: `158661af926f1163ce19a047229da6c05697aa36` and
  `b222b6a`; both are pushed to `main`.
- Deployed the final `dist/` with the factory static deployment runner. Azure
  deployment ID: `70d9fef8-1ec8-4192-8d15-beefc1072284`.
- Live: <https://pocket-reconcile.sociobot.in>

## Verification evidence

- Fresh remote clone: `/tmp/pocket-reconcile-clean-VG2icy` at
  `158661af926f1163ce19a047229da6c05697aa36`; `npm ci` passed with 0 audit
  vulnerabilities.
- All 17 exact commands in `.factory/claims.json` passed from that clone. Each
  ran in mobile and desktop Chromium (34 claim assertions total). The complete
  command log is `/tmp/pocket-reconcile-clean-claims.log`.
- The clean clone’s `npm test` passed: 21 Vitest checks, strict TypeScript and
  Vite build, then 60 Playwright checks. Log:
  `/tmp/pocket-reconcile-clean-full.log`.
- Final production build passed. Initial application assets are 36.98 KB JS
  raw (12.45 KB gzip) and 20.02 KB CSS raw (5.18 KB gzip); no web fonts ship.
- Final live suite passed: `PLAYWRIGHT_BASE_URL=https://pocket-reconcile.sociobot.in npm run test:e2e` → 60 passed. It includes Playwright Axe WCAG 2 A/AA scans with no serious or critical violations, keyboard/focus checks, same-origin privacy checks, offline reload, route history, metadata, demo isolation, and mobile targets. Log: `/tmp/pocket-reconcile-live-e2e.log`.
- `/opt/fleet/lib/verify-url.sh https://pocket-reconcile.sociobot.in /tmp/pocket-reconcile-live-verify-final` passed: 200 response, title, `lang=en`, one h1, main landmark, image alt text, labeled buttons, and no console errors. Cold load: 733 ms. Screenshots and JSON report are in `/tmp/pocket-reconcile-live-verify-final/`.
- Lighthouse on the live root: Performance 99, Accessibility 100, Best
  Practices 100, SEO 100. Report: `/tmp/pocket-reconcile-lighthouse.json`.

## How to run

```sh
npm ci
npm test
npm run build
npm run preview
```

Open `/demo` or `/?demo=1` for the isolated sample. Reset demo restores the
sample; Start for real discards it and opens the real local ledger.

## Known gaps

None. The standalone Axe CLI could not launch its Selenium browser in this
container; the repository’s Playwright Axe integration passed locally and
against the deployed site instead.
