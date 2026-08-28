# Independent verification 4 — FAIL

- **Candidate:** `5724e750333a504e99effd459d7e54e111a8f608`
- **Live URL:** <https://pocket-reconcile.sociobot.in>
- **Run:** 2026-08-28 from a clean candidate checkout
- **Verdict:** **FAIL — do not release this candidate.**
- **Product-code changes:** none

The live site is the candidate build, not a stale deployment. The core PWA is
small, private, accessible, installable, and functional. Release is blocked by
the required clean-clone claim commands, incomplete claim registration, and
browser navigation that does not preserve in-app history.

## Mandatory first checks

### Claims — blocking failure

`.factory/claims.json` exists and defines six claims. Before installing,
building, or inspecting the product, every listed `test` command was run
exactly as written from the clean checkout. All six exited 1:

| Claim | Exact clean-clone command | Result |
| --- | --- | --- |
| `demo-sandbox` | `npm run test:claims -- --grep @claim:demo-sandbox` | FAIL |
| `offline-reload` | `npm run test:claims -- --grep @claim:offline-reload` | FAIL |
| `csv-export` | `npm run test:claims -- --grep @claim:csv-export` | FAIL |
| `encrypted-backup` | `npm run test:claims -- --grep @claim:encrypted-backup` | FAIL |
| `local-records` | `npm run test:claims -- --grep @claim:local-records` | FAIL |
| `exact-decimals` | `npm run test:claims -- --grep @claim:exact-decimals` | FAIL |

Every run stopped before test discovery with:

```text
Error: Timed out waiting 60000ms from config.webServer.
```

Cause: Playwright starts `npm run preview`, but that command does not build the
site. `dist/` is ignored and absent from a clean checkout, so Vite Preview
serves `/` as HTTP 404 and Playwright waits for 60 seconds. `git ls-files dist`
returns no files and `.gitignore` explicitly lists `dist/`.

After `npm run build`, each exact command passed 2/2 (390px mobile and desktop),
and each claim ID occurs exactly once in the test source. Those later passes
show that the feature assertions themselves work, but they do not cure the
explicit clean-clone failure gate.

The manifest also does not list every visitor-facing promise. In particular:

- README promises CSV **import**, complete encrypted **restore**, atomic
  all-row import validation, installability, and an update prompt.
- README says the full backup includes accounts, entries, and checks, while the
  registered encrypted-backup test only checks the envelope marker and absence
  of two cleartext sample strings.
- The privacy page promises individual deletion, whole-ledger erasure, and
  password-only backup recovery.

These behaviors have tests elsewhere or worked in manual checks, but they lack
the required one-to-one `.factory/claims.json` entries and `@claim:<id>` tests.
Under the supplied claims contract, unlisted claims are release-blocking.

### Cold first-read — pass

A fresh browser profile opened the live root at desktop and 390px mobile. The
first screen says:

> Reconcile cash and card balances.
>
> For privacy-minded budgeters who track a few accounts from a phone.
>
> Try it with sample data

It answers what the product does, who it serves, and what to click first. The
sample action is visible, one click, and explains that it opens a working
ledger without mixing with real records. The resulting `/demo` screen already
shows two accounts, three transactions, a prior balance check, and the
persistent demo banner with **Reset demo** and **Start for real**.

## Clean-checkout gates

- `npm ci`: passed; 62 packages installed/audited, 0 vulnerabilities.
- `npm run test:unit`: passed, 21/21.
- `npm run build`: passed; strict `tsc --noEmit` and Vite production build
  produced `dist/`.
- `npm test`: passed after the explicit build step: 21 unit tests, production
  build, and 36/36 Playwright checks (18 at 390×844 and 18 at 1440×1000).
- `PLAYWRIGHT_BASE_URL=https://pocket-reconcile.sociobot.in npm run test:e2e`:
  passed 36/36 against production.
- No lint script is defined. Type checking is included in `npm run build`.

Production output is well inside budget: main JavaScript is 34.67 KB raw /
11.76 KB gzip; main CSS is 18.57 KB raw / 4.88 KB gzip; no font files ship;
the 390px hero WebP is 8.19 KB.

## End-to-end product evidence

The following passed on the live site in fresh Playwright contexts:

- Created a real local account, recorded spending, and completed an exact
  balance check.
- Imported a valid CSV row for `Weekend cash`; the app announced one imported
  entry and changed the expected balance to ₹101.05.
- Rejected an impossible date without changing the ledger and rejected a
  normalized duplicate account name.
- Preserved `$90,071,992,547,409.91`, the maximum accepted USD amount, exactly.
- Rejected a three-decimal INR amount, then accepted `1.25` on correction.
- Required a discrepancy note, focused its field after error, recorded the
  note, and carried the counted balance forward.
- Deleted and undid an entry.
- Exported a 1,900-byte encrypted `.pocket` envelope containing no sample
  account or transaction cleartext. A wrong password failed safely; the right
  password restored the ledger after confirmation.
- Seeded a real account, entered and changed the demo, then selected **Start
  for real**. The real ₹42.17 account remained unchanged, the demo entry was
  absent, and `demo:pocket-reconcile` was deleted while `pocket-reconcile`
  remained.

One recovery message is inaccurate: entering `0.001` for INR reports “Enter an
amount other than zero.” The problem is excess precision, not a zero amount.

## Privacy, network, and headers

An outgoing-request log covered demo load, all four screens, transaction and
discrepancy changes, encrypted export/restore, navigation, and offline reload.
Its only origin was `https://pocket-reconcile.sociobot.in`; there were no
analytics, bank, font, script, billing, or other third-party requests and no
console/page errors. Real and demo records use separate IndexedDB databases;
preferences use separate key prefixes.

