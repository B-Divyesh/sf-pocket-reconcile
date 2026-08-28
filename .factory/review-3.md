# Adversarial first-read review 3 — FAIL

- Product: Pocket Reconcile
- Live URL: <https://pocket-reconcile.sociobot.in>
- Reviewed: 2026-08-28
- Source and live release: `51c2b10ee9aba4493700cf517cff7215a1759b4a`
- Viewports: fresh Chromium contexts at 390×844 and 1440×1000
- Verdict: **FAIL.** No blocking defect was found, but six minor findings remain.
  This review may pass only with zero findings and no unlisted claim.

## Cold first read

Before scrolling, I understood the page as follows at both widths:

- What it does: records changes and compares cash and card balances.
- Who it is for: privacy-minded budgeters tracking a few accounts from a
  phone.
- What to click first: **Try it with sample data**.

The exact first-screen text that supplied those answers was:

> “Reconcile cash and card balances.”
>
> “For privacy-minded budgeters who track a few accounts from a phone.”
>
> “Try it with sample data”

This passes the first-screen clarity check. At 390×844, the h1, audience,
both actions, sample explanation, and all three facts fit without scrolling.
The sample action has the filled primary treatment. On desktop, both actions
measure 46 CSS pixels high.

## Findings

### F-3-1 — minor — README states an inaccurate Node.js requirement

- Exact quote/location: README, Run locally: “Requires Node.js 20 or newer.”
- Verification: the pinned Vite 7.3.6 package declares
  `^20.19.0 || >=22.12.0`. The README wording includes unsupported Node 20
  releases and Node 21.
- Why this fails: a maintainer following the stated prerequisite can choose a
  runtime that the build tool rejects.
- Concrete fix: write “Requires Node.js 20.19+ or 22.12+.” Add the same range
  to `package.json#engines.node` so installation checks the documented rule.

### F-3-2 — minor — legacy duplicate-name behavior is an unlisted claim

- Exact quote/location: README, CSV format: “It rejects ambiguous names from
  older backups instead of guessing an account.”
- Verification: `.factory/claims.json` has no entry for this behavior. A unit
  test in `tests/csv.test.ts` covers it, but no uniquely tagged claim test runs
  the behavior through the demo sandbox.
- Why this fails: the sentence is a behavior a user can rely on, and the
  claims contract requires it to have one listed `@claim:<id>` test.
- Concrete fix: add a `legacy-duplicate-csv` claim. Its demo test should seed
  two legacy accounts with normalized duplicate names, import one CSV row,
  show the ambiguity error, and confirm that no row was saved. Otherwise
  remove the sentence.

### F-3-3 — minor — the README makes an unlisted future-restore assertion

- Exact quote/location: README, Data and recovery: “The encrypted backup
  includes a format version for future restores.”
- Verification: no claim entry names the backup version. The untagged unit
  round-trip checks current version 1, while the words “for future restores”
  cannot be established by a current-version round-trip.
- Why this fails: the sentence presents future recovery value without a
  listed, observable claim.
- Concrete fix: delete the sentence. If exposing the format number is useful,
  write “The encrypted backup includes a version number,” add a
  `backup-format-version` claim, and assert the downloaded envelope’s version
  in its one tagged demo test.

### F-3-4 — minor — “portable” is vague and is not the tested CSV result

- Exact quote/location: README, Data and recovery: “CSV is portable but does
  not include opening balances or balance-check history.”
- Why this fails: “portable” does not name where the file works, and no claim
  test demonstrates compatibility with another tool. The useful, tested fact
  is which rows the CSV includes and omits.
- Concrete fix: write “CSV files include entries, but omit opening balances
  and balance-check history.” This matches the existing `csv-export` claim
  and test.

### F-3-5 — minor — a demo heading does not name its section

- Exact quote/location: `/demo`, quick-entry h2: “What changed?”
- Why this fails: heard in the heading outline, “what” has no subject. The
  heading makes a screen-reader user infer that this is the add-entry form.
- Concrete fix: use “Add a ledger entry”. Keep “Quick entry” only as a visual
  eyebrow if desired.

### F-3-6 — minor — dialogs are unnamed and destructive buttons omit the result

- Exact quote/location: the account and confirmation `<dialog>` elements have
  no `aria-label` or `aria-labelledby`. In an entry-delete confirmation, focus
  lands on “Delete”; the other action is “Keep it”.
- Verification: on the live site,
  `getByRole('dialog', {name: 'Add an account'})` and
  `getByRole('dialog', {name: 'Delete this entry?'})` both return zero. The
  focused destructive control has accessible name “Delete”.
