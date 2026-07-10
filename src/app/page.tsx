import { getEntriesByType } from "@/lib/contentful";
import { CitySkeleton, PageSkeleton } from "@/types/contentful";
import CityCard from "@/components/CityCard";
import { Asset } from "contentful";
import Link from "next/link";
import { Metadata } from "next";

// Number of cards shown in each homepage travel section.
const NEXT_UP_LIMIT = 2;
// Latest fills up to two full rows on desktop. LATEST_COLS matches the desktop
// grid so the count is trimmed to complete rows — never a lone orphan card.
const LATEST_MAX = 6;
const LATEST_COLS = 3;

interface HomeCity {
  city: import("contentful").Entry<CitySkeleton>;
  countrySlug: string;
  previewPhoto: Asset | null;
  photoCount: number;
  visitTime: number | null;
}

/**
 * Fetch every city, resolve its country, and split into the two homepage
 * sections. All date logic is evaluated at build time (static export):
 *   - Next up: coming-soon cities (no photos) with a future visitDate, soonest first.
 *   - Latest:  photographed cities, most recently visited first.
 * A city with a past visitDate but no photos (upload backlog) lands in neither.
 */
async function getHomeCities(): Promise<{ nextUp: HomeCity[]; latest: HomeCity[] }> {
  try {
    // include: 2 resolves the country reference (for the href slug) and its flag asset.
    const cities = await getEntriesByType<CitySkeleton>("city", { include: 2 });
    const now = Date.now();

    const enriched: HomeCity[] = cities.items
      .map((city) => {
        const photos = (city.fields.photos as unknown as Asset[]) || [];
        const country = city.fields.country as unknown as
          | { fields?: { slug?: string } }
          | undefined;
        const countrySlug = country?.fields?.slug;
        const visitDate = city.fields.visitDate as unknown as string | undefined;
        const parsed = visitDate ? new Date(visitDate).getTime() : NaN;

        return {
          city,
          countrySlug: countrySlug ?? "",
          previewPhoto: photos[0] || null,
          photoCount: photos.length,
          visitTime: Number.isNaN(parsed) ? null : parsed,
        };
      })
      // Skip orphaned cities whose country can't be resolved — no valid href.
      .filter((c) => c.countrySlug);

    const nextUp = enriched
      .filter((c) => c.photoCount === 0 && c.visitTime !== null && c.visitTime > now)
      .sort((a, b) => (a.visitTime as number) - (b.visitTime as number)) // soonest first
      .slice(0, NEXT_UP_LIMIT);

    const latestSorted = enriched
      .filter((c) => c.photoCount > 0)
      // Most recent first; cities without a visitDate sort last.
      .sort((a, b) => (b.visitTime ?? -Infinity) - (a.visitTime ?? -Infinity));

    // Trim to complete rows so the desktop grid never leaves an orphan card
    // (e.g. 4 cities → show 3). With fewer than one full row, show them all.
    const latestCount =
      latestSorted.length >= LATEST_COLS
        ? Math.min(LATEST_MAX, Math.floor(latestSorted.length / LATEST_COLS) * LATEST_COLS)
        : latestSorted.length;
    const latest = latestSorted.slice(0, latestCount);

    return { nextUp, latest };
  } catch (error) {
    console.error("Error fetching home cities:", error);
    return { nextUp: [], latest: [] };
  }
}

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  try {
    const pages = await getEntriesByType<PageSkeleton>("page", {
      "fields.slug": "home",
      limit: 1,
    });

    const homePage = pages.items[0];
    const title = (homePage?.fields.title as unknown as string) || "Max Harding - Personal Website";
    const description =
      (homePage?.fields.metaDescription as unknown as string) ||
      "Personal website and portfolio of Max Harding - Lead QA Engineer and Travel Photographer";

    // Get ogImage from Contentful if available
    const ogImage = homePage?.fields.ogImage;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ogImageUrl = (ogImage as any)?.fields?.file?.url as string | undefined;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: "/",
        type: "website",
        ...(ogImageUrl && {
          images: [
            {
              url: `https:${ogImageUrl}`,
              width: 1200,
              height: 630,
              alt: title,
            },
          ],
        }),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        ...(ogImageUrl && {
          images: [`https:${ogImageUrl}`],
        }),
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Max Harding - Personal Website",
      description: "Personal website and portfolio of Max Harding - Lead QA Engineer and Travel Photographer",
    };
  }
}

export default async function HomePage() {
  // Fetch home page content from Contentful
  let homePage;
  let introContent = "Welcome to my personal website. I'm a Lead QA Engineer with a passion for travel photography, exploring the intersection of technology and creativity.";

  try {
    const pages = await getEntriesByType<PageSkeleton>("page", {
      "fields.slug": "home",
      limit: 1,
    });
    homePage = pages.items[0];

    // Use metaDescription as intro content (plain text approach)
    if (homePage?.fields.metaDescription) {
      introContent = homePage.fields.metaDescription as unknown as string;
    }
  } catch (error) {
    console.error("Error fetching home page:", error);
    // Continue with fallback content
  }

  // WebPage structured data
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://www.maxharding4.com/#webpage",
    url: "https://www.maxharding4.com",
    name: "Max Harding - Personal Website",
    description: introContent,
    isPartOf: {
      "@id": "https://www.maxharding4.com/#website",
    },
    about: {
      "@id": "https://www.maxharding4.com/#person",
    },
  };

  // Latest / next-up travel content for the homepage sections.
  const { nextUp, latest } = await getHomeCities();

  return (
    <div className="min-h-screen page-canvas">
      {/* WebPage Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        {/* Hero Section */}
        <header className="pb-6 sm:pb-8 text-center">
          {/* Name is already in the nav, so it lives here only for SEO /
              screen readers; the eyebrow carries the visible hero. */}
          <h1 className="sr-only">Max Harding</h1>
          <p className="mb-4 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Lead QA Engineer · Travel Photographer
          </p>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            {introContent}
          </p>
        </header>

        {/* Next Up: upcoming, not-yet-photographed cities. Hidden when empty. */}
        {nextUp.length > 0 && (
          <section
            aria-labelledby="next-up-heading"
            className="pt-4 pb-8 sm:pt-6 sm:pb-10 max-w-5xl mx-auto"
          >
            <h2
              id="next-up-heading"
              className="mb-4 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-gray-500"
            >
              Next up
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {nextUp.map(({ city, countrySlug, previewPhoto, photoCount }) => (
                <CityCard
                  key={city.sys.id}
                  city={city}
                  countrySlug={countrySlug}
                  previewPhoto={previewPhoto}
                  photoCount={photoCount}
                />
              ))}
            </div>
          </section>
        )}

        {/* Latest: most recently visited cities with photos. */}
        <section
          aria-labelledby="latest-heading"
          className="pt-4 pb-8 sm:pt-6 sm:pb-12 lg:pb-16 max-w-5xl mx-auto"
        >
          <div className="mb-4 flex items-baseline justify-between">
            <h2
              id="latest-heading"
              className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-blue-600"
            >
              Latest
            </h2>
            <Link
              href="/travel"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              View all &rarr;
            </Link>
          </div>

          {latest.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map(({ city, countrySlug, previewPhoto, photoCount }) => (
                <CityCard
                  key={city.sys.id}
                  city={city}
                  countrySlug={countrySlug}
                  previewPhoto={previewPhoto}
                  photoCount={photoCount}
                />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-gray-500">
              Photos coming soon.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
