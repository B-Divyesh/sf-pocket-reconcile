# Adversarial first-read review 1 — FAIL

- **Product:** Pocket Reconcile
- **Live URL:** <https://pocket-reconcile.sociobot.in>
- **Date:** 2026-08-28
- **Viewport checks:** fresh Chromium contexts at 390×844 and 1440×1000
- **Verdict:** **FAIL.** The core product and demo are usable, but eleven minor findings remain. This work order permits `PASS` only with zero findings.

## Cold first read

Before scrolling, both fresh viewports said:

> “Reconcile cash and card balances.”
>
> “For privacy-minded budgeters who track a few accounts from a phone.”
>
> “Try it with sample data”

The job is to compare and close out a few cash/card balances. It is for a
privacy-minded person tracking a few accounts on a phone. The first action is
to try the populated sample ledger. This passes the first-screen clarity
check. The sample action is a visible, result-naming link and the mobile
first screen gives it the filled primary treatment.

## Findings

### F-1-1 — minor — unlisted time promise

- **Location / quote:** home eyebrow, “A two-minute balance check”; home meta
  description, “A private, offline field notebook for reconciling cash and
  card balances in minutes.”
- **Why this fails:** Both phrases are quantitative time promises. No
  `two-minute` or time-to-reconcile entry exists in `.factory/claims.json`, so
  a visitor cannot see sandbox proof for the promise.
- **Concrete fix:** Replace the eyebrow with “Balance checks for a few
  accounts” and remove “in minutes” from the description; alternatively add
  one time claim with a reproducible demo test and a defined measurement.

### F-1-2 — minor — landing slogan does not name its content

- **Location / quote:** illustration caption, “Observe · record ·
  reconcile”.
- **Why this fails:** This generic slogan does not tell a reader what the
  illustrated section contains and could describe many unrelated record tools.
- **Concrete fix:** Delete the caption. The image alt already describes the
  illustration.

### F-1-3 — minor — landing label is a mood heading

- **Location / quote:** above “How it works”, “Three field notes”.
- **Why this fails:** It does not name the section and requires the following
  heading to supply its meaning.
- **Concrete fix:** Delete the label, or replace it with “Three steps”.

### F-1-4 — minor — landing label is not an informative heading

- **Location / quote:** above “What it does not do”, “Clear limits”.
- **Why this fails:** “Clear limits” is an assertion rather than the section
  name, so it carries no usable detail out of context.
- **Concrete fix:** Delete the label. “What it does not do” already names the
  section plainly.

### F-1-5 — minor — README uses inconsistent names for the same thing

- **Location / quote:** README, “CSV transaction import and export”; “The
  sample ledger includes two accounts, three transactions, and a completed
  check.” The UI, terminology table, and claims use **entry** for this saved,
  dated balance change.
- **Why this fails:** A new visitor has to infer whether a transaction and an
  entry differ. The attached terminology contract says one concept gets one
  word.
- **Concrete fix:** Use “CSV entry import and export” and “three entries”, or
  deliberately change the UI, audit, claims, and README to use
  **transaction** everywhere.

### F-1-6 — minor — README claim is not registered

- **Location / quote:** README CSV format, “Names stay unique regardless of
  case or repeated spaces.”
- **Why this fails:** This is a behavioral promise a reader may rely on, but
  there is no corresponding entry in `.factory/claims.json`. An untagged E2E
  test exercises it, which does not satisfy the one-claim/one-`@claim:`
  contract.
- **Concrete fix:** Add an `account-name-uniqueness` claim and one
  `@claim:account-name-uniqueness` demo test that tries case and whitespace
  variants; otherwise remove the sentence.

### F-1-7 — minor — legal and 404 h1s are metaphorical rather than route names

- **Location / quote:** `/privacy/`, “Your ledger stays in your pocket.”;
  `/terms/`, “A small tool, with clear limits.”; `/404.html`, “That page is
  not in this notebook.”
