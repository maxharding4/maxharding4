import type { Metadata } from "next";
import Link from "next/link";
import NavigationCard from "@/components/NavigationCard";

// Rendered inside the root layout (header/footer) and exported as /404.html,
// which CloudFront serves for any missing path.

export const metadata: Metadata = {
  title: "Page not found",
};

const SECTIONS = [
  {
    title: "Travel",
    description: "Photos from the cities and countries I've visited.",
    href: "/travel",
  },
  {
    title: "Cookbook",
    description: "Recipes I actually cook — mains, sides, snacks and desserts.",
    href: "/cookbook",
  },
  {
    title: "CV",
    description: "My work experience, skills and education.",
    href: "/cv",
  },
];

export default function NotFound() {
  return (
    <div className="min-h-screen page-canvas">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-12 max-w-2xl">
          <p className="font-display text-6xl font-bold text-accent-500 sm:text-7xl">
            404
          </p>
          <h1 className="heading-hero mt-2 text-gray-900">Off the map</h1>
          <p className="mt-4 text-lg text-gray-600">
            This page doesn&apos;t exist — it may have moved, or the link might be
            wrong.
          </p>
        </header>

        <section aria-labelledby="not-found-links">
          <h2
            id="not-found-links"
            className="mb-6 text-sm font-semibold uppercase tracking-wide text-gray-500"
          >
            Try one of these instead
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {SECTIONS.map((section) => (
              <NavigationCard key={section.href} {...section} />
            ))}
          </div>
        </section>

        <Link
          href="/"
          className="mt-10 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
        >
          <span aria-hidden="true" className="mr-2">
            ←
          </span>
          Back to home
        </Link>
      </div>
    </div>
  );
}
