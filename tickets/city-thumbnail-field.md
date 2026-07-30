# City content model: add optional `thumbnail` field for the country-page preview

**Type:** Task · **Status:** Done · **Area:** Contentful model + Travel pages

## Objective

Let each city choose which photo represents it on the country page (and anywhere else a
single "preview" image is shown), instead of always using the first photo in the gallery.

Add an optional **`thumbnail`** media field to the **city** content type. When set, it is
used as the city's preview image; when empty, behaviour is unchanged (`photos[0]`).

## Background / current state

- The preview photo is hardcoded to the first gallery photo in three places:
  - Country page city grid: `src/app/travel/[countrySlug]/page.tsx:118` (`previewPhoto: photos[0] || null`)
  - Homepage **Latest** / **Next up** sections: `src/app/page.tsx:60`
  - City page OG/Twitter image: `src/app/travel/[countrySlug]/[citySlug]/page.tsx:57`
- The only way to control the preview today is to reorder the `photos` array, which
  conflicts with curating the gallery's viewing order.
- `CityFields` is defined in `src/types/contentful.ts:21-28`; `CityCard`
  (`src/components/CityCard.tsx`) already accepts an arbitrary `previewPhoto` Asset, so it
  needs no changes.

## Technical Specifications

### Contentful (model change)

- Add field to the **city** content type: id `thumbnail`, name "Thumbnail", type **Media
  (single asset)**, **optional**, image-only validation.
- Help text: "Photo shown on the country page card (and link previews). Leave empty to use
  the first gallery photo."
- Do it via the Contentful web app, or a one-off script following the
  `scripts/create-recipe-content-type.mjs` pattern (contentful-management,
  `CONTENTFUL_PHOTO_UPLOADER_TOKEN`).
- The asset does **not** have to be one of the `photos` entries (Contentful can't validate
  that), but in practice it usually will be.

### Code

- `src/types/contentful.ts` — add `thumbnail?: Asset` to `CityFields`.
- Add a small helper (e.g. `getCityPreviewPhoto(city)` in `src/lib/`) returning
  `thumbnail || photos[0] || null`, and use it in all three call sites:
  - `src/app/travel/[countrySlug]/page.tsx` (city grid `previewPhoto`)
  - `src/app/page.tsx` (Latest / Next up `previewPhoto`)
  - `src/app/travel/[countrySlug]/[citySlug]/page.tsx` (OG/Twitter image — a set
    thumbnail is the city's representative photo, so link previews should match)
- `photoCount` / `isComingSoon` logic is untouched — it stays based on `photos.length`.

### Side effect worth keeping

A city with **no photos yet** but a `thumbnail` set will show that image beneath the
COMING SOON overlay (instead of the grey placeholder icon), on both the country page and
the homepage **Next up** teaser. This is desirable — teaser cards get real imagery.

## Acceptance Criteria

- [x] City content type has an optional image-only `thumbnail` media field
      (done 2026-07-30 via `scripts/add-city-thumbnail-field.mjs`).
- [x] Country page card shows `thumbnail` when set, `photos[0]` otherwise; cities with
      neither keep the placeholder icon.
- [x] Homepage Latest / Next up cards follow the same rule.
- [x] City page OG/Twitter image uses `thumbnail` when set, `photos[0]` otherwise.
- [x] Reordering the `photos` array no longer changes the preview for cities with a
      thumbnail set.
- [x] Gallery on the city page is unaffected (thumbnail is not injected/deduped there).
- [x] `npm run lint`, type-check, and tests pass (pre-push hook).

## Notes

- **Design choice:** a dedicated Asset field beats the alternatives — reordering `photos`
  (couples preview to gallery order) or a numeric index field (breaks silently when photos
  are reordered/removed).
- Existing entries need no backfill; the fallback preserves today's output exactly.
- Out of scope: country-level thumbnails on `/travel`, any `CityCard` visual changes.

## Testing

- Helper unit tests: thumbnail set → thumbnail; unset → `photos[0]`; neither → `null`.
- Update/extend page tests (`src/app/__tests__/page.test.tsx`,
  `src/app/travel/[countrySlug]/__tests__/page.test.tsx`,
  `[citySlug]/__tests__/page.test.tsx`) with a mocked city carrying a `thumbnail` to
  assert it wins over `photos[0]`, and one without to assert the fallback.
