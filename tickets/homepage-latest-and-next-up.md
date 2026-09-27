# Homepage: replace nav cards with "Next up" + "Latest" travel sections

**Type:** Task · **Status:** Done (PR #66) · **Area:** Homepage (`src/app/page.tsx`)

## Objective

Retire the two static `NavigationCard`s on the homepage and replace them with two
content-driven travel sections:

- **Next up** — a small teaser of upcoming (unphotographed, future-dated) cities.
- **Latest** — the most recently visited cities that actually have photos.

The homepage should feel alive — surfacing new photography automatically as content is
added — instead of showing a fixed table of contents that never changes.

## Background / current state

- `src/app/page.tsx` renders a hero followed by two `NavigationCard`s (CV + Travel Gallery,
  `page.tsx:100-113`). These are pure navigation and never change.
- CV and Travel both already live in the persistent header (`Header.tsx:47-48`), so removing
  the homepage cards strands **no** navigation.
- "Coming soon" is defined as **no photos**, not a future date: `CityCard.tsx:21`
  (`const isComingSoon = photoCount === 0`). `CityCard` already renders both the coming-soon
  overlay and the photo-count badge, so both new sections reuse it as-is.
- City photo data is derived exactly as on the country page (`travel/[countrySlug]/page.tsx:113-118`):
  `photoCount = city.fields.photos.length`, `previewPhoto = photos[0]`.
- Cities carry an optional `visitDate` (`types/contentful.ts:26`) and a `country` reference.
- The site is **static-exported** — all date logic is evaluated at build time.

## Technical Specifications

### Data (server component, build time)

Fetch all cities across every country and derive per-city data:

```ts
const cities = await getEntriesByType<CitySkeleton>("city", {
  include: 2, // resolve the country reference for slug + href
});

const enriched = cities.items
  .map((city) => {
    const photos = (city.fields.photos as unknown as Asset[]) || [];
    const country = city.fields.country; // Entry<CountrySkeleton>, resolved via include
    return {
      city,
      countrySlug: country?.fields?.slug as string | undefined,
      previewPhoto: photos[0] || null,
      photoCount: photos.length,
      visitDate: city.fields.visitDate as string | undefined,
    };
  })
  .filter((c) => c.countrySlug); // guard orphaned country refs (can't build a href)
```

### Section rules

| Section  | Filter                                             | Order                       | Take |
|----------|----------------------------------------------------|-----------------------------|------|
| Next up  | `photoCount === 0` **and** `visitDate` in the future | `visitDate` **ascending**   | 2    |
| Latest   | `photoCount > 0`                                   | `visitDate` **descending**  | up to 6 |

**Latest count — trim to complete rows.** The desktop grid is 3 columns, so the
count is trimmed to a multiple of 3 (max 6) to avoid a lone orphan card:
4 or 5 cities → show 3; 6+ → show 6. Below one full row (1–2 cities) show them all.
`LATEST_MAX = 6`, `LATEST_COLS = 3`.

- "In the future" = `new Date(visitDate) > now`, evaluated at build time. Cities with no
  `visitDate` cannot qualify for **Next up** (excluded).
- For **Latest**, cities missing `visitDate` sort last (treat as oldest).
- Both sections render `CityCard` (`countrySlug`, `previewPhoto`, `photoCount`). No new component.

### Layout

```
HERO (unchanged)
NEXT UP   — section heading, 2 CityCards. Entire section hidden if empty.
LATEST    — section heading + "View all →" link to /travel, 4 CityCards.
```

- Reuse the existing grid styling from the country page's city grid for visual consistency.
- **Next up** is hidden entirely when there are no qualifying cities (no empty header).
- **Latest** empty state (brand-new site, zero photographed cities): show a gentle
  "Photos coming soon" line in place of the card grid rather than hiding the section.

### Files

- `src/app/page.tsx` — remove `navigationSections` + `NavigationCard` usage; add the two sections and the fetch/partition logic above.
- `src/app/__tests__/page.test.tsx` — update (assertions currently target the nav cards).
- `src/components/NavigationCard.tsx` — leave in place for now (no longer used by the homepage; remove in a follow-up only if nothing else references it).

## Acceptance Criteria

- [ ] Two `NavigationCard`s no longer render on the homepage; hero is unchanged.
- [ ] **Next up** shows up to 2 coming-soon cities (`photoCount === 0`, future `visitDate`), soonest first.
- [ ] **Next up** is fully hidden when no city qualifies.
- [ ] **Latest** shows up to 6 photographed cities (`photoCount > 0`), most recent `visitDate` first, trimmed to complete rows of 3 (no orphan card).
- [ ] **Latest** shows a "Photos coming soon" line when no photographed cities exist.
- [ ] **Latest** includes a "View all →" link to `/travel`.
- [ ] A city with a past `visitDate` and no photos appears in neither section.
- [ ] Cities with an unresolved/missing country reference are skipped (no broken hrefs).
- [ ] `npm run lint`, type-check, and tests pass (pre-push hook).

## Notes

- **Static-export caveat:** the "future" check freezes at build time, so a trip doesn't
  auto-move Next up → Latest when its date passes. That transition is really driven by
  *adding photos and redeploying* (which flips `isComingSoon`), so the frozen date only
  affects the soft teaser — acceptable, not worth engineering around.
- **Counts:** Next up = 2; Latest = up to 6, trimmed to complete rows of 3. Tweakable via `NEXT_UP_LIMIT` / `LATEST_MAX` / `LATEST_COLS`.
- **Cookbook section** discussed earlier is out of scope — no such content type exists yet.
- Out of scope: deleting `NavigationCard`, any new content model, changes to `/travel`.

## Testing

- Unit-test `HomePage` with mocked Contentful cities covering: ordering (asc for Next up,
  desc for Latest), the photoCount filter split, both empty states, and the orphaned-country guard.
