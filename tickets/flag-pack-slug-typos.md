# Fix misspelled filenames in the flag pack

- **Type:** Chore · **Size:** S · **Depends on:** none

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
- [ ] `uzbekistn.png`, `kwait.png`, `malasya.png` renamed to match their country slugs.
- [ ] Full `assets/flags/` list audited for any other misspellings / stray duplicates.
- [ ] Renames done with `git mv` so history is preserved.
