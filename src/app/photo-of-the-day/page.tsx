import { getEntriesByType } from "@/lib/contentful";
import { CitySkeleton, CountrySkeleton } from "@/types/contentful";
import PhotoOfTheDay, { PhotoOfTheDayCity } from "@/components/PhotoOfTheDay";
import { Asset, Entry } from "contentful";
import { Metadata } from "next";

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  const title = "Daily Photo | Max Harding";
  const description =
    "A photo from my travels around the world, picked at random on each visit.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: "/photo-of-the-day",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PhotoOfTheDayPage() {
  // Fetch cities with photos for the Photo of the Day component
  let citiesWithPhotos: PhotoOfTheDayCity[] = [];
  try {
    const cityEntries = await getEntriesByType<CitySkeleton>("city", {
      include: 2,
    });
    citiesWithPhotos = cityEntries.items
      .filter((city) => {
        const photos = city.fields.photos as unknown as Asset[];
        return photos?.length > 0;
      })
      .map((city) => {
        const photos = city.fields.photos as unknown as Asset[];
        const country = city.fields.country as unknown as Entry<CountrySkeleton>;
        return {
          cityName: city.fields.name as unknown as string,
          citySlug: city.fields.slug as unknown as string,
          cityDescription: city.fields.description as unknown as
            | string
            | undefined,
          countryName: country?.fields?.name as unknown as string,
          countrySlug: country?.fields?.slug as unknown as string,
          photos: photos
            .map((photo): { url: string; title?: string } | null => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const fileUrl = (photo.fields as any)?.file?.url as
                | string
                | undefined;
              if (!fileUrl) return null;
              return {
                url: `https:${fileUrl}`,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                title: (photo.fields as any)?.title as string | undefined,
              };
            })
            .filter((p): p is { url: string; title?: string } => p !== null),
        };
      })
      .filter(
        (city) => city.countrySlug && city.citySlug && city.photos.length > 0
      );
  } catch (error) {
    console.error("Error fetching cities for Photo of the Day:", error);
    // Continue with empty array — component will not render
  }

  return (
    <div className="min-h-screen page-canvas">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-16">
        {/* Visible title lives in the PhotoOfTheDay component (its "Photo of
            the Day" h2); this sr-only h1 gives the page a valid heading root. */}
        <h1 className="sr-only">Daily Photo</h1>
        <PhotoOfTheDay cities={citiesWithPhotos} />
      </div>
    </div>
  );
}
