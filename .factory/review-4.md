# Adversarial first-read review 4 — PASS

- **Product:** Pocket Reconcile
- **Live URL:** <https://pocket-reconcile.sociobot.in>
- **Date:** 2026-08-28
- **Review base:** `d4b762f9e9ef73384bd9e56bec39e05e5a92f4d8`
- **Viewports:** fresh Chromium contexts at 390×844 and 1440×1000
- **Verdict:** **PASS.** There are zero blocking or minor findings, and every registered claim was tested.

## Cold first read

Before scrolling, in both fresh contexts, the page said:

> “Reconcile cash and card balances.”
>
> “For privacy-minded budgeters who track a few accounts from a phone.”
>
> “Try it with sample data”

This identifies a tool for reconciling cash and card balances, identifies a
privacy-minded person tracking a few accounts from a phone, and names the first
action. The visible follow-up explains that the action opens a working ledger
without mixing with personal records. The mobile primary action is visible and
large enough to use without scrolling. This passes the first-screen check.

## Copy audit

Counts are whitespace-delimited. Headings, actions, and feature fragments are
included because they need to stand alone. Commands and CSV data are not
sentences. Every item is at most 22 words; none uses a banned marketing word,
an unexplained product metaphor, inconsistent ledger terminology, or a vague
button label.

### Landing page

| Copy | Words | Check |
| --- | ---: | --- |
| Balance checks for a few accounts | 6 | Pass |
| Reconcile cash and card balances. | 5 | Pass |
| For privacy-minded budgeters who track a few accounts from a phone. | 11 | Pass |
| Try it with sample data | 5 | Pass |
| Create my first account | 4 | Pass |
| The sample opens a working ledger. | 6 | Pass |
| It never mixes with your records. | 6 | `demo-sandbox` |
| Works offline after first visit | 5 | `offline-reload` |
| No bank login | 3 | `local-records` |
| Export CSV or encrypted backup | 5 | `csv-export`, `encrypted-backup` |
| How it works | 3 | Pass |
| Set the starting balance. | 4 | Pass |
| Create each cash, card, or wallet account by entering what it holds now. | 13 | Pass |
| Record each change. | 3 | Pass |
| Add money spent or received with a date and a short note. | 12 | Pass |
| Count and compare. | 3 | Pass |
| Enter the balance you see. | 5 | Pass |
| Add a note when the totals differ. | 7 | `discrepancy-note` |
| What it does not do | 5 | Pass |
| Pocket Reconcile does not connect to banks, sync records between devices, or give financial advice. | 15 | `local-records` |
| Your browser holds the working ledger. | 6 | `local-records` |
| Export a backup before clearing browser data or moving devices. | 10 | Pass |
| Private balance checks for a few accounts. | 7 | Pass |

### README

