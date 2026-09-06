# Reconcile cash and card balances — review 5

- Product: Pocket Reconcile
- Live URL: <https://pocket-reconcile.sociobot.in>
- Review date: 6 September 2026
- Implementation candidate: `a16b69d5b0861c449dd8ae4ef9bbb9dc8df78739`
- Documentation reviewed: `24946ece76f13a6bdae429b0f0c683b1afb93c8a`
- Browsers: fresh Chromium contexts at 390×844 and 1440×1000
- Verdict: **PASS**
- Findings: **0**
- Untested claims: **0**

## Verdict

**PASS.** The live product completes its real reconciliation job on a phone
and desktop. Every registered claim passed its exact command. No missing,
false, incomplete, or untested public claim was found. All earlier review and
verification findings remain closed.

This is a static local-first PWA. It has no runtime backend, tenant, login, or
paid endpoint. Backend tenant isolation, server restart persistence, health,
and 429/Retry-After checks do not apply. The earlier unavailable paid service
was removed from the shipped product; no price or paid feature is advertised.

## First screen before scrolling

Fresh phone and desktop browsers showed the same clear starting point:

- Job: “Reconcile cash and card balances.”
- Audience: “For privacy-minded budgeters who track a few accounts from a
  phone.”
- First action: “Try it with sample data”.

On the 390×844 phone, the heading, audience sentence, both actions, and all
three facts were visible before scrolling. The sample action is the stronger
action and is at least 44px high. On desktop, both actions are equal height.
The page uses direct ledger words and contains the required How it works and
What it does not do sections in the required order.

## Sample and product paths

The first-screen sample action opened the populated demo in one click. `/demo`
also opened it directly. The first populated view showed Weekend cash at
₹104.50, Daily card, three realistic entries, and one completed balance check.
The banner stayed visible and said “Demo — sample data, nothing is saved.” It
also kept Reset demo and Start for real available.

The live and local browser runs proved the sandbox behavior:

- Personal data was created first as a sentinel.
- Demo data used `demo:pocket-reconcile` and `demo:` preference keys.
- Adding a demo entry changed only the demo ledger.
- Reset demo restored exactly two accounts, three entries, and one check.
- Start for real removed the demo database and demo preferences.
- The personal database and sentinel preference remained byte-for-byte
  unchanged.

The tested normal path created an account, recorded spending, completed an
exact balance check, and showed it in history. Invalid and boundary tests
covered impossible calendar dates, mixed valid/invalid CSV, duplicate and
ambiguous account names, missing discrepancy notes, excess currency precision,
and the maximum supported USD amount. Recovery tests covered delete and Undo,
wrong and correct backup passwords, complete encrypted restore, confirmed full
erase, demo reset, and offline reload.

## Claims

`npm ci` ran first from a checkout with no `dist/`. Then every exact `test`
command in `.factory/claims.json` ran separately. Each command built and
started its own production preview and passed in both browser projects.

| Claim | Exact command result |
| --- | --- |
| `demo-sandbox` | PASS — 2/2 |
| `core-ledger` | PASS — 2/2 |
| `discrepancy-note` | PASS — 2/2 |
| `offline-reload` | PASS — 2/2 |
| `csv-export` | PASS — 2/2 |
| `csv-import` | PASS — 2/2 |
| `csv-amount-signs` | PASS — 2/2 |
| `atomic-csv-import` | PASS — 2/2 |
| `encrypted-backup` | PASS — 2/2 |
| `backup-restore` | PASS — 2/2 |
| `backup-password-recovery` | PASS — 2/2 |
| `entry-delete` | PASS — 2/2 |
| `erase-ledger` | PASS — 2/2 |
| `pwa-install-update` | PASS — 2/2 |
| `local-records` | PASS — 2/2 |
| `account-name-uniqueness` | PASS — 2/2 |
| `legacy-duplicate-csv` | PASS — 2/2 |
| `exact-decimals` | PASS — 2/2 |

Each claim ID occurs exactly once as an `@claim:<id>` test tag. A fresh audit
of the landing page, product screens, Privacy, Terms, and README found that
their observable promises map to these claims or to direct quality checks.
There are no unlisted public product claims.

## Clean checkout and live checks

