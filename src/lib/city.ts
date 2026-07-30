import { Asset, Entry } from "contentful";
import { CitySkeleton } from "@/types/contentful";

/**
 * The photo representing a city on preview surfaces (country-page card,
 * homepage sections, link previews): the editor-chosen `thumbnail` when set,
 * otherwise the first gallery photo.
 *
 * An unresolved thumbnail link (unpublished/deleted asset) arrives from the
 * delivery API without `fields`, so it falls through to the gallery fallback.
 */
export function getCityPreviewPhoto(city: Entry<CitySkeleton>): Asset | null {
  const thumbnail = city.fields.thumbnail as unknown as Asset | undefined;
  const photos = (city.fields.photos as unknown as Asset[]) || [];

  if (thumbnail?.fields) return thumbnail;
  return photos[0] || null;
}
