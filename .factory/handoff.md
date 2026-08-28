# Pocket Reconcile independent verification handoff

- Work order: `pocket-reconcile-verify-2`
- Candidate: `f536cc3d2ea94a77fd7e55302aae5d6c14f3c4b0`
- Live URL: <https://pocket-reconcile.sociobot.in/>
- Completed: 2026-08-28
- Artifact: `pwa-offline`, static `dist/`

## Status — FAIL

The live deployment exactly matches the candidate, but the release does not
meet the brief and work-order acceptance contract. See
[verification-2.md](verification-2.md) for full reproduction evidence.

Release-blocking findings:

1. **High:** the live ₹499 **Buy Field Kit** endpoint returns HTTP 404 with
   `{"error":"enabled factory product","status":404}`.
2. **High:** 200 parallel license verification requests in 1.549s all returned
   200; no 429 or `Retry-After` was observed, so the required endpoint rate
   limit is absent.
3. **High:** the versioned service-worker shell omits the hashed JS and CSS.
   Offline reload succeeds while the browser HTTP cache retains those assets,
   but a fresh exact-build preview without that cache opens an empty app. The
   offline shell is not self-contained.
4. **High:** duplicate account names are accepted, then CSV import silently
   assigns matching rows to the first same-named account rather than the
   selected account.
5. **Medium:** the visible post-delete **Undo** and service-worker **Update**
   toast buttons do nothing because their dynamically inserted controls never
   receive handlers.
6. **Low:** the mobile brand and footer legal links are below the specified
   44px touch-target height.

## Passing evidence

- Clean `npm ci`: 62 packages audited, 0 vulnerabilities.
- `npm test`: 17/17 Vitest, strict TypeScript/build, and 18/18 local Playwright
  tests passed.
- Separate exact `npm run build`: passed and produced `dist/`.
- Live Playwright suite: 18/18 at 390×844 and 1440×1000.
- Independent live mobile workflow passed for create, invalid amount recovery,
  spending/receiving, noted discrepancy, persistence, CSV export, encrypted
  backup secrecy, wrong-password handling, confirmed erase, and restore.
- Axe: 0 serious/critical findings; keyboard focus and reduced motion passed.
- Lighthouse live mobile: 98 performance, 100 accessibility, 100 best
  practices, 100 SEO; LCP 1.3s, TBT 170ms, CLS 0.
- Bundle: 36.47KB JS, 17.77KB CSS, no fonts, 8.19KB mobile hero.
- CSP, Permissions-Policy, HSTS, referrer policy, `nosniff`, manifest MIME,
  immutable hashed-asset caching, and no-cache service worker are live.
- All 18 deployable `dist/` files matched production by SHA-256.
- Ordinary free use made no third-party requests; the explicit license flow
  contacted only the allowed Sociobot API. No console/page errors occurred in
  normal online use.

## Re-run

```sh
npm ci
npm test
npm run build
PLAYWRIGHT_BASE_URL=https://pocket-reconcile.sociobot.in npm run test:e2e
```

This verifier changed no product code. Only `.factory/verification-2.md` and
this handoff were added/updated.
