# Pocket Reconcile review-2 handoff

## Delivered

- Added `.factory/review-2.md` with an adversarial mobile/desktop first-read
  review of the live deployment and current source.
- Verdict: **FAIL** with one blocking and ten minor findings.
- Product code was not modified.

## Verification performed

- Cold Chromium contexts at 390×844 and 1440×1000.
- One-click live demo, sample visibility, reset, seeded-personal-ledger
  preservation, demo namespace inspection, exit cleanup, and request logging.
- Fresh depth-one GitHub clone at
  `938698b172aa74d33f848deda3176c733ba86530`; all 17 exact
  `.factory/claims.json` commands passed in mobile and desktop Chromium.
- Fresh-clone `npm test`: 21 unit tests and 60 Playwright tests passed; build
  completed with 12.45 KB gzip JavaScript.
- Live `npm run test:e2e`: 60 tests passed, including Playwright Axe scans,
  offline reload, request-origin, route history, and metadata checks.
- `/opt/fleet/lib/verify-url.sh`: 200 response, one h1, `lang=en`, main
  landmark, no missing alt text, no unlabeled buttons, no console errors, and
  633 ms cold load.
- Live crawl of root, demo/deep links, Privacy, Terms, 404, offline page,
  robots, sitemap, manifest, and every same-origin link.
- Every F-1-1 through F-1-11 closure checked against live output and source.

## Blocking issue

**Start for real** deletes `demo:pocket-reconcile` but leaves demo-prefixed
local-storage state such as `demo:pr:selected-account`. The existing
`@claim:demo-sandbox` test does not check demo-key cleanup or preserve a seeded
personal ledger as part of the automated assertion. See F-2-1.

## Other findings

Desktop CTA sizing, ambiguous/metaphorical application copy, two empty states,
four README phrases, cross-currency precision wording/coverage, and incomplete
apple-touch metadata remain. See F-2-2 through F-2-11 for exact fixes.

## Evidence paths

- `/tmp/pocket-reconcile-review2-claims.log`
- `/tmp/pocket-reconcile-review2-full.log`
- `/tmp/pocket-reconcile-review2-live-e2e.log`
- `/tmp/review2-mobile-cold.png`
- `/tmp/review2-desktop-cold.png`
- `/tmp/review2-demo-mobile.png`
- `/tmp/pocket-reconcile-review2-verify-pYIHIw/verify.json`

These paths are ephemeral worker evidence; the durable findings and results are
recorded in `.factory/review-2.md`.