- Why this fails: a screen reader receives an unnamed dialog and a focused
  action that does not identify its target. “Keep it” also violates the
  result-naming button rule.
- Concrete fix: connect each dialog to its h2 with `aria-labelledby`. Set the
  confirmation actions per operation: **Delete entry / Keep entry**,
  **Delete account / Keep account**, and **Erase ledger / Keep ledger**. Add a
  browser test for each dialog’s accessible name and focused action name.

## Copy audit

Counts are whitespace-delimited rendered words. Headings, feature fragments,
and primary actions are included because they stand alone. Commands and the
CSV code block are data rather than sentences. No line exceeds 22 words, and
no banned marketing term occurs.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Balance checks for a few accounts | 6 | Pass |
| Reconcile cash and card balances. | 5 | Pass |
| For privacy-minded budgeters who track a few accounts from a phone. | 11 | Pass |
| Try it with sample data | 5 | Pass |
| Create my first account | 4 | Pass |
| The sample opens a working ledger. | 6 | Pass |
| It never mixes with your records. | 6 | Pass |
| Works offline after first visit | 5 | Pass |
| No bank login | 3 | Pass |
| Export CSV or encrypted backup | 5 | Pass |
| How it works | 3 | Pass |
| Set the starting balance. | 4 | Pass |
| Create each cash, card, or wallet account by entering what it holds now. | 13 | Pass |
| Record each change. | 3 | Pass |
| Add money spent or received with a date and a short note. | 12 | Pass |
| Count and compare. | 3 | Pass |
| Enter the balance you see. | 5 | Pass |
| Add a note when the totals differ. | 7 | Pass |
| What it does not do | 5 | Pass |
| Pocket Reconcile does not connect to banks, sync records between devices, or give financial advice. | 15 | Pass |
| Your browser holds the working ledger. | 6 | Pass |
| Export a backup before clearing browser data or moving devices. | 10 | Pass |
| Private balance checks for a few accounts. | 7 | Pass |