| Copy | Words | Check |
| --- | ---: | --- |
| Pocket Reconcile helps privacy-minded budgeters reconcile cash, cards, and a few manual entries from a phone. | 16 | Pass |
| Records remain in this browser; no bank login is required. | 10 | `local-records` |
| It works offline after the first visit and exports ledger entries as CSV or a password-encrypted backup. | 17 | Registered claims |
| Local cash, card, or other accounts with spent and received entries | 11 | Pass |
| Exact balance checks, plus a required note when the totals differ | 11 | Pass |
| CSV entry import and export, with every row checked before import | 11 | Pass |
| Password-encrypted export and full restore of accounts, entries, and checks | 10 | Pass |
| Delete an entry with Undo, or erase the entire ledger after confirmation | 12 | Pass |
| Installable web app, offline reload, and an update prompt | 9 | Pass |
| It stores each supported amount in the currency’s smallest unit. | 10 | `exact-decimals` |
| Pocket Reconcile is a record-keeping utility, not financial advice, a bank feed, or an accounting system. | 16 | Pass |
| Open https://pocket-reconcile.sociobot.in/demo or select Try it with sample data on the first screen. | 13 | Pass |
| The sample ledger includes two accounts, three entries, and a completed check. | 12 | `demo-sandbox` |
| Sample data never mixes with personal records; use Reset demo to restore it or Start for real to discard it. | 20 | `demo-sandbox` |
| Requires Node.js 20.19+ or 22.12+. | 5 | Pass |
| Then open the local URL printed by Vite. | 8 | Pass |
| Service-worker behavior is enabled in the production preview, not the development server. | 12 | Pass |
| npm test runs unit tests, strict TypeScript, a production build, and Playwright. | 12 | Pass |
| Browser sizes are 390×844 mobile and 1440×1000 desktop. | 8 | Pass |
| The suite checks accessibility, keyboard use, outside network requests, updates, offline use, route history, and claims. | 16 | Pass |
| Playwright 1.58.2 is pinned, and its Chromium browser must be available. | 11 | Pass |
| Playwright builds the production site automatically from a clean checkout. | 10 | Pass |
| npm run build writes the static product to ./dist. | 9 | Pass |
| The output has dist/index.html at its root. | 7 | Pass |
| Set PLAYWRIGHT_BASE_URL to test a deployed site. | 7 | Pass |
| Exports use this header: | 4 | Pass |
| Imports require date, account, amount, and note. | 7 | Pass |
| Dates use YYYY-MM-DD. | 3 | Pass |
| Account names must already exist. | 5 | Pass |
| Names stay unique regardless of case or repeated spaces. | 9 | `account-name-uniqueness` |
| Negative amounts are spending, and positive amounts are money received. | 10 | `csv-amount-signs` |
| Import checks every row before writing any entry. | 8 | `atomic-csv-import` |
| It rejects ambiguous names from older backups instead of guessing an account. | 12 | `legacy-duplicate-csv` |
| Records remain in this browser. | 5 | `local-records` |
| A full .pocket backup contains accounts, entries, and balance checks. | 10 | `backup-restore` |
| Its password is not stored and cannot be recovered. | 9 | `backup-password-recovery` |
| CSV files include entries, but omit opening balances and balance-check history. | 11 | `csv-export` |
| See the design thesis, demo details, claim checks, privacy policy, terms, and factory handoff. | 14 | Pass |
| Deploy the contents of dist/ as a static site. | 9 | Pass |
| The included Azure configuration caches content-hashed /immutable/* files for one year. | 11 | Pass |
| It keeps sw.js revalidated, sets the manifest type, and applies the response security policy. | 14 | Pass |
| The host should serve directory indexes for /privacy/ and /terms/. | 10 | Pass |
| Do not configure an SPA catch-all over those pages. | 9 | Pass |
| The factory owns DNS and deployment infrastructure. | 7 | Pass |
| MIT. | 1 | Pass |
| Generated project artwork is original to Pocket Reconcile and covered by the MIT license. | 14 | Pass |
| Its prompt and provenance are in .factory/design.md and assets/src/pressed-ledger.prompt.json. | 9 | Pass |

Terminology is consistently **account**, **entry**, **balance check**, **CSV**,
**backup**, and **sample ledger**.

## Demo and sandbox

`/demo` and `/?demo=1` each loaded a fully populated Weekend cash ledger at
the first post-click screen. It showed the persistent “Demo — sample data,
nothing is saved.” banner, Reset demo, Start for real, realistic dated entries,
two accounts, and a completed balance check. Reset restored the seed. Start
for real removed `demo:` preferences and the `demo:pocket-reconcile` database
while leaving the personal `pocket-reconcile` database separate. The complete
live demo request log contained only the product origin.

## Claims and quality gates

A fresh GitHub clone at `d4b762f9e9ef73384bd9e56bec39e05e5a92f4d8` was used.
After `npm ci`, every exact manifest command
`npm run test:claims -- --grep @claim:<id>` passed for all 18 IDs:

`demo-sandbox`, `core-ledger`, `discrepancy-note`, `offline-reload`,
`csv-export`, `csv-import`, `csv-amount-signs`, `atomic-csv-import`,
`encrypted-backup`, `backup-restore`, `backup-password-recovery`,
`entry-delete`, `erase-ledger`, `pwa-install-update`, `local-records`,
`account-name-uniqueness`, `legacy-duplicate-csv`, and `exact-decimals`.

The manifest maps each ID to exactly one tagged browser test. No landing or
README claim-like sentence lacks a manifest entry. On the working checkout,
`npm test` passed its 25 unit/deployment checks, production build, and 68
browser checks. The production build emits `dist/`; its application JavaScript
is 12.70 KiB gzip. A separate live run,
`PLAYWRIGHT_BASE_URL=https://pocket-reconcile.sociobot.in npm run test:e2e`,
also passed 68/68 checks.

## Structure, routing, and accessibility

The live crawl confirmed 200 responses for `/`, `/demo`, `/privacy/`,
`/terms/`, and all reachable normal links; the deliberate unknown path returns
the designed 404 with HTTP 404. Each checked route has its route-specific
title, one h1, main landmark, description, canonical URL, OG/Twitter image,
SVG favicon, and 180×180 Apple touch icon. `robots.txt` and `sitemap.xml` are
available. Privacy and Terms occur in the consistent header and footer.

The direct `/demo?screen=backup` deep link opened Backup — Pocket Reconcile.
Selecting Backup moved focus to “Back up and restore” and announced “Backup
screen”; browser Back returned to Demo — Pocket Reconcile, focused “Weekend
cash”, and announced “Ledger screen”. The live request log had no console
errors on normal routes. The deployed field-notebook visual identity—paper
palette, ruled layout, leaf mark, serif measurements, and original botanical
art—does not read as a generic SaaS template. No missing implied feature was
identified: the brief’s import/export requirements are present, and sync and
bank connections are explicitly outside the product’s stated scope. An AI
feature would not improve this short, local reconciliation workflow.

## Earlier-finding regression check

| Earlier ID | Live and code confirmation |
| --- | --- |
| F-1-1 | No time-to-complete promise remains. |
| F-1-2 | The generic illustration slogan is absent. |
| F-1-3 | “How it works” directly names the process section. |
| F-1-4 | “What it does not do” directly names the limits section. |
| F-1-5 | The saved dated change is consistently “entry”. |
| F-1-6 | Account-name uniqueness has its registered demo claim. |
| F-1-7 | Legal and 404 h1s name their routes. |
| F-1-8 | Application, legal, and 404 headers share Ledger, Demo, Privacy, Terms. |
| F-1-9 | Artwork licensing/provenance are short separate README sentences. |
| F-1-10 | CSV amount signs have a registered demo claim. |
| F-1-11 | The unsupported recovery assurance is absent. |
| F-2-1 | Reset/exit isolate and discard demo storage; the claim test passed. |
| F-2-2 | Desktop actions have equal 46px height; mobile first screen fits. |
| F-2-3 | The balance section is “Check the current balance”. |
| F-2-4 | Product actions use ledger terms, not field-guide lore. |
| F-2-5 | Empty states name ledger entries and balance checks plus next actions. |
| F-2-6 | README uses direct delete/erase actions. |
| F-2-7 | README says “Installable web app”, not PWA. |
| F-2-8 | README says accessibility and outside network requests plainly. |
| F-2-9 | Backup copy has no internal-format jargon or future promise. |
| F-2-10 | Currency wording uses smallest unit; all supported currencies are tested. |
| F-2-11 | Every HTML route carries the 180×180 Apple touch icon. |
| F-3-1 | README and `engines` agree on supported Node versions. |
| F-3-2 | Legacy duplicate CSV names have an isolated registered claim. |
| F-3-3 | The untestable future-restore assertion is absent. |
| F-3-4 | CSV copy names included entries and omitted data exactly. |
| F-3-5 | The quick-entry heading is “Add a ledger entry”. |
| F-3-6 | Dialogs are named, focused, and use target-specific actions. |

## What would make this perfect

Nothing is currently outstanding. Maintain the claim manifest and the cold
mobile demo check whenever behavior or public copy changes.
