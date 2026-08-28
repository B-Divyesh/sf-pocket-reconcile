# Adversarial first-read review 2 — FAIL

- Product: Pocket Reconcile
- Live URL: <https://pocket-reconcile.sociobot.in>
- Reviewed: 2026-08-28
- Source commit tested: `938698b172aa74d33f848deda3176c733ba86530`
- Viewports: fresh Chromium contexts at 390×844 and 1440×1000
- Verdict: **FAIL.** One blocking finding and ten minor findings remain. A
  passing review requires zero findings and no partially tested claim.

## Cold first read

Before scrolling, the mobile and desktop screens answer the three required
questions:

- What it does: manually records changes and compares cash and card balances.
- Who it is for: privacy-minded budgeters tracking a few accounts on a phone.
- What to click first: **Try it with sample data**.

The exact first-screen text that provides those answers is:

> “Reconcile cash and card balances.”
>
> “For privacy-minded budgeters who track a few accounts from a phone.”
>
> “Try it with sample data”

This is not a blocking clarity failure. At 390×844, the headline, audience,
sample action, real-start action, explanation, and all three facts are visible
without scrolling. Finding F-2-2 records a desktop hierarchy defect in the two
actions.

## Findings

### F-2-1 — BLOCKING — leaving the demo does not discard all demo state

- Exact quote/location: persistent `/demo` banner, “Demo — sample data,
  nothing is saved.”; README, “Start for real to discard it.”; code path
  `handleAction('start-real')` in `src/main.ts`.
- Verification: in a fresh live context, a personal account named “Real
  sentinel” was created before entering the demo. Demo reset restored database
  counts to two accounts, three entries, and one check while the personal
  database remained at one account, zero entries, and zero checks. **Start for
  real** removed `demo:pocket-reconcile` and reopened the untouched personal
  account, but `localStorage['demo:pr:selected-account'] === 'demo-cash'`
  remained. A changed demo paper tone would remain under `demo:pr:theme` for
  the same reason.
- Why this fails: the real namespace is isolated, but the exit action does not
  fully discard demo state. The claim test passes because it checks only that
  the demo IndexedDB database disappears; it does not assert that every
  `demo:` local-storage key disappears or that a pre-existing personal ledger
  is unchanged.
- Concrete fix: on **Start for real**, delete the demo database and every
  `demo:` local-storage key before navigating. Extend
  `@claim:demo-sandbox` to seed a personal account and preference, mutate both
  demo records and demo preferences, exit, and assert: no demo database, no
  `demo:` keys, and byte-for-byte unchanged personal records/preferences.

### F-2-2 — minor — the desktop secondary action is taller than the primary action

- Exact location: desktop cold first screen. **Try it with sample data** is
  246×46 CSS pixels; **Create my first account** is 250×82 CSS pixels and
  extends above and below it.
- Why this fails: the larger secondary outline competes with the intended
  first action and makes the first decision look misaligned. The cause is the
  primary link's vertical margin contributing to the flex row height while the
  button stretches.
- Concrete fix: put vertical spacing on `.button-row`, set
  `align-items: center`, and give both actions the same 46-pixel height while
  retaining the filled primary treatment.

### F-2-3 — minor — a demo heading does not name its section

- Exact quote/location: `/demo`, balance-check card h2, “Count what’s there”.
- Why this fails: heard alone in the heading outline, “there” has no referent.
  A first-time visitor has to read the following paragraph to learn that this
  starts a balance check.
- Concrete fix: use “Check the current balance”.

### F-2-4 — minor — product copy changes ledger terms into field-guide lore

- Exact quotes/locations: `/demo` and application screens use “Field ledger ·
  cash”, “Recent specimens”, “Field guide 02”, “Field guide 03”, “Pack and
  restore”, “Plate A”, “Plate B · complete”, “Encrypted field pack”, “Field
  guide 04”, “Notebook settings”, “Erase this notebook”, and “New specimen”.
  `/offline.html` uses the h1 “This page is not in your pocket yet.” The home
  Open Graph/Twitter description calls the product a “private field notebook”.
- Why this fails: the landing page and terminology table use **account**,
  **entry**, **balance check**, **ledger**, and **backup**. The alternate words
  are decorative metaphors, and several headings do not identify their screen
  out of context.
- Concrete fix: keep the botanical identity in color, rules, imagery, and
  shape. Use “Cash account”, “Balance checks”, “Back up and restore”,
  “Encrypted backup”, “Ledger settings”, “Erase this ledger”, “Add an
  account”, and “This page is not available offline yet”; remove plate/specimen
  labels. Change the social description to “Reconcile cash and card balances
  in a local ledger that works offline.”

### F-2-5 — minor — two empty states use mood copy instead of naming the empty content

