import { notFound } from "next/navigation";
import Image from "next/image";
import { getEntriesByType } from "@/lib/contentful";
import { CountrySkeleton, CitySkeleton } from "@/types/contentful";
import CityCard from "@/components/CityCard";
import Breadcrumb from "@/components/Breadcrumb";
import { Asset, Entry } from "contentful";

interface CountryPageProps {
  params: Promise<{
    countrySlug: string;
  }>;
}

// Generate static paths for all countries
export async function generateStaticParams() {
  const countries = await getEntriesByType<CountrySkeleton>("country");

  return countries.items.map((country) => ({
    countrySlug: country.fields.slug as unknown as string,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CountryPageProps) {
  const { countrySlug } = await params;

  const countries = await getEntriesByType<CountrySkeleton>("country", {
    "fields.slug": countrySlug,
    limit: 1,
  });

  const country = countries.items[0];

  if (!country) {
    return {
      title: "Country Not Found",
    };
  }

  const name = country.fields.name as unknown as string;
  const description = country.fields.description as unknown as string | undefined;
  const flagImage = country.fields.flagImage;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flagImageUrl = (flagImage as any)?.fields?.file?.url as string | undefined;

  const metaDescription = description || `Explore photos from ${name}`;

  return {
    title: `${name} | Travel Gallery`,
    description: metaDescription,
    openGraph: {
      title: `${name} - Travel Gallery`,
      description: metaDescription,
      url: `/travel/${countrySlug}`,
      type: "website",
      ...(flagImageUrl && {
        images: [
          {
            url: `https:${flagImageUrl}`,
            alt: `${name} flag`,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} - Travel Gallery`,
      description: metaDescription,
      ...(flagImageUrl && {
        images: [`https:${flagImageUrl}`],
      }),
    },
  };
}

// City with photo data for display
interface CityWithPhotos {
  city: Entry<CitySkeleton>;
  previewPhoto: Asset | null;
  photoCount: number;
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { countrySlug } = await params;

  // Fetch country by slug
  const countries = await getEntriesByType<CountrySkeleton>("country", {
    "fields.slug": countrySlug,
    limit: 1,
  });

  const country = countries.items[0];

  if (!country) {
    notFound();
  }

  const name = country.fields.name as unknown as string;
  const description = country.fields.description as unknown as string | undefined;
  const flagImage = country.fields.flagImage;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flagImageUrl = (flagImage as any)?.fields?.file?.url as string | undefined;

  // Fetch cities for this country
  const cities = await getEntriesByType<CitySkeleton>("city", {
    "fields.country.sys.id": country.sys.id,
    order: ["fields.name"],
  });

  // For each city, extract photo data from the city object
  const citiesWithPhotos: CityWithPhotos[] = cities.items.map((city) => {
    const photos = (city.fields.photos as unknown as Asset[]) || [];

    return {
      city,
      previewPhoto: photos[0] || null,
      photoCount: photos.length,
    };
  });

  const breadcrumbItems = [
    { label: "Travel", href: "/travel" },
    { label: name },
  ];

  // BreadcrumbList JSON-LD structured data
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Travel",
        item: "https://www.maxharding4.com/travel",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: name,
        item: `https://www.maxharding4.com/travel/${countrySlug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Country Header */}
        <header className="mb-12">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-6">
            {/* Flag Image */}
            {flagImageUrl && (
              <div className="relative h-24 w-36 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                <Image
                  src={`https:${flagImageUrl}`}
                  alt={`${name} flag`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <div>
              <h1 className="heading-hero text-gray-900">
                {name}
              </h1>
              {description && (
                <p className="mt-4 text-lg text-gray-600 max-w-2xl">
                  {description}
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Cities Section */}
        <section>
          <h2 className="sr-only">Cities in {name}</h2>

          {citiesWithPhotos.length > 0 ? (
            <>
              <p className="mb-6 text-sm text-gray-500">
                {citiesWithPhotos.length}{" "}
                {citiesWithPhotos.length === 1 ? "city" : "cities"} to explore
              </p>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {citiesWithPhotos.map(({ city, previewPhoto, photoCount }) => (
                  <CityCard
                    key={city.sys.id}
                    city={city}
                    countrySlug={countrySlug}
                    previewPhoto={previewPhoto}
                    photoCount={photoCount}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No cities added yet. Check back soon!
              </p>
            </div>
          )}
        </section>

        {/* City Count Footer */}
        {citiesWithPhotos.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              {citiesWithPhotos.reduce((sum, c) => sum + c.photoCount, 0)} photos
              across {citiesWithPhotos.length}{" "}
              {citiesWithPhotos.length === 1 ? "city" : "cities"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
