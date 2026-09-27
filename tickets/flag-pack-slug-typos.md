# Fix misspelled filenames in the flag pack

- **Type:** Chore · **Size:** S · **Depends on:** none · **Status:** Done (2026-09-27)

**Context:**
`assets/flags/` (added in PR #24) is a slug-keyed flag pack. `scripts/create-locations.mjs`
auto-attaches `assets/flags/<countrySlug>.png` when it creates a country. A few files in the
pack are misspelled, so if a country with the correct slug is ever added, the lookup misses
and the country is created **without a flag** (and can't be published until one is attached)
— the script prints a warning rather than failing, so the miss is easy to overlook.

**Known misspelled files:**

| Current filename | Should be | Country |
|------------------|-----------|---------|
| `uzbekistn.png` | `uzbekistan.png` | Uzbekistan |
| `kwait.png` | `kuwait.png` | Kuwait |
| `malasya.png` | `malaysia.png` | Malaysia |

(There may be others — worth a quick pass over the full list against a canonical
country-name/slug source. `tuvalu-1.png` also looks like an accidental duplicate of
`tuvalu.png`.)

**Acceptance criteria:**
- [x] `uzbekistn.png`, `kwait.png`, `malasya.png` renamed to match their country slugs.
- [x] Full `assets/flags/` list audited for any other misspellings / stray duplicates.
- [x] Renames done with `git mv` so history is preserved.

## Outcome (2026-09-27)

Full audit of all 264 files. Every existing Contentful country slug already had a
matching file. Changes (all `git mv`, history preserved):

| Was | Now | Why |
|---|---|---|
| `kwait.png` | `kuwait.png` | typo |
| `malasya.png` | `malaysia.png` | typo |
| `uzbekistn.png` | `uzbekistan.png` | typo |
| `sao-tome-and-prince.png` | `sao-tome-and-principe.png` | typo |
| `marshall-island.png` | `marshall-islands.png` | plural |
| `cocos-island.png` | `cocos-islands.png` | plural |
| `northern-marianas-islands.png` | `northern-mariana-islands.png` | spelling |
| `republic-of-poland.png` | `poland.png` | slug a trip would actually use |
| `republic-of-macedonia.png` | `north-macedonia.png` | current name (2019) |
| `swaziland.png` | `eswatini.png` | current name (2018) |
| `tuvalu-1.png` | *(deleted)* | duplicate of `tuvalu.png` (differs only by compression noise) |

Left as-is (deliberate, not country slugs or already natural): `otan` (NATO),
`european-union`, `united-nations`, regional flags (`basque-country`, `corsica`,
`hawaii`, …), `czech-republic`, `east-timor`, `ivory-coast`, `st-barts`.

