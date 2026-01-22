import { notFound } from "next/navigation";
import { getEntriesByType } from "@/lib/contentful";
import { CountrySkeleton, CitySkeleton } from "@/types/contentful";
import { Asset, Entry } from "contentful";
import Breadcrumb from "@/components/Breadcrumb";
import PhotoGallery from "@/components/PhotoGallery";

interface CityPageProps {
  params: Promise<{
    countrySlug: string;
    citySlug: string;
  }>;
}

// Generate static paths for all cities
export async function generateStaticParams() {
  const cities = await getEntriesByType<CitySkeleton>("city");

  return cities.items.map((city) => {
    const countrySlug = (
      city.fields.country as unknown as Entry<CountrySkeleton>
    ).fields.slug as unknown as string;
    const citySlug = city.fields.slug as unknown as string;

    return {
      countrySlug,
      citySlug,
    };
  });
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CityPageProps) {
  const { countrySlug, citySlug } = await params;

  const cities = await getEntriesByType<CitySkeleton>("city", {
    "fields.slug": citySlug,
    limit: 1,
  });

  const city = cities.items[0];

  if (!city) {
    return {
      title: "City Not Found",
    };
  }

  const name = city.fields.name as unknown as string;
  const country = city.fields.country as unknown as Entry<CountrySkeleton>;
  const countryName = country.fields.name as unknown as string;
  const description = city.fields.description as unknown as string | undefined;
  const photos = (city.fields.photos as unknown as Asset[]) || [];

  // Get first photo for Open Graph image
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const firstPhotoUrl = (photos[0] as any)?.fields?.file?.url as string | undefined;

  const metaDescription =
    description || `Explore ${photos.length} photos from ${name}, ${countryName}`;

  return {
    title: `${name}, ${countryName} | Travel Gallery`,
    description: metaDescription,
    openGraph: {
      title: `${name}, ${countryName} - Travel Gallery`,
      description: metaDescription,
      url: `/travel/${countrySlug}/${citySlug}`,
      type: "website",
      ...(firstPhotoUrl && {
        images: [
          {
            url: `https:${firstPhotoUrl}`,
            alt: `Photo from ${name}, ${countryName}`,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: `${name}, ${countryName} - Travel Gallery`,
      description: metaDescription,
      ...(firstPhotoUrl && {
        images: [`https:${firstPhotoUrl}`],
      }),
    },
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const { countrySlug, citySlug } = await params;

  // Fetch city by slug
  const cities = await getEntriesByType<CitySkeleton>("city", {
    "fields.slug": citySlug,
    limit: 1,
  });

  const city = cities.items[0];

  if (!city) {
    notFound();
  }

  const name = city.fields.name as unknown as string;
  const description = city.fields.description as unknown as string | undefined;
  const visitDate = city.fields.visitDate as unknown as string | undefined;
  const country = city.fields.country as unknown as Entry<CountrySkeleton>;
  const countryName = country.fields.name as unknown as string;
  const photos = (city.fields.photos as unknown as Asset[]) || [];

  // Verify country slug matches (security check)
  const actualCountrySlug = country.fields.slug as unknown as string;
  if (actualCountrySlug !== countrySlug) {
    notFound();
  }

  const breadcrumbItems = [
    { label: "Travel", href: "/travel" },
    { label: countryName, href: `/travel/${countrySlug}` },
    { label: name },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={breadcrumbItems} />

        {/* City Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {name}
          </h1>
          <p className="mt-2 text-lg text-gray-600">{countryName}</p>
          {description && (
            <p className="mt-4 text-base text-gray-600 max-w-2xl">
              {description}
            </p>
          )}
          {visitDate && (
            <p className="mt-2 text-sm text-gray-500">
              Visited: {new Date(visitDate).toLocaleDateString()}
            </p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            {photos.length} {photos.length === 1 ? "photo" : "photos"}
          </p>
        </header>

        {/* Photo Gallery */}
        {photos.length > 0 ? (
          <PhotoGallery photos={photos} cityName={name} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No photos available yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
