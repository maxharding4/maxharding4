# Bump GitHub Actions to current majors (Node 20 runtime deprecated)

**Type:** Task · **Status:** In Progress · **Area:** CI / workflows · **Priority:** Low

## Objective

Deploy runs annotate: "Node.js 20 is deprecated. The following actions target
Node.js 20 but are being forced to run on Node.js 24". Bump every action in
`.github/workflows/` to its current major so the warning goes away and we stop
relying on GitHub's forced-runtime shim.

## Current state (2026-07-24)

| Action | Used in | Pinned | Latest |
|---|---|---|---|
| `actions/checkout` | deploy, pr-checks ×2 | v4 | v7.0.1 |
| `actions/setup-node` | deploy, pr-checks ×2 | v4 | v7.0.0 |
| `actions/cache` | pr-checks (Playwright browsers) | v4 | v6.1.0 |
| `actions/upload-artifact` | pr-checks (static export, Playwright report) | v4 | v7.0.1 |
| `actions/download-artifact` | pr-checks (E2E pulls the static export; added in #82) | v4 | v8.0.1 |
| `aws-actions/configure-aws-credentials` | deploy | v4 | v6.2.3 |

## Breaking-change review (2026-07-24)

Release notes for every major boundary reviewed against our usage — **no
blocker found**; all five can go straight to latest:

- **checkout v5/v6/v7**: v5 = Node 24 runtime; v6 persists git credentials to
  a separate file (only affects jobs running authenticated git commands after
  checkout — ours don't); v7 blocks fork checkouts for `pull_request_target` /
  `workflow_run` triggers (we only use `pull_request` + `workflow_dispatch`).
- **setup-node v5/v6/v7**: v5 auto-enables caching from `packageManager` in
  package.json, v6 limits auto-caching to npm — moot, we set `cache: npm`
  explicitly; v7 is an ESM migration + new outputs, inputs unchanged
  (`node-version-file` still supported).
- **cache v5/v6**: Node 24 + ESM only; key format and backend unchanged, so
  the existing Playwright browser cache stays restorable.
- **upload-artifact v5/v6/v7**: v5/v6 = Node 24; v7 adds an opt-in `archive`
  input. The v4 artifact backend is unchanged; our `name`/`path`/
  `retention-days` usage is untouched.
- **download-artifact v5–v8** (reviewed 2026-09-27): v5 changes the extract
  path only for single downloads *by ID* — we download by `name`; v6/v7 =
  Node 24; v8 errors on digest mismatch (was a warning) and skips unzipping
  non-zip content — our artifact is a normal zipped upload.
- **configure-aws-credentials v5/v6**: v5 "changes invalid boolean input
  behavior" — we pass no boolean inputs, and static
  access-key/secret/region auth is still supported; v6 = Node 24.
- All Node 24 majors need runner ≥ 2.327.1 — satisfied on GitHub-hosted
  `ubuntu-latest`; we have no self-hosted runners.

## Technical Specifications

1. In `.github/workflows/deploy.yml` and `pr-checks.yml`, bump:
   `checkout@v7`, `setup-node@v7`, `cache@v6`, `upload-artifact@v7`,
   `download-artifact@v8`, `configure-aws-credentials@v6`.
2. Open a PR — pr-checks exercises checkout, setup-node, cache, and
   upload-artifact directly.
3. `deploy.yml` isn't exercised by PR checks: after merging, run the deploy
   workflow with `target=staging` (safe dry-run) to prove checkout,
   setup-node, and the AWS credentials step under the new majors.

## Acceptance Criteria

- [ ] All six actions on their current major in both workflows
- [ ] PR checks green (incl. a Playwright-cache hit on a second run)
- [ ] Staging deploy run green
- [ ] No "Node.js 20 is deprecated" annotations on the run
