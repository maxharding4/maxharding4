# Migrate the Next.js site into the live maxharding4/maxharding4 repo

**Type:** Epic / Migration · **Status:** Planning · **Risk:** High (live production cutover)

## Objective

Make the Next.js site (currently in `maxharding4/new-site`) the live site served at
`maxharding4.com`, by **reusing the existing live repo** `maxharding4/maxharding4` —
keeping its domain, S3 bucket, and CloudFront distribution, while swapping the source
(CRA → Next.js) and the CI/CD (CircleCI → GitHub Actions).

## Decisions (agreed)

- **History:** fresh start. Tag current `master` as `legacy-cra` (recoverable), then
  base the repo on the Next.js site. See note on repo size below.
- **CI/CD:** migrate from CircleCI to **GitHub Actions**, deploying to the same bucket.
- **Access:** CircleCI + AWS access confirmed available.

## Current state (verified read-only)

- **Repo `maxharding4/maxharding4`:** Create React App (`react-scripts`) + TS + tachyons.
  Dormant since Jan 2023. Default branch `master`. ~1.1 GB history.
- **Deploy today:** CircleCI, on `master`: `yarn build` → `aws-s3/sync build/ →
  s3://maxharding4.com/` → CloudFront invalidation of `/index.html` + `/service-worker.js`.
- **Hosting:** live. `maxharding4.com` → 200 from S3/CloudFront. `www` → 301 → apex.
  - S3 bucket: `s3://maxharding4.com/`
  - CloudFront distribution: `E18D7W5LICE64E`
  - Canonical is the **apex** (`maxharding4.com`).
- **Service worker:** the CRA app registers one (`/service-worker.js`) — returning
  visitors have it cached. **This is the top migration risk (see below).**

## Target state

- Repo contains the Next.js site; default branch `main`.
- GitHub Actions builds the static export (`output: export` → `out/`) and deploys to the
  **same** `s3://maxharding4.com/` bucket, then invalidates CloudFront `E18D7W5LICE64E`.
- No DNS, bucket, or distribution changes — the domain keeps working throughout.

## Prerequisites (user-side, before cutover)

1. **GitHub repo secrets** on `maxharding4/maxharding4`:
   - `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN` (build-time fetch).
   - AWS auth — **preferred:** OIDC role (`aws-actions/configure-aws-credentials` with
     `role-to-assume`, no long-lived keys). **Fallback:** `AWS_ACCESS_KEY_ID` +
     `AWS_SECRET_ACCESS_KEY` as secrets. Plus `AWS_REGION`.
2. Confirm the IAM principal can `s3:PutObject`/`DeleteObject` on `maxharding4.com` and
   `cloudfront:CreateInvalidation` on `E18D7W5LICE64E`.
3. Enable GitHub Actions on the repo; plan to disable the CircleCI project post-cutover.

## Migration steps (phased — nothing hits prod until Phase 5)

### Phase 0 — Safety / rollback net
- [ ] Tag current live commit: `git tag legacy-cra <master-sha>` and push the tag.
- [ ] Snapshot current bucket: `aws s3 sync s3://maxharding4.com/ ./_s3-backup-<date>/`
      (so we can restore the exact live site instantly if needed).
- [ ] Record the current CloudFront config (default root object, error pages, cache policy).

### Phase 1 — Deploy pipeline (built + proven off-prod)
- [ ] Author `.github/workflows/deploy.yml`: checkout → setup-node 20 → `npm ci` →
      `npm run build` (Contentful env) → configure AWS creds → `aws s3 sync out/
      s3://<TARGET>/ --delete` → `aws cloudfront create-invalidation --distribution-id
      E18D7W5LICE64E --paths "/*"`.
- [ ] **Triggers** (rebuild without a code commit — content lives in Contentful, fetched
      at build time):
      - `push` to `main` — auto-deploy on code changes.
      - `workflow_dispatch` — manual "Run workflow" button / `gh workflow run` (one-click
        rebuild after publishing content). Satisfies the "manual rebuild workflow" requirement.
      - `repository_dispatch` (optional) — a **Contentful publish webhook** → GitHub API →
        auto-rebuild on content changes. Fully hands-off endgame.
      - `schedule` (optional) — periodic rebuild if ever wanted.
- [ ] **Dry run to a temp target** (a throwaway bucket or an `s3://maxharding4.com/_staging/`
      prefix) to prove the build + sync works with the real secrets — **no prod overwrite.**

### Phase 2 — Service-worker kill switch (critical)
- [ ] Ship `public/service-worker.js` containing a self-unregistering SW (skipWaiting →
      unregister → clear all caches → reload clients). Static export copies it to
      `out/service-worker.js` → same path the old SW updates from, so cached visitors
      get un-stuck instead of seeing the stale CRA shell.
- [ ] Verify old→new SW takeover in a browser that has the old SW cached.

### Phase 3 — Source import (fresh base, on a branch)
- [ ] On `maxharding4/maxharding4`, create branch `nextjs-migration`.
- [ ] Replace repo contents with the Next.js site (from `new-site`), including the new
      workflow and SW kill file; remove `.circleci/`, CRA files, Cypress, etc.
- [ ] Commit as the fresh base.

### Phase 4 — Canonical / SEO reconciliation
- [ ] Point JSON-LD / OpenGraph / `sitemap.ts` / `robots.ts` at the **apex**
      `https://maxharding4.com` (live canonical), or configure `www` to serve directly.
- [ ] Confirm `404`/error-document behaviour matches CloudFront's config (static export
      produces `404.html`).

### Phase 5 — Cutover (go live)
- [ ] Make `main` the default branch; merge/land `nextjs-migration`.
- [ ] Let Actions deploy to `s3://maxharding4.com/`; watch the run.
- [ ] Invalidate `/*`; hard-verify `maxharding4.com` serves the new site (fresh browser +
      a returning browser with the old SW).
- [ ] Monitor for ~24h.

### Phase 6 — Cleanup
- [ ] Disable the CircleCI project; delete `_staging/` prefix if used.
- [ ] Archive/rename `maxharding4/new-site` to avoid confusion (it's now superseded).
- [ ] (Optional) reclaim repo size — see note.

## Risks & mitigations

- **Push to default branch = instant prod deploy.** All work on branches; Phase 1 dry-run
  proves the pipeline before any prod write.
- **Stale service worker serves the old site** to returning visitors. Mitigated by the
  Phase 2 kill switch — do **not** skip.
- **`s3 sync --delete` wipes the old bucket contents.** That's intended at cutover, but
  Phase 0's snapshot is the rollback. Consider running the first prod sync **without**
  `--delete`, verify, then a second pass with `--delete`.
- **Rollback:** re-sync the Phase 0 snapshot to the bucket + invalidate; the site is back.

## Notes

- **Repo size:** "fresh start" gives a clean working tree, but the `legacy-cra` tag pins
  the old ~1.1 GB of objects, so the **remote repo stays large** until/unless the tag is
  dropped and history is rewritten. Keep the tag for now; reclaim later if desired.
- **No DNS work** — bucket + distribution are unchanged, which removes the scariest class
  of failure (domain/cert/propagation).

## Acceptance criteria

- [ ] `maxharding4.com` serves the Next.js site; `www` still redirects to apex.
- [ ] Returning visitors (old SW cached) get the new site, not the stale shell.
- [ ] Deploys run on push to `main` via GitHub Actions; CircleCI disabled.
- [ ] `legacy-cra` tag + S3 snapshot exist as rollback.
- [ ] No DNS/bucket/distribution changes were required.