The root response is HTTPS 200 and includes HSTS, CSP, `nosniff`, strict
referrer policy, and a restrictive Permissions-Policy. The CSP allows only
same-origin runtime resources (plus the unused Sociobot API connection
allowlist). HTML revalidates after 30 seconds, `sw.js` is `no-cache`, and the
content-hashed JavaScript is `public, max-age=31536000, immutable`.
`/demo/`, `/privacy/`, `/terms/`, the manifest, robots, and sitemap return 200;
an unknown path returns the styled 404 with HTTP 404.

This is a static PWA with no shipped runtime API, sign-in, or purchase call.
Therefore API concurrency, persistence, Entra authority, and HTTP 429 allowance
checks are not applicable. The one-time purchase from the researched brief is
not implemented; the builder documents that the earlier Sociobot checkout was
unavailable and removed the broken paid surface.

## Deployment identity

Local and live SHA-256 hashes match:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `a160544e6e09ed1824751e205124a364213551ba3a53e4acacee34aaf8815f6a` |
| `demo/index.html` | `e56e74ac95000d9545652b8d3404191cbe548bc7b0a1c5ae3c2ef29931be2f37` |
| `sw.js` | `55e774b5401af246302c1c08a1d6bb8bd9e87407c4f617c581a6929fa981c61b` |
| main JavaScript | `89792eea614523a0d5111930fa48de5a7c3ea27002341dcc4d11c42bda54bac0` |
| main CSS | `f344c2c7eefbcebfd98733e49dd1a8496e38a713301f802164593f527276aa38` |

The deployed service-worker cache is
`pocket-reconcile-1a988bdcb542-shell`, matching the candidate build.

## Accessibility, mobile, and PWA

- `/opt/fleet/lib/verify-url.sh` passed live: title, `lang="en"`, one `<h1>`,
  `<main>`, image alt text, labeled buttons, and zero console/page errors.
- Playwright axe found no serious/critical findings on Ledger, Checks, Backup,
  or Settings at 390px in both light and dark treatments. The complete suite
  also covers the cold root and both legal pages.
- Keyboard Tab exposes a 3px ochre focus ring; skip navigation, dialog focus,
  Escape return, and the primary workflow passed. No keyboard trap was found.
- Visible controls met 44px target sizing; the 1px radio inputs are visually
  replaced by their 46px labeled segmented controls.
- No horizontal overflow occurred at 390px or at the 720-CSS-pixel / DPR 2
  zoom-equivalent check. Reduced motion matched and reduced the toast animation
  to 0.01ms while disabling smooth scroll.
- Chromium reported no manifest or installability errors. A fresh service
  worker controlled the page, cached the versioned shell, and reloaded the
  demo offline with `Offline · ready`. The mocked installed-update path in the
  local and live suites displayed **Update** and reloaded successfully.

The section navigation does not meet the routing contract. Ledger → Checks →
Settings changes `/demo` to `#history` and then `#settings` via
`history.replaceState`. Pressing browser Back then navigates to `about:blank`
instead of restoring Checks. There are no real section URLs, and back/forward
cannot traverse section state.

## Performance

Fresh Lighthouse 13.4.1 mobile results on the live root:

- Performance 100
- Accessibility 100
- Best Practices 100
- SEO 100
- LCP 1,283 ms; FCP 983 ms; TBT 22 ms; CLS 0
- 65,430 total transferred bytes; 12,028 JavaScript bytes and 5,109 CSS bytes
  transferred; no font transfer

Lighthouse cannot produce load-only INP. The production bundle and automated
interaction suite are comfortably below the supplied static-PWA budgets.

## Defects by severity

### Critical — all mandatory claim commands fail from the clean clone

The `test` strings in `.factory/claims.json` depend on an untracked `dist/`
that they do not build. Each exact command exits 1 before any claim assertion.
Make the claim runner start a built product from a clean checkout, then rerun
all six exact manifest commands before any other gate.

### Critical — advertised claims are missing from the claims manifest

Register and tag observable demo tests for at least CSV import, complete backup
restore/content, atomic import validation, PWA install/update, and deletion /
erase promises, or remove those promises from visitor-facing copy.

### High — browser Back does not restore the previous product screen

The four product sections use hashes plus `replaceState`; Back exits the app.
Use real routes or push navigable history and handle `popstate`, focus, and
announcements as required by the site contract.

### Medium — required site metadata and standard footer are incomplete

The root, privacy, terms, and 404 pages have no canonical URL; no checked route
has Open Graph or Twitter-card metadata or a product social image. Footers do
not include “Built by Param Factory” or a version/build ID, and legal-page
headers do not expose the standard navigation.

### Medium — the landing information skeleton is incomplete

The root has the first screen and live app navigation, but no three-step “How
it works” section or explicit “What it does not do / privacy” section in the
required landing order.

### Low — invalid precision gets the wrong recovery message

For `0.001` INR, say that INR supports two decimal places. “Enter an amount
other than zero” misidentifies the input and does not tell the user how to fix
it.

## Re-check

From a checkout with no `dist/`, run every command in `.factory/claims.json`
first and require all of them to pass. Then run:

```sh
npm ci
npm test
npm run build
PLAYWRIGHT_BASE_URL=https://pocket-reconcile.sociobot.in npm run test:e2e
```

Re-test browser Back across all four product sections and repeat the
visitor-copy-to-claims audit before reconsidering release.
