# Polish round 2 — cumulative finding closure

- Base review commit: `4483acd2f009cf81edfe9fba3dca85f9ffc5e8f8`
- Released candidate reviewed: `938698b172aa74d33f848deda3176c733ba86530`
- Repair commits: `5da42d66943c9bd7f752fcf465368674e2e9c1b9`, `22f51772a2b227ad58198533e79d7f49b07286f7`
- Live URL checked cold: <https://pocket-reconcile.sociobot.in>

All screenshots and machine-readable reports below are in
`/tmp/pocket-reconcile-polish-2/` in the work-order container.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the non-quantified eyebrow and description; no untested time promise returned. | `landing has the required sequence and every route has release metadata`; `final-live-mobile-first-screen.png`; live `/`. |
| F-1-2 | Kept the decorative illustration caption removed. | `tests/deployment.test.ts` plain-language scan; `final-live-mobile-first-screen.png`; live `/`. |
| F-1-3 | Kept “How it works” as the sole process heading. | Landing metadata test; `final-live-mobile-first-screen.png`; live `/`. |
| F-1-4 | Kept “What it does not do” as the limits heading. | Landing metadata test; `final-live-mobile-first-screen.png`; live `/`. |
| F-1-5 | Kept visitor terminology on “entry”; also changed claim descriptions from transaction rows to entry rows. | `.factory/copy-audit.md`; live `/demo`. |
| F-1-6 | Kept `account-name-uniqueness` registered with one exact tagged test. | `@claim:account-name-uniqueness`; final clean-clone claim log. |
| F-1-7 | Kept “Privacy policy”, “Terms of use”, and “Page not found” as route h1 text. | `uses the same primary route links on the ledger and legal pages`; `final-live-mobile-privacy.png`, `final-live-mobile-404.png`. |
| F-1-8 | Kept Ledger, Demo, Privacy, and Terms in every primary header; added non-overlap checks on mobile. | Shared-navigation test; live screenshots for root, Privacy, 404, and offline routes. |
| F-1-9 | Kept the artwork license and provenance as separate short README sentences. | `.factory/copy-audit.md`; README source check. |
| F-1-10 | Kept `csv-amount-signs` registered and tested in both directions. | `@claim:csv-amount-signs`; final clean-clone claim log. |
| F-1-11 | Kept the tested statement “Records remain in this browser.” | `@claim:local-records`; live request-origin check in the 64-test suite. |
| F-2-1 | **Start for real** now deletes `demo:pocket-reconcile` and every `demo:` local-storage key. Reset also clears demo preferences. The claim test seeds personal records/preferences, mutates demo records/preferences, exits, then compares personal state byte-for-byte. | `@claim:demo-sandbox`; final clean clone and live suite; live `/?demo=1`. |
| F-2-2 | Moved vertical spacing to `.welcome .button-row` and centered its children. Both desktop actions are exactly 46px high. | `keeps the first screen readable on mobile and gives both desktop actions equal height`; `final-live-mobile-first-screen.png`; measured live boxes 46px/46px. |
| F-2-3 | Renamed the balance-check heading to “Check the current balance”. | Plain-language deployment test; `final-live-mobile-demo.png`; live `/?demo=1`. |
| F-2-4 | Replaced field-guide lore with account, entry, balance check, ledger, and backup terms. Updated social and manifest descriptions. | Plain-language deployment test; cold live content sweep found zero old phrases; `final-live-mobile-demo.png` and `final-live-mobile-backup.png`. |
| F-2-5 | Empty states now say “No ledger entries yet” and “No balance checks yet”, each with a direct next step. | Cold live content/source sweep and browser navigation; live `/demo`. |
| F-2-6 | README now says “Delete an entry with Undo, or erase the entire ledger after confirmation.” | `.factory/copy-audit.md`; README source check. |
| F-2-7 | README now says “Installable web app”. | `.factory/copy-audit.md`; README source check. |
| F-2-8 | README now names accessibility and outside network requests in plain words. | `.factory/copy-audit.md`; README source check. |
| F-2-9 | README now explains that the encrypted backup carries a format version for future restores. | `.factory/copy-audit.md`; README source check. |
| F-2-10 | README and claim use “the currency’s smallest unit”. The one tagged claim now creates INR, USD, EUR, GBP, CAD, AUD, and zero-decimal JPY accounts and inspects their exact stored units. | `@claim:exact-decimals`; final clean-clone claim log. |
| F-2-11 | Added an original 180×180 Apple touch icon to every HTML route and the offline cache. Route metadata checks assert SVG favicon, touch-icon path, declared size, and actual pixels. | `landing has the required sequence and every route has release metadata`; live `/icons/apple-touch-icon.png` returned 200. |

## Additional defects closed during the final visual pass

- Restoring an encrypted backup no longer exposes its password controls before
  a file is chosen. Evidence: `keeps restore controls hidden until a backup file
  is chosen` and `final-live-mobile-backup.png`.
- The legal, 404, and offline mobile headers now place navigation on a separate
  row with four non-overlapping 44px targets. Evidence: the shared-navigation
  test and `final-live-mobile-privacy.png`, `final-live-mobile-404.png`, and
  `final-live-mobile-offline.png`.
- Initial demo seeding no longer displays a reset toast over the first useful
  screen. Evidence: `final-live-mobile-demo.png`.

## Final evidence summary

- Final clean clone: `/tmp/pocket-reconcile-polish2-final-clean-IvJpOb/repo`
  at `22f51772a2b227ad58198533e79d7f49b07286f7`.
- Every one of the 17 commands in `.factory/claims.json`: pass in mobile and
  desktop Chromium.
- Clean-clone `npm test`: 22 unit/deployment checks and 64 browser checks pass.
- Live `npm run test:e2e`: 64/64 pass.
- Live URL verifier: `final-live-verify/verify.json`; zero console/page errors.
- Live Lighthouse: 100 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.1s; CLS 0; 91 KiB total transfer.
- Unknown-route probe returned HTTP 404; root, demo, legal, explicit 404,
  offline, manifest, robots, sitemap, and touch icon returned HTTP 200.

No review finding remains open.
