# Pocket Reconcile

Pocket Reconcile is a tiny, private balance-checking PWA for people who want to reconcile cash, cards, and manual transactions from a phone without connecting a bank or adopting a full budgeting system.

It keeps accounts, integer-precise transaction amounts, and reconciliation history in IndexedDB on the current device. It works offline after the first visit and provides CSV plus password-encrypted full backups so the user owns the ledger.

Live product: <https://pocket-reconcile.sociobot.in>

## What v1 includes

- Multiple local cash, card, or other accounts in seven common currencies
- Fast spent/received entries with dates and notes
- Count-to-balance checks with a mandatory note for discrepancies
- A visible history of exact matches and carried-forward differences
- CSV transaction import/export
- AES-256-GCM encrypted full export and restore, with PBKDF2 key derivation
- Installable offline PWA with an explicit offline state and update prompt
- Free edition with two accounts; one-time ₹499 Field Kit license for unlimited accounts and manual paper tone
- No bank credentials, analytics, ads, cloud ledger, or third-party runtime assets

Pocket Reconcile is a record-keeping utility, not financial advice, a bank feed, or an accounting system.

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

Browser records are not synced or recoverable by the maintainers. A full `.pocket` backup contains accounts, entries, and balance checks in a versioned JSON envelope encrypted locally with AES-256-GCM. Its password is not stored and cannot be recovered. CSV is intentionally portable but does not include opening balances or reconciliation history.

License checkout and verification use only the Sociobot billing API. No payment provider is embedded in this repository, and there is no product ID to configure in the client.

See [the design thesis](.factory/design.md), [privacy policy](privacy/index.html), [terms](terms/index.html), and [factory handoff](.factory/handoff.md).

## Deploy

Deploy the contents of `dist/` as a static site. The included Azure Static Web Apps configuration gives Vite's content-hashed `/immutable/*` files a one-year immutable cache policy while keeping `sw.js` revalidated, sets the manifest MIME type, and applies the response security policy. The host should serve directory indexes for `/privacy/` and `/terms/`. Do not configure an SPA catch-all over those pages. The factory owns DNS and deployment infrastructure.

## License

MIT. Generated project artwork is original to Pocket Reconcile and is covered by the same license; its prompt and provenance are recorded in `.factory/design.md` and `assets/src/pressed-ledger.prompt.json`.
