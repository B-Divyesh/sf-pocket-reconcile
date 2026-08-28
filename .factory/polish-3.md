# Polish round 3 — cumulative finding closure

- Product: Pocket Reconcile
- Review base: `2132cf93396682f2aa91a80a2972afa45e60d395`
- Repaired application commit: `a16b69d5b0861c449dd8ae4ef9bbb9dc8df78739`
- Live URL: <https://pocket-reconcile.sociobot.in>
- Final live check: 2026-08-28T23:18:26.776Z
- Result: all 28 findings from reviews 1–3 are closed.

The release keeps the pressed-botanical field-notebook identity recorded in
`.factory/design.md`. It does not change the PWA/offline artifact class.

## Finding map

Every row names an automated check, a committed screenshot, and the live URL
or published source checked after the final deployment. The clean-clone claim
commands passed once per registered claim in both configured browser projects.
Application checks used <https://pocket-reconcile.sociobot.in>. README and
package checks used the published sources at
<https://raw.githubusercontent.com/B-Divyesh/sf-pocket-reconcile/a16b69d5b0861c449dd8ae4ef9bbb9dc8df78739/README.md>
and
<https://raw.githubusercontent.com/B-Divyesh/sf-pocket-reconcile/a16b69d5b0861c449dd8ae4ef9bbb9dc8df78739/package.json>.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Removed the untested time promise. The first screen now says “Balance checks for a few accounts.” | Test: `landing has the required sequence and every route has release metadata`. Screenshot: `.factory/evidence/polish-3/live-mobile-home.png`. Live: `/` contains no time-to-complete promise. |
| F-1-2 | Removed the generic “Observe · record · reconcile” illustration caption. | Test: `uses plain ledger terms instead of decorative field-guide labels`. Screenshot: `.factory/evidence/polish-3/live-mobile-home.png`. Live: `/` contains no removed caption. |
| F-1-3 | Removed “Three field notes”; “How it works” is the process heading. | Test: `landing has the required sequence and every route has release metadata`. Screenshot: `.factory/evidence/polish-3/live-mobile-home.png`. Live: `/` has the required section order. |
| F-1-4 | Removed “Clear limits”; “What it does not do” names the section. | Test: `landing has the required sequence and every route has release metadata`. Screenshot: `.factory/evidence/polish-3/live-mobile-home.png`. Live: `/` contains the direct heading. |
| F-1-5 | Standardized the dated balance-change term as “entry” across product, README, legal, demo, and claim copy. | Test: `uses plain ledger terms instead of decorative field-guide labels`; `.factory/copy-audit.md`. Screenshot: `.factory/evidence/polish-3/live-mobile-demo.png`. Live: `/?demo=1` uses “entry”. |
| F-1-6 | Registered and retained the account-name uniqueness claim with a demo-level observable test. | Test: `@claim:account-name-uniqueness`; `maps every registered claim to exactly one tagged browser test`. Screenshot: `.factory/evidence/polish-3/live-add-account-dialog.png`. Live: `/?demo=1` rejects normalized duplicates. |
| F-1-7 | Legal and missing-page h1 text remains “Privacy policy”, “Terms of use”, and “Page not found”. | Test: `uses the same primary route links on the ledger and legal pages`. Screenshot: `.factory/evidence/polish-3/live-mobile-404.png`. Live: `/privacy/`, `/terms/`, and `/404.html`. |
| F-1-8 | Ledger, Demo, Privacy, and Terms remain in the shared header on application, legal, and 404 routes. | Test: `uses the same primary route links on the ledger and legal pages`. Screenshot: `.factory/evidence/polish-3/live-mobile-404.png`. Live: `/`, `/privacy/`, `/terms/`, and `/404.html`. |
| F-1-9 | Kept the README artwork license and provenance as separate short sentences. | Test: `.factory/copy-audit.md` has no line over 22 words. Screenshot: `.factory/evidence/polish-3/live-mobile-home.png` confirms the referenced release. Source check: published `README.md` at application commit `a16b69d`. |
| F-1-10 | Registered and retained the CSV sign claim for spending and money received. | Test: `@claim:csv-amount-signs`; exact clean-clone claim command passed. Screenshot: `.factory/evidence/polish-3/live-entry-form.png`. Live: `/demo?screen=backup` import flow passed. |
| F-1-11 | Removed the untestable maintainer-recovery assurance; the remaining local-storage statement is observable. | Test: `@claim:local-records`. Screenshot: `.factory/evidence/polish-3/live-mobile-home.png`. Live: `/?demo=1` emitted only same-origin requests. |
| F-2-1 | **Start for real** deletes the demo IndexedDB database and every `demo:` preference while preserving personal data byte-for-byte. Reset restores the isolated sample. | Test: `@claim:demo-sandbox`. Screenshot: `.factory/evidence/polish-3/live-mobile-demo.png`. Live: direct `/?demo=1` banner, reset, exit, and storage assertions passed. |
| F-2-2 | Kept both desktop first-screen actions at 46px and the complete first screen readable at 390×844. | Test: `keeps the first screen readable on mobile and gives both desktop actions equal height`. Screenshot: `.factory/evidence/polish-3/live-mobile-home.png`. Live: `/` geometry passed in both browser projects. |
| F-2-3 | The balance section remains headed “Check the current balance”. | Test: `uses plain ledger terms instead of decorative field-guide labels`. Screenshot: `.factory/evidence/polish-3/live-mobile-demo.png`. Live: `/?demo=1`. |
| F-2-4 | Replaced field-guide lore with account, entry, balance check, ledger, and backup terms in the product and metadata. | Test: `uses plain ledger terms instead of decorative field-guide labels`. Screenshot: `.factory/evidence/polish-3/live-entry-form.png`. Live: `/?demo=1` contains none of the rejected phrases. |
| F-2-5 | Empty states directly name “ledger entries” and “balance checks” and give the next action. | Test: `uses plain ledger terms instead of decorative field-guide labels`; full live browser flow. Screenshot: `.factory/evidence/polish-3/live-entry-form.png`. Live: `/demo` state transitions passed. |
| F-2-6 | README says “Delete an entry with Undo, or erase the entire ledger after confirmation.” | Test: `.factory/copy-audit.md` plain-word and length audit. Screenshot: `.factory/evidence/polish-3/live-delete-entry-dialog.png` shows the implemented action. Source check: published `README.md` at `a16b69d`. |
| F-2-7 | README uses “Installable web app” instead of the unexplained acronym. | Test: `.factory/copy-audit.md`. Screenshot: `.factory/evidence/polish-3/live-mobile-home.png`. Source check: published `README.md` at `a16b69d`. |
| F-2-8 | README describes accessibility, keyboard use, and outside network requests in plain words. | Test: `.factory/copy-audit.md`; `has no serious accessibility violations or console errors across every route`. Screenshot: `.factory/evidence/polish-3/live-mobile-home.png`. Source check: published `README.md` at `a16b69d`. |
| F-2-9 | Removed the JSON-envelope jargon. Round 3 also removed the replacement future-restore promise, leaving only observable recovery facts. | Test: `.factory/copy-audit.md`; `@claim:backup-restore`. Screenshot: `.factory/evidence/polish-3/live-mobile-demo.png`. Source check: published `README.md` at `a16b69d`; live `/demo?screen=backup`. |
| F-2-10 | Copy says “the currency’s smallest unit”; the claim covers INR, USD, EUR, GBP, CAD, AUD, and JPY. | Test: `@claim:exact-decimals`. Screenshot: `.factory/evidence/polish-3/live-mobile-demo.png`. Live: `/?demo=1` exact-unit flow passed. |
| F-2-11 | Every HTML route retains the original verified 180×180 Apple touch icon, including offline caching. | Test: `landing has the required sequence and every route has release metadata`. Screenshot: `.factory/evidence/polish-3/live-mobile-404.png`. Live: `/icons/apple-touch-icon.png` and every route returned the expected metadata. |
| F-3-1 | Corrected the prerequisite to Node.js 20.19+ or 22.12+ and added `engines.node: ^20.19.0 \|\| >=22.12.0`. | Test: `documents and enforces the Node versions supported by Vite`. Screenshot: `.factory/evidence/polish-3/live-mobile-home.png` identifies the release. Source check: published `README.md` and `package.json` at `a16b69d`. |
| F-3-2 | Added `legacy-duplicate-csv` to the claim manifest. Its isolated demo test inserts a normalized duplicate, imports a CSV row, asserts the ambiguity message, and confirms no entry was saved. | Test: `@claim:legacy-duplicate-csv`; `maps every registered claim to exactly one tagged browser test`. Screenshot: `.factory/evidence/polish-3/live-entry-form.png`. Live: `/demo?screen=backup` claim run passed. |
| F-3-3 | Deleted “for future restores”; no promise remains beyond behavior proved by the current backup tests. | Test: `.factory/copy-audit.md`; claim-manifest cross-check. Screenshot: `.factory/evidence/polish-3/live-mobile-home.png`. Source check: published `README.md` at `a16b69d`. |
| F-3-4 | Replaced “CSV is portable” with “CSV files include entries, but omit opening balances and balance-check history.” | Test: `@claim:csv-export`. Screenshot: `.factory/evidence/polish-3/live-mobile-demo.png`. Source check: published `README.md` at `a16b69d`; live `/demo?screen=backup`. |
| F-3-5 | Renamed the quick-entry h2 from “What changed?” to “Add a ledger entry”. | Test: `uses plain ledger terms instead of decorative field-guide labels`. Screenshot: `.factory/evidence/polish-3/live-entry-form.png`. Live: `/?demo=1` exposes the direct heading. |
| F-3-6 | Connected every dialog to its h2 and made focused actions target-specific: Add account, Delete/Keep entry, Delete/Keep account, and Erase/Keep ledger. | Test: `names every dialog and focuses target-specific actions`; all-route Axe scans. Screenshots: `.factory/evidence/polish-3/live-add-account-dialog.png`, `live-delete-entry-dialog.png`, `live-delete-account-dialog.png`, and `live-erase-ledger-dialog.png`. Live: `/?demo=1` dialog names, focus, and keyboard actions passed. |

## Additional defect closed during the final pass

At 390px, the designed 404 page’s wrapped actions initially touched. The
action row now uses an explicit 8px gap. The browser geometry assertion passes
and `.factory/evidence/polish-3/live-mobile-404.png` shows the final live page.

## Final evidence

- Clean remote clone: 18/18 exact claim commands passed; `npm test` passed 25
  unit/deployment checks and 68 Playwright checks.
- Production build: JS 38.14 KB (12.70 KiB gzip); CSS 20.07 KB (5.18 KiB
  gzip); `dist/index.html` is present.
- Live suite: 68/68 Playwright checks passed against the deployed URL.
- Accessibility: every route passed Axe in light and dark reduced-motion
  contexts; the URL verifier found no console, alt-text, landmark, title, or
  button-name defect.
- Privacy/offline: the full demo flow requested only the product origin, and
  a fresh first visit reloaded offline with the browser HTTP cache disabled.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1.3s, TBT 20ms, CLS 0.
- Cold deployment check: home and demo 200; a missing route 404; demo banner,
  reset, exit, dialogs, and 8px mobile 404 gap verified; zero console errors.
- Committed machine-readable evidence: `.factory/evidence/polish-3/`.

There are no unresolved findings, TODOs, or known gaps.
