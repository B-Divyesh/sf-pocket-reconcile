# Independent verification — FAIL

Date: 2026-08-28  
Verifier work order: `pocket-reconcile-verify-1`  
Candidate: `f2ecd58b85a34ca76f4a61568b1cb02e86198adb`  
Live URL: <https://pocket-reconcile.sociobot.in/>

## Verdict

**FAIL.** The deployed bytes do match the candidate and the normal mobile
reconcile, local persistence, encrypted backup/restore, offline reload,
accessibility, and performance checks pass. It cannot be accepted for a
financial-record product because two accepted boundary inputs silently corrupt
the user-visible record: an impossible CSV calendar date is imported, and an
accepted maximum decimal amount is displayed one cent incorrectly. In addition,
the live host does not meet the required long-lived immutable caching policy for
hashed assets.

## Clean-checkout and quality gates

- Repository was clean on `main` at the stated candidate SHA before testing.
- `npm ci`: passed; 60 packages audited, 0 vulnerabilities.
- `npm test`: passed: 7 Vitest unit tests, TypeScript `--noEmit`, exact Vite
  production build, and 4 Playwright mobile tests.
- There is no separate lint script in `package.json`; the only available type
  check is included in `npm run build` and passed.
- Exact production build passed. Output: initial JS 35,622 bytes (12,040 gzip),
  CSS 17,769 bytes (4,750 gzip), no font files; all are within the 200 KB / 50
  KB budgets. The mobile WebP is 8,190 bytes.
- Lighthouse 13.4.1 against the fresh production preview: Performance **99**,
  Accessibility **100**, Best Practices **100**, SEO **100**; FCP 1.0 s, LCP
  1.8 s, TBT 80 ms, CLS 0.

## Product exercise

Independent Chromium exercise at 390×844 covered:

- Create INR cash account at ₹100.00; add ₹12.50 spent → ₹87.50.
- Start a check, enter ₹90.00, verify the required discrepancy-note error and
  focus transfer, close with a note, then add ₹5.00 received → ₹95.00.
- Reload persisted ₹95.00; encrypted `.pocket` download contained no account or
  transaction cleartext; a wrong restore password gave “Could not open the
  backup. Check the password and file.”; a confirmed correct-password restore
  returned to ₹95.00.
- Zero and over-precision transaction input were rejected; the two-account free
  limit was exercised by the repository E2E and the Field Kit route is present.
- CSV unit tests cover quoting and atomic rejection; manual invalid CSV testing
  found the calendar defect below.
- Fresh service worker controlled the page; after an online reload, a browser
  offline reload showed the normal ledger plus “Offline · ready”, with no page
  or console errors. Static review confirms `skipWaiting`, `clientsClaim`,
  versioned cache names, and the in-app update notice path. A changed future
  service-worker byte stream was not available to trigger a second update in
  this immutable candidate.

Desktop 1440×1000 dark and mobile 390×844 light had no horizontal overflow.
Keyboard smoke test reached the visible “Skip to ledger” link first; the account
dialog moved focus to the account-name field. The reduced-motion override made
the toast animation duration `0.00001s`. Axe scans found **0 serious/critical**
violations on first-run mobile, populated mobile ledger, desktop dark, and the
repository legal-page scans. The live page had one `h1`, one `main`, `lang=en`,
the expected title, no page/console errors, and no outbound request in the
ordinary free workflow.

## Defects

### High — impossible CSV dates are accepted and normalized

Importing this otherwise valid CSV succeeds:

```csv
date,account,amount,note
2026-02-31,Pocket cash,-1.00,Impossible date
```

The UI announces “1 entry imported.” and displays the entry. JavaScript
`Date.parse('2026-02-31T00:00:00')` normalizes it to 3 March rather than
rejecting it, and `src/csv.ts` uses that check after only a `YYYY-MM-DD`
regular-expression check. This violates the required invalid-input/atomic CSV
recovery behavior and can place a financial transaction on the wrong date.

### High — accepted decimal boundary displays the wrong cent

Creating a USD account with the accepted maximum-safe-minor-unit value
`90071992547409.91` shows **`$90,071,992,547,409.90`**. The `.91` input is
accepted, but `formatMoney()` converts integer minor units to a binary floating
point value before `Intl.NumberFormat`, losing a cent at that valid boundary.
This contradicts the brief’s accurate decimal currency arithmetic constraint.

### Medium — deployed hashed assets are not immutably cached

The live JS and CSS use content hashes, but `/assets/app-BTz1TPZe.js` and
`/assets/app-DMCkwJqI.css` both return `Cache-Control: public,
must-revalidate, max-age=30`, with no `immutable`. The same 30-second policy is
served for icons and static assets. This misses the PWA performance contract’s
long-lived immutable cache policy for hashed assets. HTML and `sw.js` being
short-lived is appropriate; hashed assets should be configured separately by
deployment.

## Deployment, privacy, and response evidence

- Downloaded live `index.html` references exactly
  `app-BTz1TPZe.js` and `app-DMCkwJqI.css`; SHA-256 comparisons of both files
  and `/sw.js` against the fresh local `dist`/candidate were byte-identical.
- The live manifest parses in Chromium with no errors, has standalone display,
  the expected start URL, and 192/512/maskable icons. The live host sends it as
  `application/octet-stream`, but Chromium accepted it.
- The normal browser run made no third-party requests. Source review found no
  analytics, advertising, remote font, cookie, bank, or tracking endpoint; the
  only optional egress is the allowed Sociobot billing verification endpoint
  after a license token is stored.
- Live response headers include HSTS, `nosniff`, and a strict referrer policy.
  No Content-Security-Policy or Permissions-Policy was observed; this is
  recorded as hardening debt, not counted as a release-blocking defect here.

## Required next steps

1. Reject calendar-invalid CSV dates using a strict parsed-component roundtrip
   (and add regression coverage for non-leap 29 February, 31 April, and 31
   February).
2. Preserve decimal formatting without conversion to binary floating point, or
   constrain accepted values to a range that remains exactly format-safe; add a
   boundary test for the declared limit.
3. Configure the static host to return long-lived `immutable` cache headers for
   hashed `/assets/*` files, while retaining revalidation for HTML and the
   service worker.
