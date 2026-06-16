---
description: Run checks, then commit and open a scoped PR for the current change
argument-hint: "[optional: what this MR is / which files are in scope]"
---

# Open a merge request: $ARGUMENTS

Take the current change from working tree to an open PR, **with quality checks run first**. Optional context about scope/intent: `$ARGUMENTS`.

Follow these steps in order. Stop and surface the problem if any step fails — do not push or open a PR on red checks.

## 1. Establish scope

- Run `git status --short` and review the diff. The working tree may contain **unrelated in-progress work**. Decide which files belong to *this* MR (use `$ARGUMENTS` if given; otherwise infer from the coherent change and confirm with the user if ambiguous).
- Do **not** sweep in unrelated changes. Leave other WIP unstaged.

## 2. Run the quality gate (before any commit/push)

Run all three, from the repo root, and read the output:

```
npm run lint
npm run type-check
npm test
```

- These mirror CI's fast checks (build + audit stay CI-only — no Contentful calls here).
- If any **fails**, fix it (or, if the failure is in unrelated WIP outside this MR's scope, tell the user — the working-tree gate can't push past it) before continuing. Re-run until green.
- A pre-push hook re-runs these on `git push` as a backstop, but run them here so failures are caught before committing.

## 3. Branch

- If on `main` (or the default branch), create a feature branch: `git checkout -b <type>/<short-kebab-summary>` (e.g. `feature/...`, `fix/...`). Never commit the MR directly to `main`.
- If already on a suitable feature branch, stay on it.

## 4. Commit (scoped)

- `git add` **only** the in-scope files from step 1.
- Confirm with `git diff --cached --stat` that nothing unrelated is staged.
- Commit with a clear message: a concise subject line, then a body explaining the *why*. End with the repo's commit trailer:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

## 5. Push

- `git push -u origin <branch>`. The pre-push hook runs lint/type-check/tests again; if it blocks, fix and retry.

## 6. Open the PR

- `gh pr create` with a title matching the commit subject and a structured body: **Summary**, **Changes**, **Tests**, and any **Notes** (e.g. what was intentionally left out of scope).
- End the PR body with: `🤖 Generated with [Claude Code](https://claude.com/claude-code)`

## 7. Verify

- Report the PR URL.
- Watch CI: `gh pr checks <number>` until it completes. If checks fail, investigate and fix (push follow-up commits), then re-verify. Don't consider the MR done until CI is green.
