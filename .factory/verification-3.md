# Independent verification 3 — FAIL

- **Candidate:** `344df54d26e7358e560c9994a68f72e915d7d104`
- **Live URL:** <https://pocket-reconcile.sociobot.in>
- **Run:** 2026-08-28, clean checkout
- **Verdict:** **FAIL — do not release.**

The deployed HTML, executable JavaScript/CSS entrypoints, and service worker
are byte-identical to the candidate production build. This is not a
deployment-only failure. The previous API rate-limit finding is fixed, but
three release blockers remain.

## Required first checks

### Claims: blocking failure

`.factory/claims.json` is absent. Therefore there are no claim tests to run
from the demo entry point, which is itself a release-blocking condition under
the claims contract.

The landing page and README make unregistered claims including “Works
offline”, “Exact decimal arithmetic”, “Encrypted backups”, “Your records stay
on this device”, “No bank login”, CSV import/export, and AES-256-GCM/PBKDF2
backup. None has the required one-to-one claim-test record.

### First-read and demo: blocking failure

Cold, new-profile mobile read at 390×844 displayed:

> “Bring the numbers back into agreement.”
>
> “Record the handful of things your bank or memory missed…”

The only primary action is **“Plant my first account”**. It does not say who
the product is for (the privacy-minded mobile budgeter) in plain words, and it
does not offer the mandatory one-click **“Try it with sample data”** action.

`/demo` and `/demo?demo=1` both returned the exact same root HTML as `/`
(SHA-256 `5562826242f9869bc6dd1b42eee05e030a6850b30ba6fe6880d647cb2e59fbef`).
They provide no sample records, separate `demo:` storage namespace, persistent
demo banner, Reset demo, or Start for real control. `.factory/demo.md` is also
missing. A user must create a real local account before seeing the product.

## Clean-checkout gates

`npm ci` completed successfully: 62 packages audited, 0 vulnerabilities.

`npm test` was run from the clean checkout. Its constituent gates passed:

- Vitest: **19/19** tests passed.
- Strict TypeScript and `vite build`: passed; `dist/` produced.
- Local production Playwright: **12/12** at 390×844 and **12/12** at
  1440×1000 passed.

No lint script is defined. Initial application JavaScript is 36,919 bytes raw
(12,570 gzip); application CSS is 17,884 bytes raw (4,760 gzip), within the
static/PWA budgets.

## Live verification

The deployment matches this candidate exactly:

- `index.html` hash matches local `dist/index.html`.
- Live `sw.js` hash matches local `dist/sw.js`:
  `6424b8fef005a74ee4fff55d207a75fafb051d58846622c0f4d12f166629d4ed`.
- The live shell advertises `pocket-reconcile-be41f865ba58` and the expected
  `app-ItbdF3_5.js` / `app-BeJ3n0JR.css` assets.

Live Playwright against the URL passed **24/24** (12 mobile plus 12 desktop).
This covered account creation, cent-exact maximum amounts, invalid CSV rejection
without mutation, duplicate-account rejection, undo, keyboard focus/dialog
escape, same-origin ordinary workflow, update prompt, 44px tested link targets,
axe serious/critical baseline in light and dark legal pages, and first-visit
service-worker offline reload with browser HTTP cache disabled. No page or
console errors occurred on cold load. The explicit live offline test also
passed independently (1/1).

Privacy/evidence: the ordinary free flow made requests only to the product
origin. Local data code uses IndexedDB/localStorage; no runtime third-party
script/font is loaded. The CSP permits only `self` plus the required Sociobot
API as `connect-src`; immutable JavaScript is served with
`Cache-Control: public, max-age=31536000, immutable`.

The live root returned 200 with `nosniff`, strict referrer policy, HSTS, CSP,
and restrictive Permissions-Policy. `/privacy/`, `/terms/`, manifest, robots,
and sitemap returned 200. `/not-a-real-route` incorrectly returned the app
shell with HTTP 200 rather than a designed 404.

## API and paid path

The previously reported rate-limit failure is resolved. A fresh 100-request
parallel burst to the documented license verification endpoint returned:

- 30 × HTTP 200
- 70 × HTTP 429
- every 429 included `Retry-After: 4` (and `X-RateLimit-After: 4`)

The effective observed threshold was roughly 30 requests in that burst.

However the visible **Buy Field Kit** path remains broken:

```text
GET https://api.sociobot.in/api/v1/products/pocket-reconcile/checkout
HTTP 404
{"error":"enabled factory product","status":404}
```

## Defects

### Critical — claims contract is absent

`.factory/claims.json` is missing, so zero advertised claims have their
required sandbox proof. Add the manifest and a clean-demo observable test for
every visitor-facing claim; remove claims that cannot be tested.

### Critical — no isolated one-click sample-data demo

There is no “Try it with sample data” action or real demo route. Implement the
documented demo sandbox with realistic sample data, `demo:`-prefixed storage,
the persistent disclosure/reset/start-real controls, and offline coverage.

### High — paid checkout is unavailable

The app advertises a ₹499 one-time Field Kit but its required Sociobot checkout
endpoint returns 404. Enable/register the production product and verify the
hosted checkout/return flow.

### Medium — unknown routes are successful app shells

`/not-a-real-route` returns HTTP 200 and the normal application, not a real
product-styled 404 with a recovery link.

## Re-check command

```sh
npm ci
npm test
npm run build
PLAYWRIGHT_BASE_URL=https://pocket-reconcile.sociobot.in npm run test:e2e
```

Before reconsideration, run every command in the new `.factory/claims.json`
against `/demo` or `?demo=1`, verify the demo never writes real data, and
repeat the checkout test.
