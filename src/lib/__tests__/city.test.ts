import { getCityPreviewPhoto } from "../city";
import { Asset, Entry } from "contentful";
import { CitySkeleton } from "@/types/contentful";

const makeAsset = (id: string): Asset =>
  ({
    sys: { id, type: "Asset" },
    fields: {
      title: id,
      file: { url: `//images.ctfassets.net/space/${id}.jpg` },
    },
    metadata: { tags: [] },
  }) as unknown as Asset;

const makeCity = (fields: Record<string, unknown>): Entry<CitySkeleton> =>
  ({
    sys: { id: "city-id", type: "Entry" },
    fields: { name: "Barcelona", slug: "barcelona", ...fields },
    metadata: { tags: [] },
  }) as unknown as Entry<CitySkeleton>;

describe("getCityPreviewPhoto", () => {
  const thumbnail = makeAsset("chosen-thumb");
  const firstPhoto = makeAsset("first-photo");
  const secondPhoto = makeAsset("second-photo");

  it("returns the thumbnail when set", () => {
    const city = makeCity({ thumbnail, photos: [firstPhoto, secondPhoto] });
    expect(getCityPreviewPhoto(city)).toBe(thumbnail);
  });

  it("falls back to the first gallery photo when no thumbnail", () => {
    const city = makeCity({ photos: [firstPhoto, secondPhoto] });
    expect(getCityPreviewPhoto(city)).toBe(firstPhoto);
  });

  it("returns the thumbnail even when the city has no photos", () => {
    const city = makeCity({ thumbnail, photos: [] });
    expect(getCityPreviewPhoto(city)).toBe(thumbnail);
  });

  it("returns null when there is no thumbnail and no photos", () => {
    expect(getCityPreviewPhoto(makeCity({ photos: [] }))).toBeNull();
    expect(getCityPreviewPhoto(makeCity({}))).toBeNull();
  });

  it("ignores an unresolved thumbnail link and falls back to photos[0]", () => {
    // Delivery API leaves unpublished/deleted asset links as bare Link objects.
    const unresolved = {
      sys: { id: "gone", type: "Link", linkType: "Asset" },
    } as unknown as Asset;
    const city = makeCity({ thumbnail: unresolved, photos: [firstPhoto] });
    expect(getCityPreviewPhoto(city)).toBe(firstPhoto);
  });
});
