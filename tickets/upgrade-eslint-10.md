# Upgrade ESLint to v10 once eslint-plugin-react supports it

**Type:** Task · **Status:** Blocked · **Area:** Tooling / dependencies · **Priority:** Low

## Objective

Move from ESLint 9.x to 10.x. Attempted 2026-07-10 and reverted: the lint run
crashes because `eslint-plugin-react` (pulled in by `eslint-config-next`) calls
`context.getFilename()`, an API removed in ESLint 10.

## Current state (2026-07-10)

- Project pinned back to `eslint ^9` (9.39.4).
- `eslint-config-next` declares peer `eslint >=9.0.0`, but its bundled
  `eslint-plugin-react@7.37.5` (also the npm latest) only supports
  `eslint ^3–^8 || ^9.7` — no v10-compatible release exists.
- Error signature if retried too early:
  `TypeError: Error while loading rule 'react/display-name': contextOrFilename.getFilename is not a function`

## Unblock conditions (re-check these)

- [ ] `npm info eslint-plugin-react@latest peerDependencies` — `eslint` range includes `^10`
- [ ] `eslint-config-next` ships a version depending on that plugin release

## Technical Specifications

1. Bump `eslint` to `^10` (and `eslint-config-next` if a newer version carries
   the fixed plugin).
2. Run `npm run lint` over the whole repo — v10 removed other deprecated
   context APIs, so watch for the same crash from other plugins.
3. Full gate before PR: lint, type-check, tests.

## Acceptance Criteria

- [ ] `eslint@^10` installed, `npm run lint` runs clean end-to-end
- [ ] No `--force` / peer-dependency overrides needed
- [ ] CI PR checks green
