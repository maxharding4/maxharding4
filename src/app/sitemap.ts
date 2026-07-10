import { MetadataRoute } from "next";
import { getEntriesByType } from "@/lib/contentful";
import { CountrySkeleton, CitySkeleton } from "@/types/contentful";
import { Entry } from "contentful";

// Emit as a static file at build time (required under `output: 'export'`).
export const dynamic = "force-static";

/**
 * Generate dynamic sitemap for the website
 * Includes static pages and dynamic country/city pages from Contentful
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://maxharding4.com";

  // Fetch all countries and cities from Contentful
  const [countriesResponse, citiesResponse] = await Promise.all([
    getEntriesByType<CountrySkeleton>("country"),
    getEntriesByType<CitySkeleton>("city"),
  ]);

  const countries = countriesResponse.items;
  const cities = citiesResponse.items;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/travel`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/photo-of-the-day`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.6,
    },
  ];

  // Dynamic country pages
  const countryPages: MetadataRoute.Sitemap = countries.map((country) => ({
    url: `${baseUrl}/travel/${country.fields.slug as unknown as string}`,
    lastModified: new Date(country.sys.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Dynamic city pages
  const cityPages: MetadataRoute.Sitemap = cities
    .filter((city) => {
      const country = city.fields.country as unknown as Entry<CountrySkeleton>;
      return country?.fields?.slug && city.fields.slug;
    })
    .map((city) => {
      const country = city.fields.country as unknown as Entry<CountrySkeleton>;
      const countrySlug = country.fields.slug as unknown as string;
      const citySlug = city.fields.slug as unknown as string;
      return {
        url: `${baseUrl}/travel/${countrySlug}/${citySlug}`,
        lastModified: new Date(city.sys.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      };
    });

  return [...staticPages, ...countryPages, ...cityPages];
}
