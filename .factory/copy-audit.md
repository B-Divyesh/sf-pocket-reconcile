# Landing and README copy audit

Counts use whitespace-delimited rendered words. Headings, actions, and feature
fragments are included because they stand alone. Commands and CSV data are not
sentences. No line exceeds 22 words, and no banned plain-words term occurs.

## Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Balance checks for a few accounts | 6 | Pass |
| Reconcile cash and card balances. | 5 | Pass |
| For privacy-minded budgeters who track a few accounts from a phone. | 11 | Pass |
| Try it with sample data | 5 | Pass |
| Create my first account | 4 | Pass |
| The sample opens a working ledger. | 6 | Pass |
| It never mixes with your records. | 6 | Pass; `@claim:demo-sandbox` |
| Works offline after first visit | 5 | Pass; `@claim:offline-reload` |
| No bank login | 3 | Pass; `@claim:local-records` |
| Export CSV or encrypted backup | 5 | Pass; `@claim:csv-export`, `@claim:encrypted-backup` |
| How it works | 3 | Pass |
| Set the starting balance. | 4 | Pass |
| Create each cash, card, or wallet account by entering what it holds now. | 13 | Pass |
| Record each change. | 3 | Pass |
| Add money spent or received with a date and a short note. | 12 | Pass |
| Count and compare. | 3 | Pass |
| Enter the balance you see. | 5 | Pass |
| Add a note when the totals differ. | 7 | Pass; `@claim:discrepancy-note` |
| What it does not do | 5 | Pass |
| Pocket Reconcile does not connect to banks, sync records between devices, or give financial advice. | 15 | Pass |
| Your browser holds the working ledger. | 6 | Pass; `@claim:local-records` |
| Export a backup before clearing browser data or moving devices. | 10 | Pass |
| Private balance checks for a few accounts. | 7 | Pass |

Landing metadata is also plain and within its limits. The title is 50
characters. The description is 65 characters. The catalog sentence is 70
characters, starts with “Reconcile”, and stays below 120 characters.

## README

| Copy | Words | Result |
| --- | ---: | --- |
| Pocket Reconcile helps privacy-minded budgeters reconcile cash, cards, and a few manual entries from a phone. | 16 | Pass |
| Records remain in this browser; no bank login is required. | 10 | Pass; `@claim:local-records` |
| It works offline after the first visit and exports ledger entries as CSV or a password-encrypted backup. | 17 | Pass; registered claims |
| Local cash, card, or other accounts with spent and received entries | 11 | Pass |
| Exact balance checks, plus a required note when the totals differ | 11 | Pass |
| CSV entry import and export, with every row checked before import | 11 | Pass |
| Password-encrypted export and full restore of accounts, entries, and checks | 10 | Pass |
| Delete an entry with Undo, or erase the entire ledger after confirmation | 12 | Pass |
| Installable web app, offline reload, and an update prompt | 9 | Pass |
| It stores each supported amount in the currency’s smallest unit. | 10 | Pass; `@claim:exact-decimals` |
| Pocket Reconcile is a record-keeping utility, not financial advice, a bank feed, or an accounting system. | 16 | Pass |
| Open https://pocket-reconcile.sociobot.in/demo or select Try it with sample data on the first screen. | 13 | Pass |
| The sample ledger includes two accounts, three entries, and a completed check. | 12 | Pass |
| Sample data never mixes with personal records; use Reset demo to restore it or Start for real to discard it. | 20 | Pass; `@claim:demo-sandbox` |
| Requires Node.js 20.19+ or 22.12+. | 5 | Pass; enforced by `package.json#engines.node` |
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
| Names stay unique regardless of case or repeated spaces. | 9 | Pass; `@claim:account-name-uniqueness` |
| Negative amounts are spending, and positive amounts are money received. | 10 | Pass; `@claim:csv-amount-signs` |
| Import checks every row before writing any entry. | 8 | Pass; `@claim:atomic-csv-import` |
| It rejects ambiguous names from older backups instead of guessing an account. | 12 | Pass; `@claim:legacy-duplicate-csv` |
| Records remain in this browser. | 5 | Pass; `@claim:local-records` |
| A full .pocket backup contains accounts, entries, and balance checks. | 10 | Pass; `@claim:backup-restore` |
| Its password is not stored and cannot be recovered. | 9 | Pass; `@claim:backup-password-recovery` |
| CSV files include entries, but omit opening balances and balance-check history. | 11 | Pass; `@claim:csv-export` |
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

## Application wording changed in round 3

| Copy | Words | Result |
| --- | ---: | --- |
| Add a ledger entry | 4 | Pass; names the form |
| Add an account | 3 | Pass; dialog name |
| Delete entry / Keep entry | 4 | Pass; target-specific actions |
| Delete account / Keep account | 4 | Pass; target-specific actions |
| Erase ledger / Keep ledger | 4 | Pass; target-specific actions |

## Terminology

| Concept | One word used |
| --- | --- |
| A user's saved financial container | account |
| A dated balance change | entry |
| A comparison of expected and observed totals | balance check |
| Downloadable spreadsheet format | CSV |
| Password-protected full export | backup |
| Isolated realistic example | sample ledger |

The botanical identity remains in the palette, ruled surfaces, leaf artwork,
serif type, and paper-tone control. Product actions use ledger terms.