- Exact quotes/locations: empty account entry list, “The page is clear. Add
  only what changed since your opening balance.”; empty check history, “No
  checks pressed yet”.
- Why this fails: “clear” and “pressed” make the reader translate the notebook
  metaphor. The first empty state does not explicitly say that ledger entries
  will appear there.
- Concrete fix: use “No ledger entries yet. Add money spent or received
  above.” and “No balance checks yet. Open Ledger and start a balance check.”

### F-2-6 — minor — a README feature uses an abstract noun instead of a plain action

- Exact quote/location: README, What v1 includes, “Confirmed entry deletion
  with Undo, plus confirmed whole-ledger erasure”.
- Why this fails: “whole-ledger erasure” is administrative wording rather than
  an action a reader can picture.
- Concrete fix: “Delete an entry with Undo, or erase the entire ledger after
  confirmation.”

### F-2-7 — minor — the README exposes the unexplained acronym “PWA”

- Exact quote/location: README, What v1 includes, “Standalone PWA
  installation, offline reload, and an update prompt”.
- Why this fails: a product visitor should not need to know the implementation
  category to understand that the site can be installed.
- Concrete fix: “Installable web app, offline reload, and an update prompt.”

### F-2-8 — minor — the README test description uses unexplained tool and network jargon

- Exact quote/location: README, Test and build, “The suite checks axe,
  keyboard use, privacy egress, updates, offline use, route history, and
  claims.”
- Why this fails: “axe” is not capitalized as a tool name, and “privacy egress”
  does not say what is measured.
- Concrete fix: “The suite checks accessibility, keyboard use, outside
  network requests, updates, offline use, route history, and claims.”

### F-2-9 — minor — the README describes the backup with internal format jargon

- Exact quote/location: README, Data and recovery, “It uses a versioned
  encrypted JSON envelope.”
- Why this fails: “JSON envelope” does not tell a reader what they can do or
  what protection they receive.
- Concrete fix: “The encrypted backup includes a format version for future
  restores.”

### F-2-10 — minor — the money wording is inaccurate for all supported currencies and its claim test is too narrow

- Exact quote/location: README, “It keeps supported money amounts in exact
  whole cents.” The application also supports JPY, which does not use cents.
  `.factory/claims.json` instead says “exact whole minor units”, while
  `@claim:exact-decimals` exercises only one USD amount.
- Why this fails: the public term conflicts with the product's currency list,
  and the tagged claim test does not cover the breadth of “supported”
  currencies.
- Concrete fix: write “It stores each supported amount in the currency’s
  smallest unit.” Extend the one tagged claim test to cover every currency in
  the supported list, including zero-decimal JPY and a two-decimal currency.

### F-2-11 — minor — the apple-touch icon contract is incomplete across routes

- Exact location: `/` and `/demo` link `icon-192.png` as the apple-touch icon;
  `/privacy/`, `/terms/`, `/404.html`, and `/offline.html` have no
  `apple-touch-icon` link. The required 180×180 asset is absent.
- Why this fails: saved home-screen identity varies by entry route and does not
  meet the specified SVG favicon plus 180-pixel apple-touch metadata contract.
- Concrete fix: export the original icon at 180×180 and link it from every HTML
  route. Add a route-metadata test for both the SVG favicon and the 180×180
  apple-touch icon.

## Copy audit

Counts use whitespace-delimited rendered words. No line exceeds 22 words and
none contains a banned marketing word. Headings and action labels are included
because they must make sense independently. Developer commands and paths count
as one word each.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Balance checks for a few accounts | 6 | Pass |
| Reconcile cash and card balances. | 5 | Pass |
| For privacy-minded budgeters who track a few accounts from a phone. | 11 | Pass |
| Try it with sample data | 5 | Pass |
| Create my first account | 4 | Pass |
| The sample opens a working ledger. | 6 | Pass |
| It never mixes with your records. | 6 | Pass; sandbox exit caveat in F-2-1 |
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

