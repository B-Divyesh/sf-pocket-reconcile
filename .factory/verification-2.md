# Independent verification 2 — FAIL

Date: 2026-08-28  
Work order: `pocket-reconcile-verify-2`  
Candidate: `f536cc3d2ea94a77fd7e55302aae5d6c14f3c4b0`  
Live URL: <https://pocket-reconcile.sociobot.in/>

## Verdict

**FAIL.** The live deployment is byte-for-byte the candidate, the ordinary
reconcile and recovery workflow works, all checked-in tests pass, and the
accessibility/performance budgets pass. The release nevertheless fails the
acceptance contract for five independently reproduced reasons:

1. The advertised one-time purchase link returns HTTP 404.
2. The Sociobot license-verification endpoint did not rate-limit a 200-request
   parallel burst and returned no `Retry-After` header.
3. The service worker does not precache the executable app shell, so offline
   boot depends on the browser HTTP cache; the exact production preview opens
   an empty app after a first visit when that cache is unavailable.
4. Accepted duplicate account names make CSV imports silently attach records
   to a different account than the selected one.
5. The visible **Undo** and service-worker **Update** toast buttons do nothing.

These are fresh findings. The builder's earlier deployment-only caveat remains
real: checkout is still unavailable in production.

## Clean checkout and repository gates

- Started clean on `main` at exactly
  `f536cc3d2ea94a77fd7e55302aae5d6c14f3c4b0`; `origin/main` resolved to the same
  SHA after `git fetch`.
- `npm ci`: passed; 61 packages installed, 62 audited, 0 vulnerabilities.
- `npm test`: passed.
  - Vitest: 17/17 across money, CSV, backup, and deployment policy.
  - Strict `tsc --noEmit`: passed (`strict` and
    `noUncheckedIndexedAccess` are enabled).
  - Exact Vite production build: passed.
  - Playwright 1.58.2 local production preview: 18/18 at 390×844 and
    1440×1000.
- A separate final `npm run build` passed and produced `dist/`.
- No lint script or lint configuration exists in the repository; there was no
  additional lint command to run.
- `git diff --check`: passed before report changes.

Production output:

| Asset | Raw | Gzip | Budget |
| --- | ---: | ---: | ---: |
| Initial app JS | 36.47 KB | 12.39 KB | ≤ 200 KB |
| App CSS | 17.77 KB | 4.75 KB | ≤ 50 KB |
| Mobile WebP | 8.19 KB | — | ≤ 300 KB |
| Fonts | 0 | — | ≤ 120 KB |

## End-to-end product exercise

An independent live Chromium run at 390×844, separate from the repository
suite, covered the following:

- Created INR cash at ₹100.00; rejected zero and three-decimal transaction
  values; recorded ₹12.50 spent and obtained ₹87.50.
- Counted ₹90.00, observed the +₹2.50 preview, confirmed that a missing
  discrepancy note is rejected and focus moves to the note, then recorded the
  noted check.
- Added ₹5.00 received, obtained ₹95.00, and confirmed IndexedDB persistence
  after reload.
- Confirmed delete copy named the record. The subsequent Undo defect is
  documented below; adding a replacement entry recovered the intended ledger.
- Exported a 156-byte CSV with exact `-12.50` and `5.00` values.
- Exported a 1,340-byte PBKDF2/AES-GCM `.pocket` backup. Account and note
  cleartext were absent. A wrong password produced the expected recovery
  message. After confirmed full erase, the correct password restored account,
  entries, checks, and the ₹95.00 balance.
- Confirmed the two-account free limit and invalid-license recovery message.
- Normal product use produced no console/page errors. Requests stayed on the
  product origin until the explicitly exercised license flow, which contacted
  only `https://api.sociobot.in`.

The deployed repository suite also passed 18/18 against the live URL on both
390px mobile and 1440px desktop. It independently covers exact money upper
bound `90071992547409.91`, impossible calendar dates, keyboard skip/dialog
focus, legal pages, axe, update-notice appearance, and established-cache
offline reload.

## Defects

### High — production checkout is unavailable

The rendered **Buy Field Kit** link correctly targets the required Sociobot
route, but the live route is not enabled:

```text
GET https://api.sociobot.in/api/v1/products/pocket-reconcile/checkout
HTTP/2 404
{"error":"enabled factory product","status":404}
```

Users cannot buy the advertised ₹499 one-time unlock. This is a live
factory/billing registration defect, not a direct-provider integration defect;
the client does not embed Dodo or another payment provider.

### High — required API rate limiting is absent

A fresh burst sent 200 license verification requests in parallel in 1.549s:

```text
200 responses: 200
429 responses: 0
Retry-After values: none
```

No threshold was observed through 200 simultaneous requests. The acceptance
contract requires rapid requests to start returning 429 with `Retry-After`.
This endpoint is hosted by the Sociobot API, so remediation is outside the
static product bundle but remains release-blocking under this work order.

### High — the service worker omits executable shell assets

After first install, `pocket-reconcile-v2-shell` contains HTML, legal pages,
manifest, icons, and artwork, but neither content-hashed app file:

```text
/immutable/app-DUmUUOlO.js
/immutable/app-DMCkwJqI.css
```

