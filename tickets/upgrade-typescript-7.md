# Upgrade TypeScript to v7 (native Go compiler) once tooling supports it

**Type:** Task · **Status:** Blocked · **Area:** Tooling / dependencies · **Priority:** Low

## Objective

Move the project from TypeScript 5.9.x to TypeScript 7 — the ground-up native
(Go) rewrite of the compiler, with much faster type-checking and builds. The
upgrade is currently **blocked by the two tools that link against the TS
compiler API**, and this ticket is the reminder to re-check and execute once
they catch up.

## Current state (2026-07-10)

- Project is on `typescript ^5` (5.9.3); TS `latest` on npm is **7.0.2**.
- **Blocker 1 — ts-jest** (29.4.11): peer range `typescript >=4.3 <7`. No
  prerelease with TS 7 support exists.
- **Blocker 2 — typescript-eslint** (bundled inside `eslint-config-next`):
  peer range `typescript >=4.8.4 <6.1.0`, unchanged even in the current canary
  (8.63.1-alpha.x).
- These caps are real, not stale metadata: both tools consume the TS compiler
  API, which changed in the Go rewrite. They need actual porting work upstream.

## Unblock conditions (re-check these)

- [ ] `npm info ts-jest peerDependencies` — `typescript` range includes 7
- [ ] `npm info typescript-eslint peerDependencies` — `typescript` range includes 7
      (or `eslint-config-next` has moved to a TS-7-compatible lint stack)

## Technical Specifications

1. Bump `typescript` in devDependencies to `^7` (and ts-jest / eslint-config-next
   to whatever versions carry the support).
2. Run the full gate: `npm run lint`, `npm run type-check`, `npm test`,
   `npm run build`. Expect the native compiler to surface stricter/new type
   errors — fix as needed.
3. Check `tsconfig.json` for options deprecated or removed in TS 6/7 (the 6.x
   line was the bridge release that flagged them).

## Optional interim step

**TypeScript 6.0 is already inside both peer ranges** (ts-jest `<7`,
typescript-eslint `<6.1.0`). Bumping to 6.0 early does the 7-alignment work
(deprecations become errors) while staying on supported tooling, making the
eventual 7 bump near-trivial. Decided against for now; revisit if the blockers
drag on.

## Acceptance Criteria

- [ ] `typescript@^7` installed with no peer-dependency conflicts (no `--force`)
- [ ] lint, type-check, all tests, and full static-export build green
- [ ] CI (PR checks + deploy workflow) green on a real PR