- **Why this fails:** These headings do not state the page purpose when heard
  without surrounding context. This conflicts with the plain-word heading
  rule and makes route landmarks less direct for screen-reader users.
- **Concrete fix:** Use “Privacy policy”, “Terms of use”, and “Page not
  found”, respectively. Keep the current explanatory prose below each h1 if
  useful.

### F-1-8 — minor — application routes use a different header structure

- **Location / quote:** `/` and `/demo` show the wordmark, connection state,
  theme button, and numbered application buttons. `/privacy/`, `/terms/`, and
  `/404.html` instead show the standard text navigation including “Demo” and
  “Privacy”.
- **Why this fails:** The header is not consistent across real routes as
  required by the site structure. A person entering the app has no header
  route to Privacy or the demo; those links appear only in the footer.
- **Concrete fix:** Use one shared header: wordmark home plus up to four
  visible links/buttons for Ledger, Demo, Privacy, and (if retained) Terms.
  Keep the numbered in-product section controls as a secondary navigation.

### F-1-9 — minor — README license sentence exceeds the copy limit

- **Location / quote:** README License, “Generated project artwork is original
  to Pocket Reconcile and is covered by the same license; its prompt and
  provenance are recorded in `.factory/design.md` and
  `assets/src/pressed-ledger.prompt.json`.” (25 words)
- **Why this fails:** The sentence exceeds the 22-word hard cap and joins
  ownership and provenance into one dense statement.
- **Concrete fix:** Split it: “Generated project artwork is original to Pocket
  Reconcile and covered by the MIT license. Its prompt and provenance are in
  `.factory/design.md` and `assets/src/pressed-ledger.prompt.json`.”

### F-1-10 — minor — CSV sign behavior is an unlisted promise

- **Location / quote:** README CSV format, “Negative amounts are spending, and
  positive amounts are money received.”
- **Why this fails:** This tells a visitor how importing a row will change a
  ledger. No claim entry or tagged demo test asserts both signs and their
  resulting balance changes.
- **Concrete fix:** Add a `csv-amount-signs` claim with a
  `@claim:csv-amount-signs` demo test for one negative and one positive import,
  or remove the promise and replace it with a neutral link to the CSV format.

### F-1-11 — minor — maintainer recovery assurance is unlisted

- **Location / quote:** README Data and recovery, “Browser records are not
  synced or recoverable by the maintainers.”
- **Why this fails:** `local-records` proves no sync in the tested flow, but it
  does not expressly register or prove the separate recovery assurance.
- **Concrete fix:** Make this one listed local-storage/no-server claim with a
  demo request-log and storage test, or shorten the sentence to the already
  registered “Records remain in this browser.”

## Copy audit

