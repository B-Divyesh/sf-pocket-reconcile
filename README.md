# Pocket Reconcile

Pocket Reconcile helps privacy-minded budgeters reconcile cash, cards, and a few manual entries from a phone.

Records remain in this browser; no bank login is required. It works offline after the first visit and exports ledger entries as CSV or a password-encrypted backup.

Live product: <https://pocket-reconcile.sociobot.in>

## What v1 includes

- Local cash, card, or other accounts with spent and received entries
- Exact balance checks, plus a required note when the totals differ
- CSV entry import and export, with every row checked before import
- Password-encrypted export and full restore of accounts, entries, and checks
- Delete an entry with Undo, or erase the entire ledger after confirmation
- Installable web app, offline reload, and an update prompt

It stores each supported amount in the currency’s smallest unit. Pocket Reconcile is a record-keeping utility, not financial advice, a bank feed, or an accounting system.

## Try the sample ledger

Open <https://pocket-reconcile.sociobot.in/demo> or select **Try it with sample data** on the first screen. The sample ledger includes two accounts, three entries, and a completed check. Sample data never mixes with personal records; use **Reset demo** to restore it or **Start for real** to discard it.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Then open the local URL printed by Vite. Service-worker behavior is enabled in the production preview, not the development server.

## Test and build

```sh
npm test
npm run build
npm run preview
```

`npm test` runs unit tests, strict TypeScript, a production build, and Playwright. Browser sizes are 390×844 mobile and 1440×1000 desktop. The suite checks accessibility, keyboard use, outside network requests, updates, offline use, route history, and claims. Playwright 1.58.2 is pinned, and its Chromium browser must be available. Playwright builds the production site automatically from a clean checkout. `npm run build` writes the static product to `./dist`. The output has `dist/index.html` at its root. Set `PLAYWRIGHT_BASE_URL` to test a deployed site.

## CSV format

Exports use this header:

```csv
date,account,account_type,currency,amount,note
```

Imports require `date`, `account`, `amount`, and `note`. Dates use `YYYY-MM-DD`. Account names must already exist. Names stay unique regardless of case or repeated spaces. Negative amounts are spending, and positive amounts are money received. Import checks every row before writing any entry. It rejects ambiguous names from older backups instead of guessing an account.

## Data and recovery

Records remain in this browser. A full `.pocket` backup contains accounts, entries, and balance checks. Its password is not stored and cannot be recovered. CSV files include entries, but omit opening balances and balance-check history.

See [the design thesis](.factory/design.md), [demo details](.factory/demo.md), [claim checks](.factory/claims.json), [privacy policy](privacy/index.html), [terms](terms/index.html), and [factory handoff](.factory/handoff.md).

## Deploy

Deploy the contents of `dist/` as a static site. The included Azure configuration caches content-hashed `/immutable/*` files for one year. It keeps `sw.js` revalidated, sets the manifest type, and applies the response security policy. The host should serve directory indexes for `/privacy/` and `/terms/`. Do not configure an SPA catch-all over those pages. The factory owns DNS and deployment infrastructure.

## License

MIT. Generated project artwork is original to Pocket Reconcile and covered by the MIT license. Its prompt and provenance are in `.factory/design.md` and `assets/src/pressed-ledger.prompt.json`.
