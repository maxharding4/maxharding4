# Personal Site — design system conventions

These are React components extracted from a Next.js 16 / React 19 app. They are
**presentational**: each renders from its props with no data fetching, no
client state, and **no provider or context wrapper** — render one directly and
it is fully styled.

## Styling idiom: Tailwind utility classes

Styling is **Tailwind CSS v4 utility classes** baked into the shipped
stylesheet — there are no CSS-in-JS props and no class-name props to pass. To
match the look in your own layout glue around these components, use the same
Tailwind families they use:

| Concern | Classes used by this DS |
|---|---|
| Surface / card | `rounded-lg`, `border`, `border-gray-200`, `bg-white`, `shadow-sm`, `hover:shadow-md` |
| Text | `text-gray-900` (headings), `text-gray-700` / `text-gray-600` / `text-gray-500` (body, muted) |
| Accent | `text-blue-600`, `bg-blue-50`, `border-blue-500`, `focus:ring-blue-500` |
| Pills / badges | `rounded-full`, `px-3 py-1`, `text-sm font-medium`, paired `bg-*-100 text-*-800` |
| Layout | `flex`, `grid`, `gap-2`/`gap-4`, `flex-wrap` |
| Decorative fills | `bg-gradient-to-br from-<color>-50 to-<color>-100` (NavigationCard) |

Spacing, color, and radius all come from the **default Tailwind v4 theme**, so
any standard Tailwind utility resolves. Brand color is **blue** for
interactive/active states; neutrals are the **gray** scale.

## Where the truth lives

- `styles.css` (and the `_ds_bundle.css` it `@import`s) — the full compiled
  utility set these components rely on. Read it before adding your own classes.
- `components/<group>/<Name>/<Name>.d.ts` — the exact props for each component.
- `components/<group>/<Name>/<Name>.prompt.md` — per-component usage notes.

## Links and images

`Breadcrumb` and `NavigationCard` take plain string `href` props and render
standard `<a>` elements (the original `next/link` is swapped for a plain anchor
in this bundle). There is no router — wire navigation however your app does.

`CityCard` and `CountryCard` are image-bearing: they take Contentful
`Entry<…>` objects and render their preview/flag image via `next/image`
(swapped for a plain `<img>` in this bundle). Pass the asset URL through the
entry's `fields.file.url`; the previews mock this with public CDN images.

## One idiomatic example

```tsx
import { NavigationCard, SkillsSection } from "<this design system>";

export function HomeLinks() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <NavigationCard
        title="Travel"
        description="Photo galleries from around the world."
        href="/travel"
        gradient="from-sky-50 to-indigo-100"
      />
      <NavigationCard
        title="CV"
        description="Experience, education, and skills."
        href="/cv"
      />
      <SkillsSection skills={["TypeScript", "React", "Next.js"]} />
    </div>
  );
}
```
