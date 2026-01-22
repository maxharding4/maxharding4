import { getEntriesByType } from "@/lib/contentful";
import { CountrySkeleton, CitySkeleton } from "@/types/contentful";
import TravelPageClient from "./TravelPageClient";

// Note: revalidate has no effect with static export (output: 'export')
// Content is fetched at build time only. Run 'npm run build' to update.

export default async function TravelPage() {
  // Fetch all countries from Contentful, sorted alphabetically
  const countries = await getEntriesByType<CountrySkeleton>("country", {
    order: ["fields.name"],
  });

  // Fetch city counts for each country
  const countriesWithCityCounts = await Promise.all(
    countries.items.map(async (country) => {
      const cities = await getEntriesByType<CitySkeleton>("city", {
        "fields.country.sys.id": country.sys.id,
      });
      return {
        country,
        cityCount: cities.total,
      };
    })
  );

  return <TravelPageClient countriesWithCityCounts={countriesWithCityCounts} />;
}

// Generate metadata for SEO
export async function generateMetadata() {
  const countries = await getEntriesByType<CountrySkeleton>("country");
  const description = `Explore my travel photography from ${countries.items.length} countries around the world. View photos and stories from my adventures.`;

  return {
    title: "Travel Gallery | My Adventures Around the World",
    description,
    openGraph: {
      title: "Travel Gallery | My Adventures Around the World",
      description,
      url: "/travel",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Travel Gallery | My Adventures Around the World",
      description,
    },
  };
}