Landing metadata also passes: the title “Pocket Reconcile — private, offline
balance checks” has 6 words; the description “A private, offline ledger for
reconciling cash and card balances.” has 10; the social description
“Reconcile cash and card balances in a local ledger that works offline.” has
12. The header’s Ledger, Demo, Privacy, and Terms links and the numbered
section controls are destination labels, not outcome actions. The visible
theme control is named “Change color theme”.

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Pocket Reconcile | 2 | Pass |
| Pocket Reconcile helps privacy-minded budgeters reconcile cash, cards, and a few manual entries from a phone. | 16 | Pass |
| Records remain in this browser; no bank login is required. | 10 | Pass |
| It works offline after the first visit and exports ledger entries as CSV or a password-encrypted backup. | 17 | Pass |
| What v1 includes | 3 | Pass |
| Local cash, card, or other accounts with spent and received entries | 11 | Pass |
| Exact balance checks, plus a required note when the totals differ | 11 | Pass |
| CSV entry import and export, with every row checked before import | 11 | Pass |
| Password-encrypted export and full restore of accounts, entries, and checks | 10 | Pass |
| Delete an entry with Undo, or erase the entire ledger after confirmation | 12 | Pass |
| Installable web app, offline reload, and an update prompt | 9 | Pass |
| It stores each supported amount in the currency’s smallest unit. | 10 | Pass |
| Pocket Reconcile is a record-keeping utility, not financial advice, a bank feed, or an accounting system. | 16 | Pass |
| Try the sample ledger | 4 | Pass |
| Open https://pocket-reconcile.sociobot.in/demo or select Try it with sample data on the first screen. | 13 | Pass |
| The sample ledger includes two accounts, three entries, and a completed check. | 12 | Pass |
| Sample data never mixes with personal records; use Reset demo to restore it or Start for real to discard it. | 20 | Pass |
| Run locally | 2 | Pass |
| Requires Node.js 20 or newer. | 5 | F-3-1 |
| Then open the local URL printed by Vite. | 8 | Pass |
| Service-worker behavior is enabled in the production preview, not the development server. | 12 | Pass |
| Test and build | 3 | Pass |
| npm test runs unit tests, strict TypeScript, a production build, and Playwright. | 12 | Pass |
| Browser sizes are 390×844 mobile and 1440×1000 desktop. | 8 | Pass |
| The suite checks accessibility, keyboard use, outside network requests, updates, offline use, route history, and claims. | 16 | Pass |
| Playwright 1.58.2 is pinned, and its Chromium browser must be available. | 11 | Pass |
| Playwright builds the production site automatically from a clean checkout. | 10 | Pass |
| npm run build writes the static product to ./dist. | 9 | Pass |
| The output has dist/index.html at its root. | 7 | Pass |
| Set PLAYWRIGHT_BASE_URL to test a deployed site. | 7 | Pass |
| CSV format | 2 | Pass |
| Exports use this header: | 4 | Pass |
| Imports require date, account, amount, and note. | 7 | Pass |
| Dates use YYYY-MM-DD. | 3 | Pass |
| Account names must already exist. | 5 | Pass |
| Names stay unique regardless of case or repeated spaces. | 9 | Pass |
| Negative amounts are spending, and positive amounts are money received. | 10 | Pass |
| Import checks every row before writing any entry. | 8 | Pass |
| It rejects ambiguous names from older backups instead of guessing an account. | 12 | F-3-2 |
| Data and recovery | 3 | Pass |
| Records remain in this browser. | 5 | Pass |
| A full .pocket backup contains accounts, entries, and balance checks. | 10 | Pass |
| The encrypted backup includes a format version for future restores. | 10 | F-3-3 |
| Its password is not stored and cannot be recovered. | 9 | Pass |
| CSV is portable but does not include opening balances or balance-check history. | 12 | F-3-4 |
| See the design thesis, demo details, claim checks, privacy policy, terms, and factory handoff. | 14 | Pass |
| Deploy | 1 | Pass |
| Deploy the contents of dist/ as a static site. | 9 | Pass |
| The included Azure configuration caches content-hashed /immutable/* files for one year. | 11 | Pass |
| It keeps sw.js revalidated, sets the manifest type, and applies the response security policy. | 14 | Pass |
| The host should serve directory indexes for /privacy/ and /terms/. | 10 | Pass |
| Do not configure an SPA catch-all over those pages. | 9 | Pass; maintainer term |
| The factory owns DNS and deployment infrastructure. | 7 | Pass |
| License | 1 | Pass |
| MIT. | 1 | Pass |
| Generated project artwork is original to Pocket Reconcile and covered by the MIT license. | 14 | Pass |
| Its prompt and provenance are in .factory/design.md and assets/src/pressed-ledger.prompt.json. | 9 | Pass |

### Terminology

| Concept | One term | Result |
| --- | --- | --- |
| Saved financial container | account | Pass |
| Dated balance change | entry | Pass |
| Expected-versus-observed comparison | balance check | Pass |
| Isolated realistic example | sample ledger | Pass |
| Password-protected full export | backup | Pass |

The landing and README consistently use these terms. F-3-5 and F-3-6 are
additional demo/application copy findings.

## Demo and sandbox

The one-click path passes. Selecting **Try it with sample data** from a fresh
landing page opens `/?demo=1`. The first 390×844 screen already shows:

- “Demo — sample data, nothing is saved.”
- **Reset demo** and **Start for real**
- the “Weekend cash” account and ₹104.50 expected balance
- “Since your Jan 4, 2026 check”
- the “Daily card” account option
- the current-balance-check panel

The sample contains two accounts, three dated entries, and one completed
check. The live claim flow added a temporary entry, reset to `[2, 3, 1]`,
changed a demo preference, and exited. Exit removed
`demo:pocket-reconcile` and every `demo:` key. The seeded personal account and
preference remained byte-for-byte unchanged.

The ordinary live demo flow requested only
`https://pocket-reconcile.sociobot.in`. With the browser HTTP cache disabled,
the service-worker-controlled demo reloaded offline and showed
“Offline · ready”. No demo operation reached the personal IndexedDB or
unprefixed preference keys.

## Claims and test evidence

A fresh depth-one clone at
`/tmp/pocket-reconcile-review3-clean-ajMjo1/repo` resolved to the reviewed
commit. `npm ci` installed 61 packages with zero audit vulnerabilities. Every
exact command in `.factory/claims.json` was run separately; each passed in the
mobile and desktop Chromium projects.

| Claim ID | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `core-ledger` | PASS |
| `discrepancy-note` | PASS |
| `offline-reload` | PASS |
| `csv-export` | PASS |
| `csv-import` | PASS |
| `csv-amount-signs` | PASS |
| `atomic-csv-import` | PASS |
| `encrypted-backup` | PASS |
| `backup-restore` | PASS |
| `backup-password-recovery` | PASS |
| `entry-delete` | PASS |
| `erase-ledger` | PASS |
| `pwa-install-update` | PASS |
| `local-records` | PASS |
| `account-name-uniqueness` | PASS |
| `exact-decimals` | PASS |

Each registered ID occurs once as an `@claim:<id>` tag. The clean clone’s
complete `npm test` passed 22 unit/deployment checks, its production build,
and 64 Playwright checks. The same 64 checks passed against production.
F-3-2 and F-3-3 are unlisted claims; F-3-4 removes an unmeasured adjective
from an otherwise listed CSV result.

## Earlier finding verification

Every earlier review, polish report, and handoff was read. Each earlier
finding was checked on production and in the current source rather than
accepted from its closure note.

| Earlier ID | Current verification |
| --- | --- |
| F-1-1 | Fixed: no time-to-complete promise remains in live hero or metadata. |
| F-1-2 | Fixed: “Observe · record · reconcile” is absent. |
| F-1-3 | Fixed: “Three field notes” is absent. |
| F-1-4 | Fixed: the landing “Clear limits” label is absent. |
| F-1-5 | Fixed: visitor copy uses **entry**, not transaction, for a dated change. |
| F-1-6 | Fixed: `account-name-uniqueness` is registered and its exact command passes. |
| F-1-7 | Fixed: route h1s are “Privacy policy”, “Terms of use”, and “Page not found”. |
| F-1-8 | Fixed: Ledger, Demo, Privacy, and Terms appear in every checked primary header. |
| F-1-9 | Fixed: artwork license and provenance are separate short sentences. |
| F-1-10 | Fixed: `csv-amount-signs` is registered and passes for both signs. |
| F-1-11 | Fixed: the maintainer-recovery assurance remains removed. |
| F-2-1 | Fixed: live exit removes the demo database and all demo keys while preserving seeded personal data. |
| F-2-2 | Fixed: the two desktop first-screen actions are both 46 CSS pixels high. |
| F-2-3 | Fixed: the balance-check h2 is “Check the current balance”. |
| F-2-4 | Fixed: the quoted field-guide lore is absent from live copy and source. |
| F-2-5 | Fixed: empty states name ledger entries and balance checks and give a next action. |
| F-2-6 | Fixed: README now uses the direct delete/erase sentence. |
| F-2-7 | Fixed: README says “Installable web app”. |
| F-2-8 | Fixed: README says accessibility and outside network requests. |
| F-2-9 | The old JSON-envelope jargon is gone; the replacement has a new claims issue in F-3-3. |
| F-2-10 | Fixed: copy says currency’s smallest unit and the test covers all seven supported currencies. |
| F-2-11 | Fixed: all HTML routes link the verified 180×180 Apple touch icon. |

No earlier finding is repeated under its old ID. F-3-3 applies to the new
replacement text introduced while closing F-2-9.

## Structure, links, identity, and accessibility

- `/`, `/demo`, the three demo screen deep links, `/privacy/`, `/terms/`,
  `/404.html`, and `/offline.html` return 200. A deliberately unknown URL
  returns the designed 404 document with HTTP 404.
- Every checked document has `lang="en"`, one h1, one main landmark, its own
  title and description, a canonical URL, Open Graph/Twitter metadata, SVG
  favicon, and 180×180 Apple touch icon. The social image is 1200×630.
- Browser Back/Forward restores the demo section URL, title, h1 focus, and
  polite route announcement. Direct demo screen URLs survive reload.
- The crawl found no dead HTTP links. The two email links are explicit
  `mailto:` links. `robots.txt`, `sitemap.xml`, the manifest, and icon assets
  return 200 with the expected content types.
- The live root emitted no console or page errors. The factory URL verifier
  reported one h1, `lang=en`, one main, complete image alt text, labeled
  buttons, and a 588 ms load.
- Full WCAG 2 A/AA Axe scans of root, demo, Privacy, Terms, 404, and offline
  pages found zero violations in both light and dark/reduced-motion contexts.
  F-3-6 is a manual dialog-name and action-copy failure not reported by Axe.
- The production build emits 12.57 KiB gzip JavaScript and 5.18 KiB gzip CSS.
  No third-party font or script loads.
- The warm paper palette, pressed-fern artwork, ruled ledger surfaces,
  serif/sans pairing, clipped controls, and restrained motion are specific to
  this manual reconciliation job. The live site is not a generic SaaS
  template and matches `.factory/design.md`.

## Missed leverage

No finding. CSV import/export and a password-encrypted full backup implement
the transfer and recovery work implied by the brief. Automatic sync would
conflict with the explicit local-only model. An AI step would require sending
financial text and managing a key for a deterministic balance comparison; it
would not improve the core job enough to justify that cost or privacy change.

## What would make this perfect

Correct and enforce the Node version range; register and test the two unlisted
README claims or remove them; replace “portable” with the tested CSV result;
rename “What changed?” to identify the add-entry form; and give both dialogs
accessible names plus target-specific confirmation actions. Then rerun every
claim command, the full clean and live suites, the opened-dialog accessibility
checks, and the copy/claim cross-check. A later review can pass only if that
run finds nothing else.
