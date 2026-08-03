# Cookbook: tag filter pills on category pages

**Type:** Task · **Status:** Done (2026-08-03) · **Area:** `src/app/cookbook`, `scripts` · **Depends on:** —

## Objective

Category pages (starting with Mains, now at ~24 recipes) are getting long. Add
filter pills above the recipe grid — e.g. **chicken**, **pasta**, **sausage** —
driven by a new multi-value `tags` field on the recipe content type. A recipe
carries as many tags as apply, so it appears under every matching pill
(creamy sausage fusilloni shows under both *sausage* and *pasta*).

## Background / current state

- The site is static-exported: all recipe cards for a category are already in
  the built HTML, so filtering is client-side show/hide — no server, no
  network requests, instant.
- `src/app/cookbook/[categorySlug]/page.tsx` is a server component rendering a
  grid of `RecipeCard`s from `recipesInCategory()` (`src/lib/cookbook.ts`).
- Categories are deliberately code-defined values on a validated dropdown, not
  referenced entries (avoids the orphaned-reference failure mode travel hit
  with countries). Tags follow the same philosophy: a plain field, not a tag
  content type and not Contentful metadata tags.
- State as of 2026-08-02: 11 published recipes, 13 drafts awaiting photos —
  all need tags backfilled.

## Technical Specifications

### Contentful model

- Add `tags` to the `recipe` content type: **Array of Symbols**, optional.
- Add an accepted-values validation to prevent vocabulary drift
  (`chicken` vs `Chicken`). Starting vocabulary, lowercase, single-word where
  possible: `chicken`, `beef`, `pork`, `lamb`, `sausage`, `seafood`, `pasta`,
  `curry`, `rice`, `veggie`. Extending the list is a content-model edit, which
  is deliberate friction — the feature degrades as the vocabulary sprawls.
- Field addition + backfill of the 24 existing entries via a CMA script
  (drafts must stay drafts — update only, no publish; published entries are
  republished). Tag assignments proposed by Claude, reviewed by Max.

### Filtering UI

- Extract the recipe grid into a client component (e.g.
  `CategoryRecipeGrid`, `"use client"`) taking the category's recipes; the
  page itself stays a server component.
- Pills are **derived from the tags present in that category's recipes** —
  no configured pill list, no empty pills. Categories with no tagged recipes
  (sides/desserts today) render no pill row at all.
- Single-select + "All" default. Selecting a pill filters to recipes
  containing that tag; the recipe-count line reflects the filtered count.
- Pill order: by descending recipe count, ties alphabetical — most useful
  pills never need a swipe.
- **Responsive layout, one component, no device fork:**
  - Mobile: single row, `overflow-x-auto`, no wrap, scrollbar hidden.
    Swipe affordance is required: right-edge gradient fade and/or spacing so
    a pill sits half-cut at the viewport edge.
  - `sm:` and up: same markup wraps naturally (`sm:flex-wrap`).
- Pills are `<button aria-pressed>` elements; keyboard focus scrolls the row.
- Untagged recipes always show under "All" (and only there) — tags are
  optional, absence must render cleanly.

### Tooling

- `scripts/create-recipe.mjs`: add `--tags chicken,pasta` option, validated
  against the accepted-values list; include in the dry-run printout.
- One-off backfill script for the existing 24 entries (same
  update-vs-publish rules as above); delete after use.

## Acceptance Criteria

- [x] `tags` field exists on the recipe content type with accepted-values
      validation; all 27 existing recipes tagged (drafts still drafts) —
      done 2026-08-03 via CMA script. Blueberry & white chocolate pots left
      deliberately untagged (protein/carb tags don't fit desserts).
- [x] Mains page shows derived pills; selecting one filters the grid and
      updates the count; "All" restores everything.
- [x] A multi-tagged recipe appears under each of its tags' pills.
- [x] Categories with no tagged recipes render exactly as today (no pill row).
- [x] Mobile (< `sm`): pills stay on one swipeable row with a visible
      more-content affordance (right-edge fade + edge-bleed half-cut pill);
      desktop: pills wrap. Same component — verified via Playwright
      screenshots at 375px and 1280px.
- [x] `create-recipe.mjs --tags` sets tags on new recipes and rejects values
      outside the vocabulary.
- [x] Unit tests: pill derivation (dedupe, ordering), filter behaviour,
      untagged-recipe handling, empty-tag-category rendering. (`--tags`
      parsing was verified manually via dry-run; the script has no test
      harness and growing one wasn't worth it for an arg-parser.)
- [x] `npm run lint`, type-check, and tests pass (pre-push hook).

## Notes

- **Out of scope:** multi-select pills (AND/OR semantics), a mobile dropdown
  variant (rejected: hides the vocabulary, adds a tap, forks the UI), tag
  pills on the `/cookbook` index or recipe detail pages, URL state
  (`?tag=pasta` deep-linking — nice-to-have, revisit if wanted), search
  integration.
- Decision record: swipeable single row chosen over (a) device-forked
  pills/dropdown views — double markup and behavioural drift; (b) free
  wrapping on mobile — acceptable fallback at ~8 tags but degrades as the
  list grows. The real lever is keeping the vocabulary tight (~10 tags).
- Vocabulary lives in the Contentful validation, not code: the UI derives
  pills from data, so no TS constant needs to stay in sync. The script
  fetches or mirrors the list for `--tags` validation.
