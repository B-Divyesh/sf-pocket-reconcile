# Pocket Reconcile

Pocket Reconcile helps privacy-minded budgeters reconcile cash, cards, and a few manual transactions from a phone.

Records remain in this browser; no bank login is required. It works offline after the first visit and exports ledger entries as CSV or a password-encrypted backup.

Live product: <https://pocket-reconcile.sociobot.in>

## What v1 includes

- Multiple local cash, card, or other accounts in seven common currencies
- Fast spent/received entries with dates and notes
- Count-to-balance checks with a mandatory note for discrepancies
- A visible history of exact matches and carried-forward differences
- CSV transaction import/export
- Password-encrypted full export and restore
- Installable offline PWA with an explicit offline state and update prompt
- Local account storage and paper-tone choice

It keeps supported money amounts in exact whole cents. Pocket Reconcile is a record-keeping utility, not financial advice, a bank feed, or an accounting system.

## Try the sample ledger

Open <https://pocket-reconcile.sociobot.in/demo> or select **Try it with sample data** on the first screen. The sample ledger includes two accounts, three transactions, and a completed check. Sample data never mixes with personal records; use **Reset demo** to restore it or **Start for real** to discard it.

## Run locally

Requires Node.js 20 or newer.

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

`npm test` runs unit tests, a strict TypeScript production build, and Playwright tests at 390×844 mobile and 1440×1000 desktop (including axe accessibility, keyboard, privacy-egress, update-notice, and offline-reload checks). Playwright 1.58.2 is pinned; its Chromium browser must be available. The exact deploy command is `npm run build`, which writes the static product to `./dist` with `dist/index.html` at its root. Set `PLAYWRIGHT_BASE_URL` to run the same browser suite against a deployed site.

## CSV format

Exports use this header:

```csv
date,account,account_type,currency,amount,note
```

Imports require `date`, `account`, `amount`, and `note`. Dates use `YYYY-MM-DD`; account names must already exist and are unique regardless of case or repeated spaces; negative amounts are spending and positive amounts are money received. Import validates all rows before writing any of them, and safely rejects ambiguous names from older backups instead of guessing a ledger.

## Data and recovery

Browser records are not synced or recoverable by the maintainers. A full `.pocket` backup contains accounts, entries, and balance checks in a versioned encrypted JSON envelope. Its password is not stored and cannot be recovered. CSV is intentionally portable but does not include opening balances or reconciliation history.

See [the design thesis](.factory/design.md), [demo details](.factory/demo.md), [claim checks](.factory/claims.json), [privacy policy](privacy/index.html), [terms](terms/index.html), and [factory handoff](.factory/handoff.md).

## Deploy

Deploy the contents of `dist/` as a static site. The included Azure Static Web Apps configuration gives Vite's content-hashed `/immutable/*` files a one-year immutable cache policy while keeping `sw.js` revalidated, sets the manifest MIME type, and applies the response security policy. The host should serve directory indexes for `/privacy/` and `/terms/`. Do not configure an SPA catch-all over those pages. The factory owns DNS and deployment infrastructure.

## License

MIT. Generated project artwork is original to Pocket Reconcile and is covered by the same license; its prompt and provenance are recorded in `.factory/design.md` and `assets/src/pressed-ledger.prompt.json`.
