# Cookbook: add /cookbook routes and UI

**Type:** Task · **Status:** To Do · **Area:** `src/app/cookbook` · **Depends on:** `cookbook-recipe-content-model.md`

## Objective

Add a statically-exported cookbook section mirroring the travel layout:

```
/cookbook                          — 4 category cards (Mains, Sides, Snacks, Desserts)
/cookbook/[categorySlug]           — recipe cards for that category
/cookbook/[categorySlug]/[recipeSlug] — recipe detail page
```

## Background / current state

- Travel provides the pattern to copy: `src/app/travel/page.tsx` (index of
  `CountryCard`s) → `travel/[countrySlug]/page.tsx` (grid of `CityCard`s, uses
  `generateStaticParams`) → `travel/[countrySlug]/[citySlug]/page.tsx` (detail).
- Categories are **code-defined** (see the model ticket): recipes carry a validated
  `category` field with values `mains | sides | snacks | desserts`; there is no
  category content type.
- Data access via the existing `getEntriesByType` helper in `src/lib/contentful.ts`;
  types come from `RecipeSkeleton` (added by the model ticket).
- Site is static-exported: one fetch of all recipes at build time, partitioned by
  category in code.

## Technical Specifications

### Category config (code)

A single `CATEGORIES` const (e.g. `src/lib/cookbook.ts`) drives everything:

```ts
export const CATEGORIES = [
  { slug: "mains", label: "Mains", blurb: "..." },
  { slug: "sides", label: "Sides", blurb: "..." },
  { slug: "snacks", label: "Snacks", blurb: "..." },
  { slug: "desserts", label: "Desserts", blurb: "..." },
] as const;
```

- `/cookbook` renders one card per entry, in this order, each showing its recipe count
  and a preview image (first recipe's image in that category, else placeholder).
- Both dynamic segments use `generateStaticParams`: categories from `CATEGORIES`,
  recipes from the fetched entries.

### Pages

- **`/cookbook`** — heading + 4 category cards. Follow the `/travel` index structure;
  a category with zero recipes still renders its card (styled like the coming-soon
  treatment on `CityCard`).
- **`/cookbook/[categorySlug]`** — `Breadcrumb`, category heading + blurb, grid of
  recipe cards (image, title, description teaser, prep+cook time when present).
  Empty state: "Recipes coming soon" line, matching the homepage Latest empty-state tone.
  Unknown category slugs 404 (`notFound()`); only the four configured slugs are
  generated.
- **`/cookbook/[categorySlug]/[recipeSlug]`** — `Breadcrumb`, hero image (when
  present), title, description, meta row (servings / prep / cook, hiding absent
  values), **Ingredients** as a bulleted list (split `ingredients` on newlines),
  **Method** as numbered steps (split `method` on blank lines/newlines). Recipes whose
  `category` value doesn't match the route's category 404.
  - Layout is a constrained reading column: hero capped at `max-w-3xl` (~768px), not
    full-bleed — recipe photos are 1536px wide, which is exactly 2× retina-sharp at
    that width; the Images API can only downscale.

### Components

- `RecipeCard` — new, modelled on `CityCard` (image/placeholder, title, teaser, meta),
  **but with an `aspect-[3/2]` image frame, not CityCard's `aspect-[4/3]`** — recipe
  photos are shot/exported at 3:2 and should render uncropped on cards. `CityCard`
  and all travel rendering are untouched. Convention: recipe photos are landscape 3:2
  (any other ratio gets cropped to the 3:2 frame).
- Category cards: reuse/adapt `CountryCard` styling; a small `CategoryCard` is fine if
  reuse gets awkward.

### Site chrome

- `Header.tsx` — add a "Cookbook" nav link alongside CV / Travel.
- `src/app/sitemap.ts` — include `/cookbook`, category pages, and recipe pages.
- Page metadata (`generateMetadata`) per page, following the travel pages.

## Acceptance Criteria

- [x] `/cookbook` renders 4 category cards in the configured order with recipe counts.
- [x] Category pages list only that category's recipes; empty categories show the
      "Recipes coming soon" state instead of a bare grid.
- [x] Recipe pages render ingredients as a list and method as numbered steps; absent
      optional fields (image, servings, times, description) render cleanly.
- [x] Unknown category or recipe slugs 404; `npm run build` statically generates all
      cookbook routes (trailing-slash export, resolvable on S3).
- [x] "Cookbook" appears in the header nav; cookbook URLs appear in the sitemap.
- [x] Unit tests cover: category partitioning, empty-category state, ingredient/method
      line splitting, and 404 on bad slugs.
- [x] `npm run lint`, type-check, and tests pass (pre-push hook).

## Notes

- **Out of scope:** homepage "Latest recipes" teaser (revisit once the section is
  live), search integration (`SearchBox` covers travel only), any Contentful model
  changes, photo-upload tooling for recipes.
- Build guard: a recipe with an unexpected `category` value (shouldn't happen given
  the dropdown validation) is skipped with a build-time warning rather than breaking
  the export — same spirit as the orphaned-country guard on the homepage.
