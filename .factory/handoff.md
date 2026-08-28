# Pocket Reconcile polish-2 handoff

## Delivered

Polish round 2 closes every finding in `.factory/review-1.md` and
`.factory/review-2.md`. The released static PWA remains a local-first balance
ledger with its original botanical field-notebook visual system.

The repair adds complete demo namespace cleanup, stronger claim coverage,
plain ledger vocabulary, balanced first-screen actions, complete route icon
metadata, and a corrected mobile legal header. It also fixes a restore form
whose hidden password controls were visible before file selection.

The catalog line is now: “Reconcile cash, card, and wallet balances in a
private ledger that works offline.” It is verb-first and 81 characters.

## Demo and privacy behavior

- One click on **Try it with sample data** opens `/?demo=1`.
- `/demo` remains the canonical demo route and both demo entry points use
  `demo:pocket-reconcile` plus `demo:` preference keys.
- **Reset demo** restores the two accounts, three entries, one balance check,
  and default demo preferences.
- **Start for real** removes the demo database and every `demo:` key before
  opening the untouched personal ledger.
- The live request-log claim observed only the product origin. No analytics,
  bank, font, script, AI, or payment origin is required.

## Verification

- Final clean clone:
  `/tmp/pocket-reconcile-polish2-final-clean-IvJpOb/repo` at
  `22f51772a2b227ad58198533e79d7f49b07286f7`.
- `npm ci`: 61 packages installed; 0 audit vulnerabilities.
- All 17 exact `.factory/claims.json` commands: pass separately in
  mobile and desktop Chromium.
- `npm test`: pass; 22 unit/deployment checks and 64 browser checks.
- `npm run build`: pass; `dist/index.html` present. Main JavaScript is
  12.57 KiB gzip; main CSS is 5.18 KiB gzip.
- Live `PLAYWRIGHT_BASE_URL=https://pocket-reconcile.sociobot.in npm run test:e2e`:
  64/64 pass after the final deployment.
- Playwright Axe: no serious or critical WCAG 2 A/AA findings on first run,
  dark/reduced-motion mode, Privacy, or Terms.
- Offline: first-visit `/demo` reload passes with browser HTTP cache disabled.
- Privacy: the full demo request log contains only the product origin.
- `/opt/fleet/lib/verify-url.sh`: HTTP 200, one h1, `lang=en`, one main,
  complete image alt text, labeled buttons, and zero console errors.
- Live Lighthouse mobile: performance 100, accessibility 100, best practices
  100, SEO 100, LCP 1.1s, CLS 0, total transfer 91 KiB.
- Route probe: `/`, `/?demo=1`, `/demo`, `/privacy/`, `/terms/`, `/404.html`,
  `/offline.html`, manifest, robots, sitemap, and touch icon return 200. An
  unknown route returns the designed page with HTTP 404.

Evidence is under `/tmp/pocket-reconcile-polish-2/`, including
`final-clean-full.log`, individual `claim-*.log` files,
`final-live-e2e.log`, `final-live-verify/verify.json`,
`final-lighthouse-live.json`, `final-live-cold-check.json`, and final live
mobile screenshots. The complete finding map is `.factory/polish-2.md`.

## Deployment

- Repair commits: `5da42d66943c9bd7f752fcf465368674e2e9c1b9` and
  `22f51772a2b227ad58198533e79d7f49b07286f7`.
- Azure Static Web Apps deployment ID:
  `272945a2-64f9-46e1-89f9-270a17f4121e`.
- Live URL: <https://pocket-reconcile.sociobot.in>
- The final live cold checks found no horizontal overflow, page errors,
  console errors, stale copy, or unresolved finding.

## Known gaps and next steps

No known product, review, accessibility, privacy, offline, routing, metadata,
or deployment gaps remain. Next work is routine dependency and browser
compatibility maintenance.
