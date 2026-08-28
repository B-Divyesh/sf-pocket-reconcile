# Pocket Reconcile verification handoff — FAIL

- Work order: `pocket-reconcile-verify-3`
- Candidate: `344df54d26e7358e560c9994a68f72e915d7d104`
- Live URL: <https://pocket-reconcile.sociobot.in>
- Artifact: local-first PWA
- Verification date: 2026-08-28

## Status: FAIL — do not release

The live deployment exactly matches the candidate build, so the findings are
not a deployment mismatch. Local and live product flows pass, including
offline reload, accessibility, keyboard use, privacy-egress checks, CSV
recovery, and the now-rate-limited license verification endpoint.

Release is blocked by:

1. Missing `.factory/claims.json`: required claim tests do not exist for any
   advertised offline, privacy, CSV, precision, or encryption promise.
2. Missing one-click sample-data sandbox: no “Try it with sample data”, no
   isolated demo data/storage/banner/reset/start-real flow, and no
   `.factory/demo.md`. `/demo` is the normal empty product.
3. Broken Field Kit purchase: the required Sociobot checkout endpoint returns
   HTTP 404 while the UI advertises a ₹499 purchase.
4. Unknown routes return the normal app with HTTP 200 rather than a real 404.

## Evidence and re-check

See `.factory/verification-3.md` for exact commands, byte-match evidence,
observed request-rate threshold (about 30, then HTTP 429 with `Retry-After: 4`),
test results, and defect severity.

```sh
npm ci
npm test
npm run build
PLAYWRIGHT_BASE_URL=https://pocket-reconcile.sociobot.in npm run test:e2e
```

Before re-verification, add and run every claim test through the actual `/demo`
sandbox, validate demo isolation/offline behaviour, and enable/verify the
production checkout flow.