The landing headings name their sections. Both landing actions are
result-naming verbs. F-2-2 concerns their visual hierarchy, not their wording.

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Pocket Reconcile helps privacy-minded budgeters reconcile cash, cards, and a few manual entries from a phone. | 16 | Pass |
| Records remain in this browser; no bank login is required. | 10 | Pass |
| It works offline after the first visit and exports ledger entries as CSV or a password-encrypted backup. | 17 | Pass |
| Local cash, card, or other accounts with spent and received entries | 11 | Pass |
| Exact balance checks, plus a required note when the totals differ | 11 | Pass |
| CSV entry import and export, with every row checked before import | 11 | Pass |
| Password-encrypted export and full restore of accounts, entries, and checks | 10 | Pass |
| Confirmed entry deletion with Undo, plus confirmed whole-ledger erasure | 9 | F-2-6 |
| Standalone PWA installation, offline reload, and an update prompt | 9 | F-2-7 |
| It keeps supported money amounts in exact whole cents. | 9 | F-2-10 |
| Pocket Reconcile is a record-keeping utility, not financial advice, a bank feed, or an accounting system. | 16 | Pass |
| Open https://pocket-reconcile.sociobot.in/demo or select Try it with sample data on the first screen. | 13 | Pass |
| The sample ledger includes two accounts, three entries, and a completed check. | 12 | Pass |
| Sample data never mixes with personal records; use Reset demo to restore it or Start for real to discard it. | 20 | F-2-1 |
| Requires Node.js 20 or newer. | 5 | Pass |
| Then open the local URL printed by Vite. | 8 | Pass |
| Service-worker behavior is enabled in the production preview, not the development server. | 12 | Pass |
| npm test runs unit tests, strict TypeScript, a production build, and Playwright. | 12 | Pass |
| Browser sizes are 390×844 mobile and 1440×1000 desktop. | 8 | Pass |
| The suite checks axe, keyboard use, privacy egress, updates, offline use, route history, and claims. | 15 | F-2-8 |
| Playwright 1.58.2 is pinned, and its Chromium browser must be available. | 11 | Pass |
| Playwright builds the production site automatically from a clean checkout. | 10 | Pass |
| npm run build writes the static product to ./dist. | 9 | Pass |
| The output has dist/index.html at its root. | 7 | Pass |
| Set PLAYWRIGHT_BASE_URL to test a deployed site. | 7 | Pass |
| Exports use this header: | 4 | Pass |
| Imports require date, account, amount, and note. | 7 | Pass |
| Dates use YYYY-MM-DD. | 3 | Pass |
| Account names must already exist. | 5 | Pass |
| Names stay unique regardless of case or repeated spaces. | 9 | Pass |
| Negative amounts are spending, and positive amounts are money received. | 10 | Pass |
| Import checks every row before writing any entry. | 8 | Pass |
| It rejects ambiguous names from older backups instead of guessing an account. | 12 | Pass |
| Records remain in this browser. | 5 | Pass |
| A full .pocket backup contains accounts, entries, and balance checks. | 10 | Pass |
| It uses a versioned encrypted JSON envelope. | 7 | F-2-9 |
| Its password is not stored and cannot be recovered. | 9 | Pass |
| CSV is portable but does not include opening balances or balance-check history. | 12 | Pass |
| See the design thesis, demo details, claim checks, privacy policy, terms, and factory handoff. | 14 | Pass |
| Deploy the contents of dist/ as a static site. | 9 | Pass |
| The included Azure configuration caches content-hashed /immutable/* files for one year. | 11 | Pass |
| It keeps sw.js revalidated, sets the manifest type, and applies the response security policy. | 14 | Pass |
| The host should serve directory indexes for /privacy/ and /terms/. | 10 | Pass |
| Do not configure an SPA catch-all over those pages. | 9 | Pass; developer term in deployment instructions |
| The factory owns DNS and deployment infrastructure. | 7 | Pass |
| MIT. | 1 | Pass |
| Generated project artwork is original to Pocket Reconcile and covered by the MIT license. | 14 | Pass |
| Its prompt and provenance are in .factory/design.md and assets/src/pressed-ledger.prompt.json. | 9 | Pass |

README headings — “Pocket Reconcile”, “What v1 includes”, “Try the sample
ledger”, “Run locally”, “Test and build”, “CSV format”, “Data and recovery”,
“Deploy”, and “License” — all name their sections. The live-product line and
code blocks are labels/data rather than sentences.

### Terminology check

| Concept | Landing/README term | Result |
| --- | --- | --- |
| Saved financial container | account | Pass |
| Dated balance change | entry | Pass |
| Expected-versus-observed comparison | balance check | Pass |
| Isolated realistic example | sample ledger | Pass |
| Password-protected full export | backup | Pass in landing/README; application conflict in F-2-4 |

## Demo and sandbox

The landing action opens `/demo` in one click. Its first mobile screen already
shows “Weekend cash”, an expected balance of ₹104.50, the date of a completed
check, and a second account selector for “Daily card”. The sample contains two
accounts, three dated entries (“Saturday market”, “Train top-up”, and
“Household shop”), and one completed balance check. The persistent banner,
**Reset demo**, and **Start for real** are present.

Reset removed an added “Demo-only probe” and restored counts `[2, 3, 1]`.
During the complete flow, every request used
`https://pocket-reconcile.sociobot.in`; no font, script, analytics, bank, or AI
origin was requested. The offline claim passed with browser HTTP cache disabled.
The seeded personal database remained `[1, 0, 0]`. F-2-1 records the leftover
demo preference key and the automated coverage gap.

## Claims and test evidence

A fresh depth-one clone of the declared GitHub repository resolved to
`938698b172aa74d33f848deda3176c733ba86530`. `npm ci` installed 61 packages
with zero audit vulnerabilities. Every exact command in `.factory/claims.json`
was run separately; all 17 commands passed in both browser projects:

| Claim ID | Result |
| --- | --- |
| `demo-sandbox` | PASS; coverage gap in F-2-1 |
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
| `exact-decimals` | PASS; breadth gap in F-2-10 |

No exact claim command failed. The clean clone's complete `npm test` also
passed: 21 unit tests, TypeScript, production build, and 60 Playwright tests.
The same 60 Playwright tests passed against the live deployment. Findings
F-2-1 and F-2-10 remain because a passing command does not cover the complete
wording of those claims.

No additional unlisted claim-like sentence was found on the live landing
page. Offline, local-only, no-bank-login, demo isolation, CSV, encrypted
backup, core ledger, and discrepancy-note statements map to existing claim
entries.

## Earlier finding verification

Every earlier review and polish/handoff file was read. Each round-1 finding was
checked in the live page and current source:

| Earlier finding | Current verification |
| --- | --- |
| F-1-1 | Fixed: no two-minute or “in minutes” promise remains. |
| F-1-2 | Fixed: “Observe · record · reconcile” is absent. |
| F-1-3 | Fixed: “Three field notes” is absent. |
| F-1-4 | Fixed: “Clear limits” is absent. |
| F-1-5 | Fixed: visitor copy consistently calls dated changes “entries”. |
| F-1-6 | Fixed: `account-name-uniqueness` is listed and its exact command passes. |
| F-1-7 | Fixed: Privacy, Terms, and 404 h1s are “Privacy policy”, “Terms of use”, and “Page not found”. |
| F-1-8 | Fixed: Ledger, Demo, Privacy, and Terms appear in the primary header on app, legal, and 404 routes. |
| F-1-9 | Fixed: the artwork license and provenance are split into two sentences. |
| F-1-10 | Fixed: `csv-amount-signs` is listed and its exact command passes. |
| F-1-11 | Fixed: the untestable maintainer-recovery sentence is replaced by “Records remain in this browser.” |

No earlier finding is repeated under its original ID.

## Structure, links, visual identity, and accessibility

The following checks pass:

- `/`, `/demo`, the three demo deep links, `/privacy/`, `/terms/`,
  `/404.html`, and `/offline.html` return their intended documents. An unknown
  path returns the designed 404 with HTTP 404.
- Each checked HTML route has `lang="en"`, one h1, one main landmark, a route
  title, description, canonical, Open Graph image, Twitter card, and SVG
  favicon. The social image is 1200×630. F-2-11 records the apple-touch gap.
- Demo query deep links reload correctly. Back and forward restore URL, title,
  h1 focus, and the polite route announcement.
- All crawled same-origin links return 200; the two email links use `mailto:`.
  `robots.txt`, `sitemap.xml`, and the manifest return 200 with the expected
  content types.
- The live root has no page or console errors. The factory URL verifier reports
  one h1, `lang=en`, a main landmark, no missing image alt, no unlabeled button,
  and a 633 ms cold load.
- Playwright Axe reports no serious or critical WCAG 2 A/AA violations on the
  first run, dark/reduced-motion treatment, privacy page, or terms page.
- The field-notebook palette, ruled layout, generated fern still life,
  serif/sans pairing, tabular balances, and clipped controls are visually
  distinct from a generic SaaS template. F-2-4 concerns unnecessary metaphor
  in words, not removal of the visual identity.
- The production build emits 12.45 KB gzip JavaScript and 5.18 KB gzip CSS;
  no third-party font or script ships.

## Missed leverage

No missed-leverage finding. CSV import/export and encrypted full backup cover
the obvious transfer and recovery jobs in the brief. Automatic sync would
contradict the stated local-only model. An AI step would add key setup and
financial-data transmission without improving this short, deterministic
balance-check workflow.

## What would make this perfect

Delete all demo-prefixed state on exit and strengthen its claim test; align the
desktop actions; replace ambiguous headings, lore terms, and empty states with
the established ledger vocabulary; simplify the four flagged README lines;
describe amounts by the currency's smallest unit and test every supported
currency; and add a 180×180 apple-touch icon to every route. Re-run every claim
command, the full local suite, the live suite, the request-log check, and the
fresh-context demo preservation test after those changes. A subsequent review
can pass only if that run finds nothing else.
