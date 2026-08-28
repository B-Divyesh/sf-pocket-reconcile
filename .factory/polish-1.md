# Polish round 1 — review finding closure

- Base candidate: `9fd2007909af36c532cfe49590c8df3977119281`
- Review: `.factory/review-1.md` at `77d7be169411522f9b7ceadb21ad327dc4ef2bc4`
- Released repair: `b222b6a` (following `158661a`)
- Live URL: <https://pocket-reconcile.sociobot.in>
- Cold mobile evidence: `/tmp/pocket-reconcile-live-verify-final/screenshot-mobile.png`

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Replaced the time promise with “Balance checks for a few accounts” and removed “in minutes” from the home description. | Cold mobile screenshot; live bundle check; `landing has the required sequence and every route has release metadata`. |
| F-1-2 | Removed the generic illustration caption. | Cold mobile screenshot; live bundle check has no old caption. |
| F-1-3 | Removed the “Three field notes” label; “How it works” remains the section heading. | Cold mobile screenshot; landing metadata test. |
| F-1-4 | Removed the “Clear limits” label; “What it does not do” remains the section heading. | Cold mobile screenshot; landing metadata test. |
| F-1-5 | Standardized visitor copy on **entry**, including README, sample documentation, legal copy, and CSV UI. | `.factory/copy-audit.md`; README review; live suite passes. |
| F-1-6 | Registered `account-name-uniqueness` and added a demo test that rejects a case and repeated-space variant. | `npm run test:claims -- --grep @claim:account-name-uniqueness` — 2 browser projects pass. |
| F-1-7 | Changed legal and 404 headings to “Privacy policy”, “Terms of use”, and “Page not found”. | `uses the same primary route links on the ledger and legal pages`; live URL suite passes. |
| F-1-8 | Added the shared Ledger, Demo, Privacy, and Terms primary navigation to the app header and every static route. | `uses the same primary route links on the ledger and legal pages`; cold mobile screenshot. |
| F-1-9 | Split the README artwork-license sentence into two short sentences. | `.factory/copy-audit.md`; README review. |
| F-1-10 | Registered `csv-amount-signs` and added a demo import test for one negative and one positive amount. | `npm run test:claims -- --grep @claim:csv-amount-signs` — 2 browser projects pass. |
| F-1-11 | Replaced the untestable maintainer-recovery assertion with the tested “Records remain in this browser.” | `npm run test:claims -- --grep @claim:local-records` — 2 browser projects pass. |

## Additional release checks

- `?demo=1` is exercised inside `@claim:demo-sandbox`; it starts with the
  sample ledger, persistent banner, Reset demo, and Start for real controls in
  the `demo:` storage namespace.
- Mobile ordering was corrected after visual review so the headline and audience
  precede the primary sample action. The final screenshot above is from the
  deployed site.
- `/opt/fleet/lib/verify-url.sh` passed against the live root. Its final report
  is `/tmp/pocket-reconcile-live-verify-final/verify.json`.
- `PLAYWRIGHT_BASE_URL=https://pocket-reconcile.sociobot.in npm run test:e2e`
  passed all 60 checks, including the Playwright Axe scans, privacy request
  checks, offline reload, routing, metadata, and mobile targets.