- `npm ci`: PASS; 61 packages installed, 62 audited, 0 vulnerabilities.
- All 18 exact claim commands: PASS; 36 browser assertions.
- `npm test`: PASS on the complete retry; 25 unit/deployment checks, build,
  and 68 browser checks. The first attempt had one Chromium process crash
  after 20 passing cases. It was a browser `SIGSEGV`, not an assertion or page
  failure; the fresh complete retry passed 68/68.
- `npm run lint`: PASS.
- `npm run build`: PASS and produced `dist/index.html`.
- `PLAYWRIGHT_BASE_URL=https://pocket-reconcile.sociobot.in npm run test:e2e`:
  PASS, 68/68.
- `/opt/fleet/lib/verify-url.sh`: PASS; HTTP 200, correct title, `lang=en`, one
  h1, one main landmark, complete image alt text, labeled buttons, and no
  console or page errors. Load time was 666ms.
- The Playwright Axe integration found zero serious or critical WCAG 2 A/AA
  violations across Home, Demo, Privacy, Terms, 404, and Offline in normal and
  dark reduced-motion treatments in both viewports.

The standalone Axe CLI could not start because this worker image has no
`chromedriver` executable. This does not leave accessibility untested: the
pinned Playwright Axe integration ran the same axe-core checks across every
route during both the complete local and live 68-test suites.

## Accessibility, privacy, offline, and routes

Keyboard checks passed for the skip link, primary flow, dialogs, Escape,
focus return, screen navigation, browser Back/Forward, and route announcements.
Dialogs have names and target-specific actions. All advertised phone controls
meet the 44px target baseline. There was no horizontal overflow. The designed
focus ring remained visible. Reduced motion shortened transitions to an
effectively instant state, and the dark treatment retained contrast.

The request log for landing, demo changes, all four screens, export/restore,
and offline reload used only `https://pocket-reconcile.sociobot.in`. No
analytics, bank, font, script, login, or other third-party request occurred.
Records and preferences stayed in the browser namespaces described above.

A fresh service worker controlled the demo, cached the executable shell, and
reloaded it offline with the browser HTTP cache disabled. The page showed
“Offline · ready”. The manifest is valid for standalone display, and the
mocked waiting-worker path showed Update and reloaded the page.

`/`, `/demo`, `/demo/`, `/privacy/`, `/terms/`, `/offline.html`, the manifest,
robots, and sitemap returned 200. An unknown path intentionally returned the
styled Page not found screen with HTTP 404; this is correct behavior. All
checked pages had their own title, one h1, main landmark, canonical URL,
description, social metadata, favicon, touch icon, shared header and footer,
legal links, build version, and a way back. Internal links resolved.

## Performance and deployment identity

Lighthouse 13.4.1 on the live mobile page reported:

- Performance 99
- Accessibility 100
- Best Practices 100
- SEO 100
- FCP 973ms; LCP 1,353ms; TBT 140ms; CLS 0
- 93,366 transferred bytes; 12,940 JavaScript bytes and 5,430 CSS bytes

The production build emits 38.14KB raw / 12.70KiB gzip JavaScript and 20.07KB
raw / 5.18KiB gzip CSS, with no web fonts. The live hashed assets use a
one-year immutable cache. HTML revalidates after 30 seconds and `sw.js` uses
`no-cache`. CSP, HSTS, `nosniff`, strict referrer policy, and a restrictive
Permissions-Policy are present.

The following live files are byte-identical to the fresh build:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `25121edbb5f8a155c0583e6ac9b7f9e9b375857f5600678b9e5a66a112cb00c4` |
| `demo/index.html` | `b2a992db7e48658b6fd8f67b29d901954015b777a7a79f4c5d7b9e89b891e021` |
| `sw.js` | `096d58c9e9562a1dc8cc0f2225011cdb545c7781c80a30befb3b209795aafce7` |
| main JavaScript | `0023ac61143e331ce7cb079e1f1adc65af4c786eb2ff8eebb2ad4d18293bb0c3` |
| main CSS | `8d7769cd3c190e23753474b1e60528241c1545a6460b3fb02ff4c0d8f41151e5` |

There is no product or test change after implementation commit `a16b69d`.
Commits through documentation SHA `24946ec` add only review reports and their
evidence. The live artifact is therefore the implementation candidate under
review; no fresh image is needed for the report-only commits.

## Earlier review findings

Every minor and blocking finding from reviews 1–3 was checked again. Review 4
had no findings.

