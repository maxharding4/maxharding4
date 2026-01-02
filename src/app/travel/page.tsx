import { getEntriesByType } from "@/lib/contentful";
import { CountrySkeleton } from "@/types/contentful";
import CountryCard from "@/components/CountryCard";
import { Entry } from "contentful";

export const revalidate = 3600; // Revalidate every hour

export default async function TravelPage() {
  // Fetch all countries from Contentful, sorted alphabetically
  const countries = await getEntriesByType<CountrySkeleton>("country", {
    order: ["fields.name"] as unknown as string[],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Page Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Travel Gallery
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Explore my adventures around the world. Click on a country to see photos and stories
            from my travels.
          </p>
        </header>

        {/* Countries Grid */}
        {countries.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {countries.items.map((country: Entry<CountrySkeleton>) => (
              <CountryCard key={country.sys.id} country={country} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No countries available yet. Check back soon!</p>
          </div>
        )}

        {/* Country Count */}
        {countries.items.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              {countries.items.length} {countries.items.length === 1 ? "country" : "countries"}{" "}
              visited
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata() {
  const countries = await getEntriesByType<CountrySkeleton>("country");

  return {
    title: "Travel Gallery | My Adventures Around the World",
    description: `Explore my travel photography from ${countries.items.length} countries around the world. View photos and stories from my adventures.`,
    openGraph: {
      title: "Travel Gallery",
      description: "Explore my adventures around the world",
      type: "website",
    },
  };
}
