import { CityCard } from "maxharding4";

// CityCard takes a Contentful `Entry<CitySkeleton>` plus an optional preview
// `Asset`. We mock the minimal shapes it reads (city.fields.name/slug and
// previewPhoto.fields.file.url) and use the public picsum CDN for a real photo.
const city = (name: string, slug: string) =>
  ({ sys: { id: slug }, fields: { name, slug } }) as never;

const photo = (seed: string) =>
  ({ fields: { file: { url: `//picsum.photos/seed/${seed}/640/480` } } }) as never;

export const WithPhotos = () => (
  <CityCard
    city={city("Málaga", "malaga")}
    countrySlug="spain"
    previewPhoto={photo("malaga")}
    photoCount={12}
  />
);

export const SinglePhoto = () => (
  <CityCard
    city={city("Kyoto", "kyoto")}
    countrySlug="japan"
    previewPhoto={photo("kyoto")}
    photoCount={1}
  />
);

// photoCount === 0 renders the non-clickable "COMING SOON" state.
export const ComingSoon = () => (
  <CityCard
    city={city("Pantanal", "pantanal")}
    countrySlug="brazil"
    previewPhoto={null}
    photoCount={0}
  />
);
