# Give card links an accessible name (screen readers announce just "link")

**Type:** Bug · **Status:** In Review · **Area:** `src/components` (cards) · **Priority:** Medium

## Problem

Every card on the site wraps its content in an `<article>` *inside* the `<Link>`.
Browsers don't compute a link's accessible name from content inside an `<article>`,
so these links have **no accessible name**: a screen reader announces each one as
just "link", and voice-control users can't target them by name.

Found while writing E2E tests for the 404 page (PR #90), where
`getByRole("link", { name: … })` couldn't find the `NavigationCard` links. That PR
fixed `NavigationCard` only (`aria-label={title}`).

## Current state (2026-09-27, measured on a static build)

| Component | Page checked | Nameless links |
|---|---|---|
| `CountryCard` | `/travel/` | 28 / 28 |
| `CityCard` | `/travel/austria/` | 2 / 2 |
| `CategoryCard` | `/cookbook/` | 3 / 3 |
| `RecipeCard` | `/cookbook/mains/` | 27 / 27 |
| Homepage "Latest" (`CityCard`) | `/` | 6 / 7 |

`CategoryCard` and `CityCard` already set an `aria-label` on their **non-link**
"coming soon" state — only the linked state is missing one.

The existing E2E tests locate these links by `href`
(`locator('a[href^="/cookbook/mains"]')`), which is why this was never caught.

## Technical Specifications

1. Add an accessible name to the `<Link>` in each of `CountryCard`, `CityCard`,
   `CategoryCard` and `RecipeCard`. Two options:
   - **`aria-label`** with the visible title (matches the `NavigationCard` fix and
     satisfies WCAG 2.5.3 "label in name"), optionally richer, e.g.
     `"Graz, Austria"` / `"Cottage Pie recipe"`; **or**
   - replace the inner `<article>` with a `<div>` so the name comes from content —
     simpler markup, but a long, noisy name (title + description + counts).
   Prefer `aria-label` for consistency with `NavigationCard`.
2. Unit test per card: `getByRole("link", { name: … })` finds it.
3. Switch the E2E cookbook/travel tests from `href` locators to
   `getByRole("link", { name })` where practical, so a regression fails E2E.

## Acceptance Criteria

- [x] All four card components' links have an accessible name containing the
      visible title.
- [x] Re-running the audit above reports 0 nameless card links on each page.
- [x] Unit tests cover the name for each card.
- [x] At least one E2E test per section (travel, cookbook) locates a card link by
      role + name.
- [x] `npm run lint`, type-check, and tests pass.

## Notes

- Frontend-only; needs a deploy to go live.
- The audit: serve the static export (`npx serve out`) and, for each card link,
  check `getByRole("link", { name: /\S/ })` matches it.

## Outcome

`aria-label` with the visible title on the `<Link>` in `CountryCard`, `CityCard`,
`CategoryCard` and `RecipeCard` (same approach as `NavigationCard`). Also fixed the
axe `heading-order` finding on `/travel/`: `CountryCard`'s title was the only card
title using `<h3>` (directly under the page `<h1>`); now `<h2>` like the others.
Unit tests per card (new `CategoryCard.test.tsx`); E2E travel + cookbook specs now
locate cards by role + name, including an Austria → Graz drill-down.