All visible landing and README copy was counted manually from the live page
and committed source. Fragments such as button labels, headings, and list
items are included because they are presented as standalone copy. F-1-9 is
the sole line above the 22-word cap. Findings F-1-1 through F-1-6 and F-1-9
through F-1-11 identify flagged lines; technical terms in run/test
instructions are retained as necessary developer documentation.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| A two-minute balance check | 4 | F-1-1 |
| Reconcile cash and card balances. | 5 | Pass |
| For privacy-minded budgeters who track a few accounts from a phone. | 11 | Pass |
| Try it with sample data | 5 | Pass |
| Create my first account | 5 | Pass |
| The sample opens a working ledger. | 6 | Pass |
| It never mixes with your records. | 7 | Pass |
| Works offline after first visit | 5 | Pass |
| No bank login | 3 | Pass |
| Export CSV or encrypted backup | 5 | Pass |
| Observe · record · reconcile | 3 | F-1-2 |
| Three field notes | 3 | F-1-3 |
| How it works | 3 | Pass |
| Set the starting balance. | 4 | Pass |
| Create each cash, card, or wallet account by entering what it holds now. | 13 | Pass |
| Record each change. | 3 | Pass |
| Add money spent or received with a date and a short note. | 12 | Pass |
| Count and compare. | 3 | Pass |
| Enter the balance you see. | 5 | Pass |
| Add a note when the totals differ. | 7 | Pass |
| Clear limits | 2 | F-1-4 |
| What it does not do | 5 | Pass |
| Pocket Reconcile does not connect to banks, sync records between devices, or give financial advice. | 15 | Pass |
| Your browser holds the working ledger. | 6 | Pass |
| Export a backup before clearing browser data or moving devices. | 10 | Pass |
| Private balance checks for a few accounts. | 7 | Pass |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Pocket Reconcile helps privacy-minded budgeters reconcile cash, cards, and a few manual transactions from a phone. | 16 | Pass |
| Records remain in this browser; no bank login is required. | 10 | Pass |
| It works offline after the first visit and exports ledger entries as CSV or a password-encrypted backup. | 17 | Pass |
| Local cash, card, or other accounts with spent and received entries | 10 | Pass |
| Exact balance checks, plus a required note when the totals differ | 10 | Pass |
| CSV transaction import and export, with every row checked before import | 10 | F-1-5 |
| Password-encrypted export and full restore of accounts, entries, and checks | 10 | Pass |
| Confirmed entry deletion with Undo, plus confirmed whole-ledger erasure | 9 | Pass |
| Standalone PWA installation, offline reload, and an update prompt | 8 | Pass |
| It keeps supported money amounts in exact whole cents. | 9 | Pass |
| Pocket Reconcile is a record-keeping utility, not financial advice, a bank feed, or an accounting system. | 14 | Pass |
| Open <https://pocket-reconcile.sociobot.in/demo> or select Try it with sample data on the first screen. | 13 | Pass |
| The sample ledger includes two accounts, three transactions, and a completed check. | 11 | F-1-5 |
| Sample data never mixes with personal records; use Reset demo to restore it or Start for real to discard it. | 18 | Pass |
| Requires Node.js 20 or newer. | 5 | Pass |
| Then open the local URL printed by Vite. | 9 | Pass |
| Service-worker behavior is enabled in the production preview, not the development server. | 11 | Pass |
| npm test runs unit tests, strict TypeScript, a production build, and Playwright. | 12 | Pass |
| Browser sizes are 390×844 mobile and 1440×1000 desktop. | 8 | Pass |
| The suite checks axe, keyboard use, privacy egress, updates, offline use, route history, and claims. | 14 | Pass |
| Playwright 1.58.2 is pinned, and its Chromium browser must be available. | 11 | Pass |
| Playwright builds the production site automatically from a clean checkout. | 10 | Pass |
| npm run build writes the static product to ./dist. | 10 | Pass |
| The output has dist/index.html at its root. | 8 | Pass |
| Set PLAYWRIGHT_BASE_URL to test a deployed site. | 8 | Pass |
| Exports use this header: | 4 | Pass |
| Imports require date, account, amount, and note. | 7 | Pass |
| Dates use YYYY-MM-DD. | 3 | Pass |
| Account names must already exist. | 5 | Pass |
| Names stay unique regardless of case or repeated spaces. | 9 | F-1-6 |
| Negative amounts are spending, and positive amounts are money received. | 10 | F-1-10 |
| Import checks every row before writing any entry. | 9 | Pass |
| It rejects ambiguous names from older backups instead of guessing an account. | 11 | Pass |
| Browser records are not synced or recoverable by the maintainers. | 9 | F-1-11 |
| A full .pocket backup contains accounts, entries, and balance checks. | 9 | Pass |
| It uses a versioned encrypted JSON envelope. | 7 | Pass |
| Its password is not stored and cannot be recovered. | 9 | Pass |
| CSV is portable but does not include opening balances or balance-check history. | 11 | Pass |
| Deploy the contents of dist/ as a static site. | 9 | Pass |
| The included Azure configuration caches content-hashed immutable files for one year. | 11 | Pass |
| It keeps sw.js revalidated, sets the manifest type, and applies the response security policy. | 13 | Pass |
| The host should serve directory indexes for /privacy/ and /terms/. | 10 | Pass |
| Do not configure an SPA catch-all over those pages. | 9 | Pass |
| The factory owns DNS and deployment infrastructure. | 7 | Pass |
| MIT. | 1 | Pass |
| See the design thesis, demo details, claim checks, privacy policy, terms, and factory handoff. | 14 | Pass |
| Generated project artwork is original to Pocket Reconcile and is covered by the same license; its prompt and provenance are recorded in `.factory/design.md` and `assets/src/pressed-ledger.prompt.json`. | 25 | F-1-9 |