| Earlier finding | Current proof |
| --- | --- |
| F-1-1 | No time promise appears in current public copy. |
| F-1-2 | The generic illustration slogan remains absent. |
| F-1-3 | The process heading is “How it works”. |
| F-1-4 | The limits heading is “What it does not do”. |
| F-1-5 | The dated change is consistently called an entry. |
| F-1-6 | Account-name uniqueness is registered and its exact claim passed. |
| F-1-7 | Privacy, Terms, and 404 h1 text directly names each page. |
| F-1-8 | App, legal, offline, and 404 pages share the standard header links. |
| F-1-9 | README artwork licensing is split into short plain sentences. |
| F-1-10 | CSV amount signs are registered and their exact claim passed. |
| F-1-11 | The unsupported maintainer-recovery promise remains absent. |
| F-2-1 | Demo reset/exit and byte-exact personal isolation passed live. |
| F-2-2 | Both desktop actions are 46px high; the phone first screen fits. |
| F-2-3 | The demo section is “Check the current balance”. |
| F-2-4 | Product actions use account, entry, balance check, ledger, and backup. |
| F-2-5 | Empty states name entries/checks and give the next action. |
| F-2-6 | README directly names delete, Undo, and erase behavior. |
| F-2-7 | README says “Installable web app”, not unexplained “PWA”. |
| F-2-8 | README uses plain accessibility and request language. |
| F-2-9 | Backup copy contains no internal-format jargon. |
| F-2-10 | Copy says smallest unit; all seven currencies passed the exact test. |
| F-2-11 | Every HTML route links the verified 180×180 touch icon. |
| F-3-1 | README and `engines.node` agree; Node 22.23.2 passed. |
| F-3-2 | Legacy duplicate CSV behavior is registered and passed live/local. |
| F-3-3 | The untestable future-restore promise remains absent. |
| F-3-4 | CSV copy names included entries and omitted data exactly. |
| F-3-5 | The entry form heading is “Add a ledger entry”. |
| F-3-6 | Dialog names, focus, Escape, and target-specific actions passed. |

## Earlier verification findings

| Earlier finding | Current disposition and proof |
| --- | --- |
| Verification 1: impossible CSV dates | Closed. `2026-02-31` is rejected without a write in local and live suites. |
| Verification 1: maximum amount lost one cent | Closed. `$90,071,992,547,409.91` displays and stores exactly. |
| Verification 1: hashed assets lacked immutable caching | Closed. Live `/immutable/*` sends one-year `immutable`. |
| Verification 2: checkout unavailable | Closed by removing the unavailable paid surface; no paid claim remains. |
| Verification 2: API rate limiting absent | Not applicable after removing the backend/paid surface; no runtime API ships. |
| Verification 2: service worker omitted shell assets | Closed. A cache-disabled first visit reloads the app shell offline. |
| Verification 2: duplicate names misrouted CSV | Closed. Normalized duplicates and legacy ambiguity are rejected atomically. |
| Verification 2: update toast action lacked a handler | Closed. The visible Update action causes a document reload. |
| Verification 2: small phone targets | Closed. Advertised targets pass the 44px check. |
| Verification 3: claims contract absent | Closed. Eighteen claims exist, each with one tag and a passing exact command. |
| Verification 3: isolated demo absent | Closed. The one-click isolated sample, reset, and exit all passed. |
| Verification 3: checkout unavailable | Closed by the same removal; no checkout is shown or claimed. |
| Verification 3: unknown routes returned 200 | Closed. The designed missing page returns HTTP 404. |
| Verification 4: clean-clone claim commands failed | Closed. All 18 exact commands built from no `dist/` and passed. |
| Verification 4: advertised claims were missing | Closed. The manifest and public-copy audit found no gap. |
| Verification 4: browser Back left the app | Closed. Back/Forward restores URL, title, focus, and announcement. |
| Verification 4: metadata/footer incomplete | Closed on every checked route. |
| Verification 4: landing structure incomplete | Closed. The required process and limits sections are present in order. |
| Verification 4: precision error was inaccurate | Closed. INR `0.001` names the two-decimal limit and recovery action. |
| Verification 5 | That verification passed with no findings; no regression appeared. |

## Missed leverage

No finding. CSV import/export and a password-encrypted full backup cover the
brief’s obvious portability need. Bank sync is an explicit non-goal. An AI
step would add cost, network access, and privacy risk without improving this
short manual reconciliation task.

## Findings

None.
