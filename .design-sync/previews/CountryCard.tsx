import { CountryCard } from "new-site";

// CountryCard takes a Contentful `Entry<CountrySkeleton>`. For previews we mock
// the minimal shape it actually reads (name, slug, flagImage.fields.file.url)
// and point the flag at the public flagcdn CDN so it renders a real flag.
const country = (name: string, slug: string, flagCode: string) =>
  ({
    sys: { id: slug },
    fields: {
      name,
      slug,
      flagImage: {
        fields: { file: { url: `//flagcdn.com/w640/${flagCode}.png` } },
      },
    },
  }) as never;

export const Spain = () => (
  <CountryCard country={country("Spain", "spain", "es")} cityCount={5} />
);

export const Brazil = () => (
  <CountryCard country={country("Brazil", "brazil", "br")} cityCount={3} />
);

export const SingleAlbum = () => (
  <CountryCard country={country("Japan", "japan", "jp")} cityCount={1} />
);