## Demo and sandbox

**Pass.** From the first-screen link, `/demo` immediately showed two realistic
accounts, three dated entries, and a completed check. The persistent banner
said “Demo — sample data, nothing is saved.” and exposed **Reset demo** and
**Start for real**. Reset restored “Weekend cash”; Start for real opened the
empty real ledger. In a fresh browser, the sample used only
`demo:pocket-reconcile` IndexedDB and `demo:` local storage; the ordinary demo
flow requested only `https://pocket-reconcile.sociobot.in`.

## Claims and clean-clone tests

**Pass.** A fresh depth-one clone of the declared GitHub repository installed
with `npm ci` (61 packages, zero audit vulnerabilities). All 15 exact commands
listed in `.factory/claims.json` completed successfully on both required
browser projects. `npm test` then passed 21 unit tests, strict TypeScript,
production build, and 56 Playwright tests. The same 56-test browser suite
passed again against the live URL. No claim command failed.

Claim coverage confirmed the demo namespace/reset/exit flow, entry and
balance-check workflow, discrepancy note, offline reload, CSV export/import
and atomic rejection, encrypted backup/restore/password behavior, deletion
and erasure, PWA update behavior, same-origin privacy behavior, and exact
minor-unit amounts.

## History, structure, and visual checks

Earlier reports read: `verification.md`, `verification-2.md`,
`verification-3.md`, `verification-4.md`, `verification-5.md`, and the prior
handoff. Their functional findings were rechecked in the live suite and code:
invalid dates, decimal boundaries, immutable assets, clean-clone claims,
one-click demo, route history, metadata, first-run structure, precision
recovery, app-shell offline load, duplicate accounts, toast actions, touch
targets, and 404 behavior are fixed. No earlier finding regressed.

The live routes `/`, `/demo`, `/privacy/`, `/terms/`, and `/404.html` returned
200; a deliberately unknown route returned the designed 404 with HTTP 404.
Each checked document has language, one h1, main landmark, title, description,
canonical URL, OG image, and favicon. `robots.txt`, `sitemap.xml`, and the
manifest returned 200 with expected content types. Crawled site links and
explicit mailto links resolved appropriately. No page or console errors
occurred in cold mobile or desktop loads.

The notebook/field-guide visual system is distinct from a generic SaaS
template: warm paper, restrained botanical art, ruled surfaces, specimen
labels, and ink-like type support the manual reconciliation task. It matches
the design thesis. Findings F-1-2 through F-1-4 concern copy labels, not the
visual identity.

## Missed leverage

No finding. The brief already requires and provides CSV import/export and
encrypted recovery. Sync would conflict with the explicit local-first privacy
position, and an AI action would not improve this short manual balance-check
workflow enough to justify transmitting financial records.

## What would make this perfect

Remove or prove the time promise, make the three landing labels informative,
use one word for saved changes, register the unique-name guarantee as a claim,
split the overlong license sentence, register the sign and recovery promises,
replace metaphorical route h1s, and share one header across application and
legal routes. Re-run the full clean-clone claim matrix and live browser suite
afterward.
