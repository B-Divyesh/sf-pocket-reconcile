# Independent verification 5 — PASS

- **Candidate:** `9fd2007909af36c532cfe49590c8df3977119281`
- **Live URL:** <https://pocket-reconcile.sociobot.in>
- **Run:** 2026-08-28, clean checkout
- **Verdict:** **PASS — release candidate accepted.**
- **Product-code changes:** none; this verification adds only factory records.

The live static artifact is the candidate product build. The only change after
the shipped-product commit `6bd1c02` is factory handoff documentation; a fresh
build of this candidate has byte-identical deployed application artifacts.

## Mandatory first checks

### Claims — PASS

Before the general suite, every exact command in `.factory/claims.json` was run
from the clean checkout after `npm ci`. Each command starts the product through
its `preview:test` demo entry point; all passed in both 390×844 mobile and
1440×1000 desktop Chromium (30 passing claim assertions total).

| Claim IDs (all PASS) | Exact command |
| --- | --- |
| `demo-sandbox`, `core-ledger`, `discrepancy-note`, `offline-reload`, `csv-export`, `csv-import`, `atomic-csv-import`, `encrypted-backup`, `backup-restore`, `backup-password-recovery`, `entry-delete`, `erase-ledger`, `pwa-install-update`, `local-records`, `exact-decimals` | `npm run test:claims -- --grep @claim:<id>` |

The manifest contains 15 claims and static inspection found each corresponding
`@claim:<id>` tag exactly once. The demo is directly available at `/demo`, uses
the `demo:pocket-reconcile` IndexedDB namespace and `demo:` preference keys,
and has persistent Reset demo / Start for real controls.

### Cold first-read — PASS

A fresh browser profile opened the live root with no prior storage. The first
screen plainly says:

> Reconcile cash and card balances.
>
> For privacy-minded budgeters who track a few accounts from a phone.
>
> Try it with sample data

It answers what it does, who it is for, and what to click first. The action is
one click and says that the sample opens a working ledger without mixing with
personal records. At 390px it is a visibly primary 44px+ action; the sample
opens two accounts, three transactions, a completed balance check, and the
demo banner.

## Clean-checkout quality gates

- `npm ci`: PASS; 62 packages installed/audited, 0 vulnerabilities.
- `npm test`: PASS; 21/21 Vitest tests, strict TypeScript production build,
  and 56/56 Playwright tests.
- `npm run lint`: PASS (`tsc --noEmit --pretty false`).
- `npm run build`: PASS; produces `dist/`.
- `PLAYWRIGHT_BASE_URL=https://pocket-reconcile.sociobot.in npm run test:e2e`:
  PASS; 56/56 against the live deployment at 390×844 and 1440×1000.
- Initial output: JavaScript 36,833 bytes raw / 12,401 bytes gzip, CSS 19,514
  bytes raw / 5,093 bytes gzip, no web fonts, and 390px hero WebP 8,190 bytes.
  These are within the static PWA budgets.

## Product and recovery evidence

The live suite and independent Playwright smoke flow exercised the useful job
end-to-end: create an account, record a transaction, complete an exact balance
check, inspect its history, import/export CSV, export/restore an encrypted
backup, delete and Undo an entry, and erase data after confirmation.

Boundary and recovery checks passed: the maximum accepted USD amount
`$90,071,992,547,409.91` remains cent-exact; duplicate normalized account names
and impossible CSV dates are rejected without changing records; a mixed valid /
invalid CSV imports no rows; an INR value of `0.001` explains the two-decimal
limit; correcting it to `1.25` records the entry; a mismatched balance check
focuses and requires its discrepancy note; a wrong backup password fails safely
and the original password restores the complete ledger.

## Live browser, privacy, accessibility, and PWA evidence

- The fresh live request log through demo entry, correction, discrepancy note,
  screen navigation, and offline reload contained only
  `https://pocket-reconcile.sociobot.in`. There were no analytics, bank,
  third-party font, script, or login requests; console and page error logs were
  empty.
- Demo data stayed in `demo:pocket-reconcile`; the full suite verifies that
  Reset restores the sample and Start for real deletes that demo database
  without changing real records.
- `/opt/fleet/lib/verify-url.sh https://pocket-reconcile.sociobot.in <tempdir>`
  passed: HTTP 200, title, `lang=en`, exactly one `h1`, a `main`, complete image
  alt attributes, labeled buttons, and zero browser errors. Its live page load
  measured 676 ms in this run.
- Playwright axe checks found zero serious or critical WCAG 2 A/AA findings on
  the landing, ledger, dark treatment, Privacy, and Terms pages. The live suite
  also passed keyboard skip-link/dialog Escape behavior, focus routing,
  44px mobile targets, Back/Forward, and direct section reloads.
- With reduced motion requested, the live page reported a `0.01ms` button
  transition. No horizontal overflow occurred in the 390px suite.
- The live service worker was active and controlled the demo, with a versioned
  shell cache (`pocket-reconcile-c58978edbd41-shell`). After it controlled the
  page, offline reload showed the demo’s heading and `Offline · ready`.
  The explicit update-action claim also passed on the live deployment by
  simulating a waiting installed worker and confirming the visible Update action
  reloads the document.

## Deployment identity and HTTP policy

Local production files and live responses have matching SHA-256 digests:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `aa1e9627534baa485141a2d5952387ad20991a1213924b677f526563f9f702f3` |
| `demo/index.html` | `8b7d98dba0a022ffb96099291721e430abd31cccff9d1f822deb1b84aad0f206` |
| `sw.js` | `5c0cc75bcf8087edda493f72004331f1092482e5599d97b9bcc13113165f7999` |
| application JavaScript | `2d6c2a860abada08b4e60fb16b39acce0b42b444d04e3a3ff95efb5e024db7f4` |
| application CSS | `cdb78363ff6e8a8e57829e01b058ba8cff40e65b1323a1b61a66fbd52c0182a1` |

`/`, `/demo`, `/demo/`, `/privacy/`, `/terms/`, `/offline.html`, and the
manifest return 200; an unknown route returns the styled 404 with HTTP 404.
Responses provide HSTS, a same-origin CSP, `nosniff`, strict referrer policy,
and a restrictive Permissions-Policy. HTML revalidates after 30 seconds,
`sw.js` is `no-cache`, and hashed JavaScript is immutable for one year.

This is a static, local-first PWA: it has no runtime API, backend persistence,
sign-in, or product-unlock endpoint. Thus API concurrency/rate-limit (429 /
Retry-After), Entra tenant, package-consumer, and server health checks do not
apply. The researched one-time purchase is not offered because the earlier
Sociobot checkout endpoint was unavailable; the shipped free product neither
requires nor advertises a broken payment flow.

## Defects by severity

None confirmed. No release-blocking defects were found in this candidate.

