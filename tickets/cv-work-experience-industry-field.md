# CV: add an `industry` (sector) field to work experience

**Type:** Task · **Status:** To Do · **Area:** Contentful model + `src/app/cv` · **Priority:** Low

## Objective

Let each work experience entry say which industry/sector the employer operates in
(e.g. "Fashion e-commerce", "Rail", "Energy"), and show it on the CV page next to the
company name. Reading a list of company names alone doesn't tell a visitor what kind of
businesses I've worked in; a short sector label does.

Add an optional **`industry`** text field to the **workExperience** content type and
render it on `ExperienceCard`. Entries without it render exactly as today.

## Background / current state

- `workExperience` fields today: `position`, `company`, `startDate`, `endDate`,
  `description`, `achievements` (Symbol[], 255 chars each), `technologies` (Symbol[]).
  There is **no** `location`, `currentRole`, or sector field (PR #75 removed the
  code's references to the first two, which never existed on the model).
- Type: `WorkExperienceFields` in `src/types/contentful.ts:110-118`.
- Mapping: `src/app/cv/page.tsx:118-127` builds the `ExperienceCard` props
  (`title` ← `position`, `subtitle` ← `company`, `current` ← `!endDate`, …).
- `ExperienceCard` (`src/components/ExperienceCard.tsx`) already has an unused
  right-hand slot in the header row: the optional `location` prop renders as a small
  grey line with a map-pin icon beside `subtitle`. Nothing passes `location` for work
  entries any more, so that slot is free.
- Previous model changes were done with a one-off contentful-management script:
  `scripts/add-city-thumbnail-field.mjs` (idempotent, `--dry-run`, uses
  `CONTENTFUL_PHOTO_UPLOADER_TOKEN`).

## Technical Specifications

### Contentful (model change)

- Add field to **workExperience**: id `industry`, name "Industry", type **Symbol**
  (short text), **optional**, `size: { max: 60 }`.
- Help text: "Sector the company operates in, e.g. Fashion e-commerce, Rail, Energy,
  Fintech. Keep it to a few words."
- Free text rather than a fixed dropdown: there are ~5 employers and the vocabulary
  will drift (a new job may not fit a predefined list). If it needs tightening later,
  an `in: [...]` validation can be added without a code change.
- Do it via a script `scripts/add-work-experience-industry-field.mjs` copied from the
  city-thumbnail one (same idempotency / dry-run / env conventions), or by hand in the
  web app. Field order: place it directly after `company`.
- Backfill: set `industry` on the existing entries (W&B, Eurostar, RDG, Cloud IQ,
  Bulb) and publish. Content edits only reach the live site via the manual deploy.

### Code

- `src/types/contentful.ts` — add `industry?: string` to `WorkExperienceFields`.
- `src/app/cv/page.tsx` — map `exp.fields.industry` through to the card.
- `src/components/ExperienceCard.tsx`:
  - Add an optional `industry?: string` prop (work entries only; education passes
    nothing).
  - Render it in the header row beside the company name as a small muted pill
    (same `bg-gray-100 text-gray-700 rounded text-xs` styling as the technology
    tags), so it reads as a category label rather than free prose. Don't reuse the
    map-pin `location` line — a pin icon on "Fashion e-commerce" is misleading.
  - Include it in the `aria-label` when present
    ("…: Head of Engineering at Wolf & Badger (Fashion e-commerce)").
- No change to `getEntriesByType` / fetching — the field arrives with the entry.

## Acceptance Criteria

- [ ] `workExperience` content type has an optional `industry` Symbol field
      (max 60 chars) with help text.
- [ ] All existing work experience entries have `industry` set and are published.
- [ ] CV page shows the industry pill next to the company name for entries that have
      one; entries without it render unchanged (no empty pill, no layout shift).
- [ ] Education cards are unaffected.
- [ ] Unit tests: `ExperienceCard` renders the pill when `industry` is passed and
      omits it otherwise; CV page test maps `fields.industry` through
      (`src/app/cv/__tests__/page.test.tsx`,
      `src/components/__tests__/ExperienceCard.test.tsx`).
- [ ] `npm run lint`, type-check, and tests pass (pre-push hook).
- [ ] Manual production deploy run after merge so the backfilled content goes live.

## Notes

- **Out of scope:** a sector filter/grouping on the CV page, an industry field on
  `education`, structured-data (JSON-LD) changes, reinstating `location`.
- Keep the label short and consistent across entries — it sits inline with the company
  name and wraps awkwardly past ~3 words on mobile.