On the exact production preview, a fresh visit followed by waiting for a
service-worker controller and going offline (without an extra online reload)
produced zero `<h1>`, an empty `#app`, and two `net::ERR_FAILED` asset errors.
The live host's immutable HTTP cache makes the same immediate happy-path reload
pass, and an established cache after an online reload passes on local and live.
However, Cache Storage itself cannot boot the app if the browser HTTP cache is
empty or evicted. This violates the required precached app shell and makes the
core offline promise dependent on a separate, evictable cache.

### High — duplicate names silently misroute CSV imports

The UI accepted two different accounts both named `Pocket cash`. With the
second account selected, importing:

```csv
date,account,amount,note
2026-08-28,Pocket cash,7.00,Duplicate account probe
```

announced `1 entry imported.`, but IndexedDB showed that the transaction's
`accountId` was the first account's ID, not the selected account's ID. The CSV
parser selects the first case-insensitive name match, while account creation
does not reject or disambiguate duplicate names. Export also carries no stable
account ID, so a CSV round-trip cannot preserve account assignment in this
accepted state. For a financial record tool, silent placement in the wrong
ledger is release-blocking.

### Medium — dynamically rendered toast actions have no click handler

Deleting a ₹5.00 received entry changed ₹95.00 to ₹90.00 and displayed
**Undo**. Clicking Undo left the balance at ₹90.00 and left the toast present.
The same root cause affects the update action: a controlled update simulation
displayed **Update**, but clicking it kept document navigation count at 1 and
the button remained visible.

`bindEvents()` attaches listeners only to `[data-action]` elements present when
the shell renders; `announce()` later inserts these two buttons into the toast
without binding or delegation. Deletion is separately confirmed, but an
offered recovery control must work, and installed clients cannot activate the
offered reload from the update notice.

### Low — a few mobile touch targets are below the 44px product baseline

At 390px, automated geometry measured the brand link at 102×36 CSS px and the
footer Privacy/Terms links at 43×18 and 35×18. Primary form, navigation, and
transaction controls meet the 44px baseline; this is limited to secondary
links.

## Accessibility, layout, and visual checks

- One `<h1>`, one `<main>`, `lang="en"`, correct title, descriptive hero alt,
  semantic labels, and working skip link were confirmed.
- Keyboard traversal showed a designed 3px focus outline; the first focus is
  **Skip to ledger**, and dialog focus/escape return passed on mobile and
  desktop.
- Axe WCAG A/AA scans reported **0 serious/critical findings** on first-run,
  populated ledger, dark/reduced-motion, privacy, and terms states. A fresh
  populated dark mobile scan had no axe violations at any impact.
- Light 390×844 and dark 1440×1000 had no horizontal overflow. Manual screenshot
  review found a clear primary task, readable hierarchy, and the documented
  notebook-specific visual system.
- With `prefers-reduced-motion: reduce`, animation and transition durations
  computed to `0.00001s`.
- Lighthouse 13.0.1 live mobile: Performance **98**, Accessibility **100**,
  Best Practices **100**, SEO **100**; FCP 1.0s, LCP 1.3s, TBT 170ms, CLS 0.

## Privacy, policy, PWA, and deployment identity

- Static and built-source review found no analytics, ads, bank connections,
  remote fonts, third-party scripts, or runtime endpoints besides the allowed
  Sociobot billing base. Data is in IndexedDB/localStorage; the encrypted
  backup and CSV ownership paths work.
- `/privacy/` and `/terms/` return 200 and match the candidate. `README.md`, MIT
  `LICENSE`, researched brief, design thesis, and asset provenance are present.
- Manifest is valid standalone metadata with versioned `start_url`, 192px,
  512px, and 512px maskable PNGs. The live manifest MIME is
  `application/manifest+json`.
- `sw.js` is `no-cache`; content-hashed `/immutable/*` JS/CSS is
  `public, max-age=31536000, immutable`; HTML revalidates after 30 seconds.
- Responses include CSP, Permissions-Policy, HSTS, strict referrer policy, and
  `nosniff`. CSP limits network access to self plus the Sociobot billing API.
- The service worker uses versioned `pocket-reconcile-v2` caches,
  `skipWaiting()`, `clients.claim()`, and deletes stale cache names. Its missing
  JS/CSS precache and broken update action are recorded above.
- All 18 publicly deployable files in fresh local `dist/` matched production by
  SHA-256; there were 18 matches and 0 mismatches. Representative identities:
  HTML `de4b1c…cd1a`, JS `f6942b…48da`, CSS `113eb3…0f51`, service worker
  `19a263…f76`.
- Sign-in/Entra checks are not applicable: the product has no sign-in. Backend
  concurrency, persistence, and health/build endpoints are not applicable to
  this static PWA. Package/consumer installation is not applicable because it
  is not a library or CLI.

## Required release actions

1. Enable/register the production checkout for `pocket-reconcile` and verify a
   successful hosted-checkout redirect and return URL.
2. Add and prove rate limiting on the verification API: 429 plus
   `Retry-After` under a documented threshold.
3. Precache the hashed JS/CSS as part of the versioned service-worker shell and
   test a first-visit offline boot without relying on the browser HTTP cache.
4. Reject/disambiguate duplicate account names or include a stable account key
   in CSV import/export; regression-test account assignment.
5. Bind delegated handlers for toast actions and test that Undo restores the
   row/balance and Update actually reloads.
6. Enlarge the remaining small mobile link targets.
