import { getEntriesByType } from "@/lib/contentful";
import { PageSkeleton } from "@/types/contentful";
import NavigationCard from "@/components/NavigationCard";
import { Metadata } from "next";

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

  // Navigation sections data
  const navigationSections = [
    {
      title: "Professional CV",
      description: "View my work experience, skills, and professional background",
      href: "/cv",
      gradient: "from-blue-50 to-blue-100",
    },
    {
      title: "Travel Gallery",
      description: "Explore photos and stories from my adventures around the world",
      href: "/travel",
      gradient: "from-amber-50 to-orange-100",
    },
  ];

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

        {/* Navigation Cards Section */}
        <section className="pt-4 pb-8 sm:pt-6 sm:pb-12 lg:pt-8 lg:pb-16 max-w-4xl mx-auto">
          <h2 className="sr-only">Explore</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {navigationSections.map((section) => (
              <NavigationCard
                key={section.href}
                title={section.title}
                description={section.description}
                href={section.href}
                gradient={section.gradient}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
