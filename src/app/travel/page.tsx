import { getEntriesByType } from "@/lib/contentful";
import { CountrySkeleton } from "@/types/contentful";
import TravelPageClient from "./TravelPageClient";

// Note: revalidate has no effect with static export (output: 'export')
// Content is fetched at build time only. Run 'npm run build' to update.

export default async function TravelPage() {
  // Fetch all countries from Contentful, sorted alphabetically
  const countries = await getEntriesByType<CountrySkeleton>("country", {
    order: ["fields.name"],
  });

  return <TravelPageClient countries={countries.items} />;
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
