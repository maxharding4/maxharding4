# design-sync notes — Personal Site

Project: **Personal Site** (`aa387dca-a9c0-4a77-b870-6a5673f0d3f8`) — https://claude.ai/design/p/aa387dca-a9c0-4a77-b870-6a5673f0d3f8

## Repo-specific setup (this is an app, not a DS package)

- **No library build / no `dist` entry.** This is a Next.js app. We bypass the converter's
  synth-entry (which would `export *` *every* file in `src/`, dragging in `app/layout.tsx` →
  `globals.css` → `@import "tailwindcss"` that esbuild can't resolve, plus all the
  Contentful/server code). Instead `cfg.entry = .design-sync/ds-entry.tsx` re-exports ONLY the
  scoped reusable components as named exports. With `--entry` set, `PKG_DIR` resolves to the repo
  root — no `node_modules/maxharding4` self-symlink is needed (an early attempt used one; removed).
- **`next/link` / `next/image` are aliased to render-safe shims** (`.design-sync/shims/`) via
  `.design-sync/tsconfig.bundle.json` (`cfg.tsconfig`). That tsconfig is bundle-only — it is NOT
  the real Next build config. The shims render `<a>` / `<img>` so cards render without a Next router.
  - ⚠️ **Never put a `"//"` comment key in `tsconfig.bundle.json`.** The esbuild path-alias
    plugin (`lib/bundle.mjs`) strips `//` with a naive regex that corrupts the line, silently
    disabling ALL aliasing → the real `next/link` gets bundled → previews throw
    `ReferenceError: process is not defined` and `[BUNDLE_EXPORT] not a component`.
- **Tailwind v4 is JIT** — `src/app/globals.css` ships no utility classes. A compiled stylesheet
  is generated to `.design-sync/compiled-tailwind.css` (`cfg.cssEntry`, gitignored) by:
  `node .ds-sync/node_modules/@tailwindcss/cli/dist/index.mjs -i .design-sync/tailwind-input.css -o .design-sync/compiled-tailwind.css`
  `tailwind-input.css` `@source`s the 6 component files + `previews/**`. **Recompile it before
  every build** when component or preview classes change (esp. NavigationCard gradient classes).
- **Install converter deps + playwright in `.ds-sync` sequentially**, not concurrently — two
  `npm i` in the same dir race and clobber each other's `node_modules` (it happened: playwright's
  install removed esbuild/ts-morph).

## Scope

- Synced: Breadcrumb, ContactInfo, ExperienceCard, NavigationCard, SkillsSection, Timeline.
- Excluded (`componentSrcMap: null`): CityCard, CountryCard (props are Contentful `Entry<...>`
  objects + `next/image`) and all runtime/data components (PhotoGallery, PhotoOfTheDay, Header,
  Footer, GoogleAnalytics, PrintButton, SearchBox). The two Contentful cards are authorable on a
  later re-sync — they'd need mocked Contentful entries (via `cfg.provider`/`$ref` data modules).
- These 6 have no JSDoc/docs, so `.prompt.md` is synthesized from `.d.ts` + the authored previews.

## Re-sync risks (watch-list for the next run)

- `.design-sync/compiled-tailwind.css` is **gitignored and regenerated** — a re-sync MUST recompile
  it (command above) BEFORE the build, or any new utility class renders unstyled.
- The shims **approximate** `next/link`/`next/image`. If a synced component starts depending on
  Next-specific link/image behaviour, the preview will diverge from production — revisit the shims.
- Grades carry forward via the uploaded `_ds_sync.json`; authored previews live in
  `.design-sync/previews/`. Both are durable. A fresh clone has no `.ds-sync/` or compiled CSS —
  re-stage scripts, reinstall deps, recompile Tailwind first.
- Re-sync command (from repo root, after recompiling Tailwind and fetching the remote anchor to
  `.design-sync/.cache/remote-sync.json`):
  `node .ds-sync/resync.mjs --config .design-sync/config.json --node-modules ./node_modules --out ./ds-bundle --remote .design-sync/.cache/remote-sync.json`

## Known render warns

- None. Render check was clean (6/6, 0 bad/thin/identical).
