# Pocket Reconcile polish-3 handoff

## Delivered

Perfection-loop round 3 is complete. All findings in `.factory/review-1.md`,
`.factory/review-2.md`, and `.factory/review-3.md` are closed, including the
six findings introduced by review 3. The cumulative 28-item evidence map is in
`.factory/polish-3.md`.

The repair adds the isolated legacy-duplicate CSV claim, corrects Node support
documentation, removes unprovable backup wording, makes CSV wording exact,
renames the entry section, and gives every dialog an accessible name with
target-specific actions and focus. It also adds an explicit 8px gap to wrapped
404 actions on mobile. The first-screen wording, one-click `?demo=1` sandbox,
storage separation, real routes, titles, metadata, focus restoration, legal
links, mobile layout, privacy behavior, and offline PWA behavior were all
revalidated.

The pressed-botanical field-notebook visual system remains intact. The product
is still a static, local-first PWA with no backend, analytics, third-party
font, or third-party script.

## Release references

- Review base: `2132cf93396682f2aa91a80a2972afa45e60d395`
- Candidate under review: `51c2b10ee9aba4493700cf517cff7215a1759b4a`
- Repair commits: `1682f8f`, `f738598`, `a16b69d`
- Application commit deployed and independently cloned:
  `a16b69d5b0861c449dd8ae4ef9bbb9dc8df78739`
- Live URL: <https://pocket-reconcile.sociobot.in>
- Final application deployment ID: `d72a7dcf-9416-48a9-8b5c-c52504aab8b9`
- Deployment target: Azure Static Web Apps, `centralus`, custom domain ready
- Deployment command: `/opt/fleet/lib/deploy-static.sh pocket-reconcile dist`

## Clean-clone evidence

The final application commit was cloned from `origin` to
`/tmp/pocket-reconcile-polish3-release-clean-mTJFtS/repo`. No working-tree
files were copied into it.

- `npm ci`: 61 packages installed; zero reported vulnerabilities.
- Every exact command in `.factory/claims.json` ran separately: **18/18
  passed** in both configured browser projects. Aggregate log:
  `/tmp/pocket-reconcile-polish3-release-claims.log`; individual logs:
  `/tmp/pocket-reconcile-polish3-release-claim-<id>.log`.
- `npm test`: **25/25 unit and deployment checks passed**, followed by a
  production build and **68/68 Playwright checks passed**.
- Final `npm run build`: `dist/index.html` at the output root; application JS
  38.14 KB (12.70 KiB gzip) and CSS 20.07 KB (5.18 KiB gzip).
- The test matrix covers unit arithmetic, CSV validation, encrypted backups,
  TypeScript, build policy, all 18 claims, both responsive viewports,
  keyboard/focus, route history, metadata, designed 404, mobile geometry,
  privacy egress, service-worker update, and offline reload.

## Live evidence after deployment

- `PLAYWRIGHT_BASE_URL=https://pocket-reconcile.sociobot.in npm run test:e2e`:
  **68/68 passed**. Log:
  `/tmp/pocket-reconcile-polish3-release-live-e2e.log`.
- URL verifier: HTTP 200 in 1907ms; title present, `lang=en`, one h1, one main,
  zero missing alt text, zero unnamed buttons, and zero console errors.
- Axe: zero serious or critical violations across root, demo, Privacy, Terms,
  404, and offline pages in light and dark reduced-motion contexts.
- Privacy: a cold demo flow requested only
  `https://pocket-reconcile.sociobot.in`; no analytics or third-party request.
- Offline: a fresh first visit to the sample ledger reloaded successfully
  after `context.setOffline(true)` with browser HTTP cache disabled.
- Routing: `/`, `/?demo=1`, `/demo`, `/privacy/`, `/terms/`, `/404.html`, and
  the offline route rendered their own title, h1, header, footer, and focus
  target. An unknown path returned the designed page with HTTP 404.
- Demo: direct `/?demo=1` showed the persistent sample banner, Reset demo, and
  Start for real. Reset restored the seed; exit removed all demo state and
  preserved personal state.
- Dialogs: Add account, Delete entry, Delete account, and Erase ledger exposed
  names and focused their target-specific primary action.
- Lighthouse mobile: **Performance 100, Accessibility 100, Best Practices
  100, SEO 100**; FCP 1.0s, LCP 1.3s, Speed Index 1.0s, TBT 20ms, CLS 0;
  transfer 93,303 bytes.
- Final cold check timestamp: `2026-08-28T23:18:26.776Z`; 404 action gap 8px;
  zero console errors.
- Live assets matched local output byte-for-byte:
  - `index.html`: `25121edb2891749c47a20b0e5ec06518517341558f9d2fdfc3c69ac8f400f0c4`
  - `main-D9TkFSty.js`: `0023ac61560aa7984c0fe3bc5c06c1b6539b79bbfc5f3bbd3a1a31682d1ec0c3`
  - `main-COtKtJPi.css`: `8d7769cd982563931816cb27b2bc1f85e17676f04a2698bc13144910dfa151e5`

Committed screenshots and machine-readable summaries are in
`.factory/evidence/polish-3/`. They include the live mobile home and demo,
entry form, every dialog, mobile 404, cold-check JSON, URL-verifier output,
Lighthouse summary, and artifact hashes.

## Run and verify

```sh
npm ci
npm test
npm run build
```

Run one registered claim exactly as the verifier does:

```sh
npm run test:claims -- --grep @claim:legacy-duplicate-csv
```

Run the complete browser suite against production:

```sh
PLAYWRIGHT_BASE_URL=https://pocket-reconcile.sociobot.in npm run test:e2e
```

The one-click sample entry point is
<https://pocket-reconcile.sociobot.in/?demo=1>. Use **Reset demo** to restore
the sample or **Start for real** to discard the isolated demo database and
preferences.

## Known gaps and next steps

None. No review finding, minor item, TODO, or deferred product work remains.
Infrastructure, DNS, and billing were not changed.
