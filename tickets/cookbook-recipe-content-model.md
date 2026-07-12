# Cookbook: create the `recipe` content model in Contentful

**Type:** Task · **Status:** To Do · **Area:** Contentful / content model · **Blocks:** `cookbook-routes-and-ui.md`

## Objective

Add a `recipe` content type to Contentful so the site can serve a cookbook section
(`/cookbook`) organised into four fixed categories: **Mains, Sides, Snacks, Desserts**.

Categories are deliberately **not** a separate content type. Unlike countries→cities
(both open-ended), the category list is small and stable, so it lives as a validated
dropdown field on `recipe`. Category pages (labels, blurbs, ordering) are defined in
code. This avoids extra entries to manage and the orphaned-reference failure mode that
breaks the city-route build when a referenced entry is unpublished.

## Content model

Content type ID `recipe`, display field `title`:

| Field | ID | Type | Required | Notes |
|-------|----|------|----------|-------|
| Title | `title` | Symbol | Yes | Recipe name |
| Slug | `slug` | Symbol | Yes | **Unique**, kebab-case; drives the static route |
| Category | `category` | Symbol | Yes | Dropdown validated to exactly: `mains`, `sides`, `snacks`, `desserts` (lowercase slugs — no mapping needed for routing; display labels live in code) |
| Description | `description` | Long text | No | Short teaser shown on cards and at the top of the detail page |
| Image | `image` | Asset | No | Hero photo (1920px width, same guidance as travel photos). Cards fall back to a placeholder when absent |
| Ingredients | `ingredients` | Long text | Yes | One ingredient per line; rendered as a list |
| Method | `method` | Long text | Yes | One step per paragraph/line; rendered as numbered steps |
| Servings | `servings` | Integer | No | |
| Prep time | `prepTimeMinutes` | Integer | No | Minutes |
| Cook time | `cookTimeMinutes` | Integer | No | Minutes |

Created programmatically via `scripts/create-recipe-content-type.mjs` (idempotent,
`--dry-run` supported) using the CMA token already in `.env.local`.

**No new credentials:** the existing Content Delivery API token covers new content
types automatically; nothing changes in `.env.local` or the deploy workflow.

## Code/docs changes (this ticket)

- `src/types/contentful.ts` — add `RecipeFields` / `RecipeSkeleton`
  (`EntrySkeletonType<RecipeFields, "recipe">`), with `category` typed as the
  union `"mains" | "sides" | "snacks" | "desserts"`.
- `CONTENTFUL.md` — add the `recipe` table to the Content Models section, including
  the fixed category values and the "categories are code-defined" rationale.

## Seed content

- Create and **publish** at least one recipe per category so every category page has
  content to render during the routes ticket.

## Acceptance Criteria

- [x] `recipe` content type exists in Contentful with the fields/validations above
      (created via `scripts/create-recipe-content-type.mjs`).
- [x] `slug` is unique; `category` only accepts the four fixed values.
- [ ] At least one published recipe in each of the four categories.
      (2 published in `mains`; `sides`/`snacks`/`desserts` still to seed —
      candidates in `~/repos/personal/assistant/recipes/`.)
- [x] `RecipeFields` / `RecipeSkeleton` added to `src/types/contentful.ts`.
- [x] `CONTENTFUL.md` documents the new model.
- [x] `npm run lint`, type-check, and tests pass (pre-push hook).

## Notes

- **Why not rich text** for ingredients/method: long text with line-based rendering is
  the simplest thing that works and matches how travel content avoids rich-text
  complexity; can migrate to rich text later if formatting needs grow.
- The type was created with `scripts/create-recipe-content-type.mjs`. Note that
  `contentful-management` v12 uses the plain client API (no default export /
  `getSpace` chaining) — `create-locations.mjs` and `upload-to-contentful.mjs`
  have been migrated to it (read paths verified by dry-run; write paths get their
  first real exercise on the next upload).
- Out of scope: all site routes/UI (see `cookbook-routes-and-ui.md`), homepage
  cookbook teaser, any changes to travel content types.
